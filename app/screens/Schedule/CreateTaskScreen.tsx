import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ScheduleImportAPI, { ScheduleImportTemplate } from '../../api/schedule-import.api';
import { Button, Card } from '../../components/common';
import { Colors, Typography } from '../../constants';

export default function CreateTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState('Medium');
  const [reminder, setReminder] = useState('15 minutes before');
  
  // CSV Import states
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [templates, setTemplates] = useState<ScheduleImportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleImportTemplate | null>(null);
  const [csvFile, setCsvFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [importing, setImporting] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const categories = ['Work', 'Personal', 'Health', 'Education', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const reminders = ['None', '5 minutes before', '15 minutes before', '30 minutes before', '1 hour before', '1 day before'];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await ScheduleImportAPI.getTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleCreateTask = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    Alert.alert(
      'Success',
      'Task created successfully!',
      [{
        text: 'OK', onPress: () => {
          setTitle('');
          setDescription('');
          setDate(new Date());
          setTime(new Date());
          setCategory('Work');
          setPriority('Medium');
          setReminder('15 minutes before');
        }
      }]
    );
  };

  const handleDownloadTemplate = async (templateId: number) => {
    try {
      Alert.alert(
        'Download Template',
        'Choose download type:',
        [
          {
            text: 'Empty Template',
            onPress: () => downloadTemplateFile(templateId, 'template'),
          },
          {
            text: 'Sample Data',
            onPress: () => downloadTemplateFile(templateId, 'sample'),
          },
          {
            text: 'Instructions',
            onPress: () => downloadTemplateFile(templateId, 'instructions'),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to download template');
    }
  };

  const downloadTemplateFile = async (templateId: number, type: 'template' | 'sample' | 'instructions') => {
    try {
      let blob: Blob;
      let fileName: string;
      
      switch (type) {
        case 'template':
          blob = await ScheduleImportAPI.downloadTemplate(templateId);
          fileName = `schedule_template_${templateId}.csv`;
          break;
        case 'sample':
          blob = await ScheduleImportAPI.downloadSample(templateId);
          fileName = `schedule_sample_${templateId}.csv`;
          break;
        case 'instructions':
          blob = await ScheduleImportAPI.downloadInstructions(templateId);
          fileName = `schedule_instructions_${templateId}.pdf`;
          break;
      }

      // Convert blob to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64data = reader.result as string;
        const fileUri = (FileSystem as any).documentDirectory + fileName;
        
        // Write the file
        await (FileSystem as any).writeAsStringAsync(fileUri, base64data.split(',')[1], {
          encoding: (FileSystem as any).EncodingType.Base64,
        });
        
        // Share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Success', `File saved to: ${fileUri}`);
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const handlePickCSVFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        setCsvFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick CSV file');
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile || !selectedTemplate) {
      Alert.alert('Error', 'Please select a template and CSV file');
      return;
    }

    try {
      setImporting(true);
      
      const formData = new FormData();
      formData.append('import_type', 'file_upload');
      formData.append('source_type', 'csv');
      formData.append('template_id', selectedTemplate.id.toString());
      formData.append('file', {
        uri: csvFile.uri,
        type: csvFile.mimeType || 'text/csv',
        name: csvFile.name,
      } as any);

      const response = await ScheduleImportAPI.importCSV(formData);
      
      if (response.success) {
        Alert.alert(
          'Import Started',
          `CSV import has been started. Import ID: ${response.data.id}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowCSVModal(false);
                setCsvFile(null);
                setSelectedTemplate(null);
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Import failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Tạo nhiệm vụ mới</Text>
          <Text style={styles.subtitle}>Thêm một nhiệm vụ mới vào lịch trình của bạn</Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tiêu đề nhiệm vụ *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Nhập tiêu đề nhiệm vụ"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Sự miêu tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Nhập mô tả nhiệm vụ"
              placeholderTextColor={Colors.text.tertiary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Ngày</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateTimeText}>📅 {date.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Thời gian</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateTimeText}>🕐 {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Loại</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    category === cat && styles.chipSelected,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === cat && styles.chipTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Sự ưu tiên</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((prio) => (
                <TouchableOpacity
                  key={prio}
                  style={[
                    styles.priorityButton,
                    priority === prio && styles.priorityButtonSelected,
                    priority === prio && { backgroundColor: getPriorityColor(prio) },
                  ]}
                  onPress={() => setPriority(prio)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === prio && styles.priorityTextSelected,
                    ]}
                  >
                    {prio}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Lời nhắc nhở</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {reminders.map((rem) => (
                <TouchableOpacity
                  key={rem}
                  style={[
                    styles.chip,
                    reminder === rem && styles.chipSelected,
                  ]}
                  onPress={() => setReminder(rem)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      reminder === rem && styles.chipTextSelected,
                    ]}
                  >
                    {rem}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Tạo nhiệm vụ"
            onPress={handleCreateTask}
            style={styles.createButton}
          />
          <Button
            title="📄 Import CSV"
            onPress={() => setShowCSVModal(true)}
            variant="secondary"
            style={styles.csvButton}
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) setTime(selectedTime);
            }}
          />
        )}
        
        {/* CSV Import Modal */}
        <Modal
          visible={showCSVModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCSVModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Import Schedule from CSV</Text>
              <TouchableOpacity
                onPress={() => setShowCSVModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Card style={styles.modalCard}>
                <Text style={styles.sectionTitle}>1. Select Template</Text>
                
                {loadingTemplates ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {templates.map((template) => (
                      <TouchableOpacity
                        key={template.id}
                        style={[
                          styles.templateCard,
                          selectedTemplate?.id === template.id && styles.templateCardSelected,
                        ]}
                        onPress={() => setSelectedTemplate(template)}
                      >
                        <Text style={styles.templateName}>{template.name}</Text>
                        <Text style={styles.templateDescription}>
                          {template.description}
                        </Text>
                        <TouchableOpacity
                          style={styles.downloadButton}
                          onPress={() => handleDownloadTemplate(template.id)}
                        >
                          <Text style={styles.downloadButtonText}>⬇ Download</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                
                {selectedTemplate && (
                  <View style={styles.selectedTemplate}>
                    <Text style={styles.selectedTemplateTitle}>
                      Selected: {selectedTemplate.name}
                    </Text>
                    <Text style={styles.selectedTemplateDescription}>
                      {selectedTemplate.description}
                    </Text>
                  </View>
                )}
              </Card>
              
              <Card style={styles.modalCard}>
                <Text style={styles.sectionTitle}>2. Upload CSV File</Text>
                
                <TouchableOpacity
                  style={styles.filePickerButton}
                  onPress={handlePickCSVFile}
                >
                  <Text style={styles.filePickerIcon}>📁</Text>
                  <Text style={styles.filePickerText}>
                    {csvFile ? csvFile.name : 'Select CSV File'}
                  </Text>
                </TouchableOpacity>
                
                {csvFile && (
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileInfoText}>📄 {csvFile.name}</Text>
                    <Text style={styles.fileInfoSize}>
                      {csvFile.size ? (csvFile.size / 1024).toFixed(1) : '0'} KB
                    </Text>
                  </View>
                )}
              </Card>
              
              <Card style={styles.modalCard}>
                <Text style={styles.sectionTitle}>3. Import Process</Text>
                <Text style={styles.instructionText}>
                  • Download the template first
                </Text>
                <Text style={styles.instructionText}>
                  • Fill in your schedule data
                </Text>
                <Text style={styles.instructionText}>
                  • Upload the completed CSV file
                </Text>
                <Text style={styles.instructionText}>
                  • Review and confirm the import
                </Text>
              </Card>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => setShowCSVModal(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title={importing ? 'Importing...' : 'Import CSV'}
                onPress={handleImportCSV}
                loading={importing}
                disabled={!selectedTemplate || !csvFile}
                style={styles.modalButton}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Low': return '#10B981';
    case 'Medium': return '#F59E0B';
    case 'High': return '#EF4444';
    case 'Urgent': return '#DC2626';
    default: return Colors.primary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  formCard: {
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    padding: 12,
    backgroundColor: Colors.background.primary,
  },
  dateTimeText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
  },
  priorityButtonSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  priorityText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  priorityTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 40,
    gap: 12,
  },
  createButton: {
    flex: 2,
  },
  csvButton: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.text.secondary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalCard: {
    padding: 20,
    marginVertical: 10,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  templateCard: {
    backgroundColor: Colors.background.secondary,
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    minWidth: 200,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  templateName: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  downloadButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  downloadButtonText: {
    ...Typography.body2,
    color: Colors.white,
    fontWeight: '600',
  },
  selectedTemplate: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.success + '10',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  selectedTemplateTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  selectedTemplateDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    justifyContent: 'center',
  },
  filePickerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  filePickerText: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  fileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
  },
  fileInfoText: {
    ...Typography.body2,
    color: Colors.text.primary,
  },
  fileInfoSize: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  instructionText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});