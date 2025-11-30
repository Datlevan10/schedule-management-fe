import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import {
  CreateScheduleImportRequest,
  ScheduleImport,
  ScheduleImportNewAPI,
  ScheduleImportTemplate,
} from '../../api/schedule-import-new.api';
import { Button, Card } from '../../components/common';
import { Colors, Typography } from '../../constants';
import { FileDownloadManager } from '../../utils/fileDownload';

type CreateMethod = 'manual' | 'import';
type ImportType = 'file_upload' | 'manual_input' | 'text_parsing';
type SourceType = 'csv' | 'excel' | 'txt' | 'manual' | 'json';

interface FileType {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
}

export default function CreateTaskScreen() {
  // Method Selection
  const [createMethod, setCreateMethod] = useState<CreateMethod>('manual');

  // Manual Task Creation
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [category, setCategory] = useState('Xây dựng');
  const [priority, setPriority] = useState('Thấp');
  const [reminder, setReminder] = useState('15 phút trước');

  // Import States
  const [importType, setImportType] = useState<ImportType>('file_upload');
  const [sourceType, setSourceType] = useState<SourceType>('csv');
  const [templates, setTemplates] = useState<ScheduleImportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleImportTemplate | null>(null);
  const [file, setFile] = useState<FileType | null>(null);
  const [textContent, setTextContent] = useState('');
  const [importing, setImporting] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Modals
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [recentImports, setRecentImports] = useState<ScheduleImport[]>([]);

  const categories = ['Xây dựng', 'Bán hàng/ Sale', 'Y tế', 'Giáo dục', 'Khác'];
  const priorities = ['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'];
  const reminders = ['Không có', '5 phút trước', '15 phút trước', '30 phút trước', '1 giờ trước', '1 ngày trước'];

  useEffect(() => {
    loadTemplates();
    loadRecentImports();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await ScheduleImportNewAPI.getTemplates();
      if (response.success) {
        setTemplates(response.data);
        const activeTemplate = response.data.find(t => t.status.is_active);
        if (activeTemplate) {
          setSelectedTemplate(activeTemplate);
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadRecentImports = async () => {
    try {
      const response = await ScheduleImportNewAPI.getImports();
      if (response.success) {
        setRecentImports(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading recent imports:', error);
    }
  };

  // Manual Task Creation
  const handleCreateManualTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      // Create manual input using the import API
      const scheduleText = `${title}
${description ? `Description: ${description}` : ''}
Date: ${date.toLocaleDateString()}
Time: ${time.toLocaleTimeString()}
Category: ${category}
Priority: ${priority}
Reminder: ${reminder}`;

      const response = await ScheduleImportNewAPI.createImport({
        import_type: 'manual_input',
        source_type: 'manual',
        raw_content: scheduleText,
      });

      if (response.success) {
        Alert.alert(
          'Task Created',
          `Task has been created and will be processed. Import ID: ${response.data.id}`,
          [
            {
              text: 'View Import',
              onPress: () => router.push(`/schedule/import/${response.data.id}`),
            },
            {
              text: 'Create Another',
              onPress: () => {
                setTitle('');
                setDescription('');
                setDate(new Date());
                setTime(new Date());
                setCategory('Xây dựng');
                setPriority('Thấp');
                setReminder('15 phút trước');
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create task');
    }
  };

  // File Upload
  const handleFileUpload = async () => {
    try {
      let result;

      if (sourceType === 'csv') {
        result = await DocumentPicker.getDocumentAsync({
          type: ['text/csv', 'text/comma-separated-values'],
          copyToCacheDirectory: true,
        });
      } else if (sourceType === 'excel') {
        result = await DocumentPicker.getDocumentAsync({
          type: [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ],
          copyToCacheDirectory: true,
        });
      } else if (sourceType === 'txt') {
        result = await DocumentPicker.getDocumentAsync({
          type: ['text/plain'],
          copyToCacheDirectory: true,
        });
      }

      if (!result?.canceled && result.assets[0]) {
        const selectedFile = result.assets[0];
        setFile({
          name: selectedFile.name,
          uri: selectedFile.uri,
          mimeType: selectedFile.mimeType,
          size: selectedFile.size,
        });
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  // Download Template Files
  const handleDownloadTemplate = async (templateId: number, type: 'template' | 'sample' | 'instructions') => {
    try {
      let success = false;

      switch (type) {
        case 'template':
          success = await FileDownloadManager.downloadTemplate(templateId);
          break;
        case 'sample':
          success = await FileDownloadManager.downloadSample(templateId);
          break;
        case 'instructions':
          success = await FileDownloadManager.downloadInstructions(templateId);
          break;
      }

      if (success) {
        console.log(`Successfully downloaded ${type} for template ${templateId}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  // Import Processing
  const handleImport = async () => {
    try {
      setImporting(true);

      let importData: CreateScheduleImportRequest;

      if (importType === 'file_upload') {
        if (!file) {
          Alert.alert('Error', 'Please select a file to upload');
          return;
        }

        importData = {
          import_type: 'file_upload',
          source_type: sourceType,
          file: {
            uri: file.uri,
            type: file.mimeType,
            name: file.name,
          },
        };
      } else {
        if (!textContent.trim()) {
          Alert.alert('Error', 'Please enter some content');
          return;
        }

        importData = {
          import_type: importType,
          source_type: importType === 'manual_input' ? 'manual' : 'txt',
          raw_content: textContent,
        };
      }

      const response = await ScheduleImportNewAPI.createImport(importData);

      if (response.success) {
        Alert.alert(
          'Import Started',
          `Your ${importType === 'file_upload' ? 'file' : 'text'} import has been started. Import ID: ${response.data.id}`,
          [
            {
              text: 'View Progress',
              onPress: () => router.push(`/schedule/import/${response.data.id}`),
            },
            {
              text: 'OK',
              onPress: () => {
                setFile(null);
                setTextContent('');
                loadRecentImports();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Import error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to start import');
    } finally {
      setImporting(false);
    }
  };

  // Helper Functions
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb > 1) {
      return `${mb.toFixed(1)} MB`;
    }
    return `${kb.toFixed(1)} KB`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'processing': return Colors.warning;
      case 'failed': return Colors.danger;
      default: return Colors.text.secondary;
    }
  };

  // Render Functions
  const renderMethodSelector = () => (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>Create Method</Text>
      <View style={styles.methodGrid}>
        <TouchableOpacity
          style={[styles.methodCard, createMethod === 'manual' && styles.selectedMethod]}
          onPress={() => setCreateMethod('manual')}
        >
          <Text style={styles.methodIcon}>✏️</Text>
          <Text style={[styles.methodTitle, createMethod === 'manual' && styles.selectedText]}>
            Manual Task
          </Text>
          <Text style={[styles.methodDescription, createMethod === 'manual' && styles.selectedText]}>
            Create a single task manually
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodCard, createMethod === 'import' && styles.selectedMethod]}
          onPress={() => setCreateMethod('import')}
        >
          <Text style={styles.methodIcon}>📊</Text>
          <Text style={[styles.methodTitle, createMethod === 'import' && styles.selectedText]}>
            Import Tasks
          </Text>
          <Text style={[styles.methodDescription, createMethod === 'import' && styles.selectedText]}>
            Import from files or text
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderManualTaskForm = () => (
    <>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Task Details</Text>

        <TextInput
          style={styles.input}
          placeholder="Task title *"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={[styles.input, styles.dateTimeInput]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateTimeText}>📅 {date.toLocaleDateString()}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.input, styles.dateTimeInput]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateTimeText}>⏰ {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>
        </View>

        {/* Category, Priority, Reminder Selectors */}
        <View style={styles.pickerRow}>
          <Text style={styles.pickerLabel}>Category:</Text>
          <TouchableOpacity style={styles.picker}>
            <Text style={styles.pickerText}>{category}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pickerRow}>
          <Text style={styles.pickerLabel}>Priority:</Text>
          <TouchableOpacity style={styles.picker}>
            <Text style={styles.pickerText}>{priority}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Button
        title="Create Task"
        onPress={handleCreateManualTask}
        style={styles.createButton}
      />
    </>
  );

  const renderImportTypeSelector = () => (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>Import Method</Text>

      <View style={styles.importGrid}>
        <TouchableOpacity
          style={[styles.importCard, importType === 'file_upload' && styles.selectedImport]}
          onPress={() => setImportType('file_upload')}
        >
          <Text style={styles.importIcon}>📁</Text>
          <Text style={[styles.importTitle, importType === 'file_upload' && styles.selectedText]}>
            File Upload
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.importCard, importType === 'manual_input' && styles.selectedImport]}
          onPress={() => setImportType('manual_input')}
        >
          <Text style={styles.importIcon}>✍️</Text>
          <Text style={[styles.importTitle, importType === 'manual_input' && styles.selectedText]}>
            Text Input
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.importCard, importType === 'text_parsing' && styles.selectedImport]}
          onPress={() => setImportType('text_parsing')}
        >
          <Text style={styles.importIcon}>🧠</Text>
          <Text style={[styles.importTitle, importType === 'text_parsing' && styles.selectedText]}>
            Smart Parsing
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderFileUploadSection = () => (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>File Upload</Text>

      <View style={styles.sourceGrid}>
        <TouchableOpacity
          style={[styles.sourceButton, sourceType === 'csv' && styles.selectedSource]}
          onPress={() => setSourceType('csv')}
        >
          <Text style={styles.sourceIcon}>📊</Text>
          <Text style={styles.sourceText}>CSV</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sourceButton, sourceType === 'excel' && styles.selectedSource]}
          onPress={() => setSourceType('excel')}
        >
          <Text style={styles.sourceIcon}>📈</Text>
          <Text style={styles.sourceText}>Excel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sourceButton, sourceType === 'txt' && styles.selectedSource]}
          onPress={() => setSourceType('txt')}
        >
          <Text style={styles.sourceIcon}>📄</Text>
          <Text style={styles.sourceText}>Text</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Select File"
          onPress={handleFileUpload}
          variant="outline"
          style={styles.button}
        />
        {selectedTemplate && (
          <Button
            title="Download Sample"
            onPress={() => handleDownloadTemplate(selectedTemplate.id, 'sample')}
            variant="secondary"
            style={styles.button}
          />
        )}
      </View>

      {file && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>📎 {file.name}</Text>
          <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
        </View>
      )}

      {/* Template Selection */}
      {selectedTemplate && (
        <View style={styles.templateInfo}>
          <Text style={styles.templateTitle}>Template: {selectedTemplate.template_name}</Text>
          <View style={styles.templateActions}>
            <TouchableOpacity
              style={styles.templateActionButton}
              onPress={() => handleDownloadTemplate(selectedTemplate.id, 'template')}
            >
              <Text style={styles.templateActionText}>Download Template</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.templateActionButton}
              onPress={() => setShowTemplateModal(true)}
            >
              <Text style={styles.templateActionText}>Change Template</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Card>
  );

  const renderTextInputSection = () => (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>
        {importType === 'manual_input' ? 'Enter Schedule Data' : 'Natural Language Input'}
      </Text>
      <Text style={styles.sectionDescription}>
        {importType === 'manual_input'
          ? 'Enter your schedule in a structured format'
          : 'Describe your schedule in natural language'
        }
      </Text>

      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={8}
        placeholder={
          importType === 'manual_input'
            ? 'Example:\nMonday 9:00-10:00 Team Meeting\nTuesday 14:00-16:00 Project Review'
            : 'Example:\nTôi có cuộc họp team vào thứ 2 lúc 9 giờ sáng\nThứ 3 tôi cần review dự án từ 2-4 giờ chiều'
        }
        value={textContent}
        onChangeText={setTextContent}
        textAlignVertical="top"
      />
    </Card>
  );

  const renderRecentImports = () => (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Imports</Text>
      {recentImports.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.recentImportCard}
          onPress={() => router.push(`/schedule/import/${item.id}`)}
        >
          <View style={styles.importHeader}>
            <Text style={styles.importId}>Import #{item.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.importType}>{item.import_type} • {item.source_type}</Text>
          <Text style={styles.importStats}>
            {item.total_entries} entries • {item.success_entries} successful
          </Text>
        </TouchableOpacity>
      ))}
    </Card>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Tasks</Text>
        </View>

        {renderMethodSelector()}

        {createMethod === 'manual' ? (
          renderManualTaskForm()
        ) : (
          <>
            {renderImportTypeSelector()}

            {importType === 'file_upload' && renderFileUploadSection()}

            {(importType === 'manual_input' || importType === 'text_parsing') && renderTextInputSection()}

            <Button
              title={importing ? 'Processing...' : 'Start Import'}
              onPress={handleImport}
              loading={importing}
              disabled={
                importing ||
                (importType === 'file_upload' && !file) ||
                ((importType === 'manual_input' || importType === 'text_parsing') && !textContent.trim())
              }
              style={styles.importButton}
            />

            {renderRecentImports()}
          </>
        )}
      </ScrollView>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setTime(selectedTime);
            }
          }}
        />
      )}

      {/* Template Selection Modal */}
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Template</Text>

            {loadingTemplates ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              <FlatList
                data={templates}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.templateItem,
                      selectedTemplate?.id === item.id && styles.selectedTemplate
                    ]}
                    onPress={() => {
                      setSelectedTemplate(item);
                      setShowTemplateModal(false);
                    }}
                  >
                    <Text style={styles.templateName}>{item.template_name}</Text>
                    <Text style={styles.templateDescription}>{item.template_description}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <Button
              title="Close"
              onPress={() => setShowTemplateModal(false)}
              variant="outline"
              style={styles.modalCloseButton}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    ...Typography.body1,
    color: Colors.primary,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    flex: 1,
  },
  section: {
    margin: 20,
    marginTop: 0,
    padding: 20,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  sectionDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  methodGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  methodCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  selectedMethod: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  methodIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  methodTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  methodDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  selectedText: {
    color: Colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    ...Typography.body1,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dateTimeInput: {
    flex: 1,
    marginBottom: 0,
  },
  dateTimeText: {
    ...Typography.body1,
    color: Colors.text.primary,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    width: 80,
  },
  picker: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
  },
  pickerText: {
    ...Typography.body1,
    color: Colors.text.primary,
  },
  createButton: {
    margin: 20,
    marginTop: 0,
  },
  importGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  importCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  selectedImport: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  importIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  importTitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  sourceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sourceButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  selectedSource: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  sourceIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  sourceText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
  },
  fileInfo: {
    backgroundColor: Colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  fileName: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  fileSize: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  templateInfo: {
    backgroundColor: Colors.background.secondary,
    padding: 12,
    borderRadius: 8,
  },
  templateTitle: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
  templateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  templateActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary + '20',
    borderRadius: 6,
  },
  templateActionText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 16,
    ...Typography.body1,
    color: Colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  importButton: {
    margin: 20,
    marginTop: 0,
  },
  recentImportCard: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  importHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  importId: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  importType: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  importStats: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  templateItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: 12,
  },
  selectedTemplate: {
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
  },
  modalCloseButton: {
    marginTop: 20,
  },
});