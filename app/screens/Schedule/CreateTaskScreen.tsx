import { MaterialIcons } from '@expo/vector-icons';
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
import { Path, Svg } from 'react-native-svg';
import {
  CreateScheduleImportRequest,
  ScheduleImport,
  ScheduleImportNewAPI,
  ScheduleImportTemplate,
} from '../../api/schedule-import-new.api';
import { EventsAPI, CreateEventRequest } from '../../api/events.api';
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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

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

  // Manual Task Creation - Direct to Events Table
  const handleCreateManualTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      // Map frontend priority values to backend expected values
      const priorityMapping: { [key: string]: 'low' | 'medium' | 'high' | 'urgent' } = {
        'Thấp': 'low',
        'Trung bình': 'medium', 
        'Cao': 'high',
        'Khẩn cấp': 'urgent'
      };

      // Create event data
      const eventData: CreateEventRequest = {
        title: title.trim(),
        description: description?.trim() || undefined,
        start_date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        start_time: time.toTimeString().slice(0, 8), // HH:MM:SS format
        end_time: undefined, // Can be calculated or set by user
        location: undefined, // Can be added to form later
        priority: priorityMapping[priority] || 'medium',
        category: category || undefined,
        keywords: category ? [category] : undefined,
        is_recurring: false, // Default to non-recurring
        reminder_settings: reminder !== 'Không có' ? {
          enabled: true,
          minutes_before: reminderToMinutes(reminder),
          notification_type: 'push'
        } : undefined,
      };

      const response = await EventsAPI.create(eventData);

      if (response.success) {
        Alert.alert(
          'Task Created Successfully',
          `Your task "${title}" has been created directly in your schedule.`,
          [
            {
              text: 'View Schedule',
              onPress: () => router.push('/schedule'),
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

  // Helper function to convert reminder text to minutes
  const reminderToMinutes = (reminderText: string): number => {
    switch (reminderText) {
      case '5 phút trước': return 5;
      case '15 phút trước': return 15;
      case '30 phút trước': return 30;
      case '1 giờ trước': return 60;
      case '1 ngày trước': return 1440;
      default: return 15;
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

  // Import Processing - Uses AI Pipeline (raw_schedule_imports → raw_schedule_entries → events)
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
      <Text style={styles.sectionTitle}>Tạo nhiệm vụ lịch tình</Text>
      <View style={styles.methodGrid}>
        <TouchableOpacity
          style={[styles.methodCard, createMethod === 'manual' && styles.selectedMethod]}
          onPress={() => setCreateMethod('manual')}
        >
          <Text style={styles.methodIcon}>
            <MaterialIcons name="edit" size={40} color={"gray"} />
          </Text>
          <Text style={[styles.methodTitle, createMethod === 'manual' && styles.selectedText]}>
            Nhiệm vụ thủ công
          </Text>
          <Text style={[styles.methodDescription, createMethod === 'manual' && styles.selectedText]}>
            Có thể tạo task bằng cách nhập thủ công bằng tayÏ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodCard, createMethod === 'import' && styles.selectedMethod]}
          onPress={() => setCreateMethod('import')}
        >
          <Text style={styles.methodIcon}>
            <MaterialIcons name="upload-file" size={40} color={"gray"} />
          </Text>
          <Text style={[styles.methodTitle, createMethod === 'import' && styles.selectedText]}>
            Nhiệm vụ với nhập file
          </Text>
          <Text style={[styles.methodDescription, createMethod === 'import' && styles.selectedText]}>
            Có thể tạo task bằng cách tải lên tệp CSV,doc,...
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderManualTaskForm = () => (
    <>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Chi tiết nhiệm vụ</Text>

        <TextInput
          style={styles.input}
          placeholder="Tiêu đề nhiệm vụ *"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Mô tả (tùy chọn)"
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
          <Text style={styles.pickerLabel}>Ngành:</Text>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.picker}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text style={styles.pickerText}>{category}</Text>
              <Text style={styles.dropdownArrow}>{showCategoryDropdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showCategoryDropdown && (
              <View style={styles.dropdownList}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.dropdownItem,
                      cat === category && styles.selectedDropdownItem
                    ]}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      cat === category && styles.selectedDropdownItemText
                    ]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.pickerRow}>
          <Text style={styles.pickerLabel}>Sự ưu tiên:</Text>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.picker}
              onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
            >
              <Text style={styles.pickerText}>{priority}</Text>
              <Text style={styles.dropdownArrow}>{showPriorityDropdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showPriorityDropdown && (
              <View style={styles.dropdownList}>
                {priorities.map((prio) => (
                  <TouchableOpacity
                    key={prio}
                    style={[
                      styles.dropdownItem,
                      prio === priority && styles.selectedDropdownItem
                    ]}
                    onPress={() => {
                      setPriority(prio);
                      setShowPriorityDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      prio === priority && styles.selectedDropdownItemText
                    ]}>{prio}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Card>

      <Button
        title="Tạo nhiệm vụ"
        onPress={handleCreateManualTask}
        style={styles.createButton}
      />
    </>
  );

  const renderImportTypeSelector = () => (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>Phương thức nhập</Text>

      <View style={styles.importGrid}>
        <TouchableOpacity
          style={[styles.importCard, importType === 'file_upload' && styles.selectedImport]}
          onPress={() => setImportType('file_upload')}
        >
          <Text style={styles.importIcon}>📁</Text>
          <Text style={[styles.importTitle, importType === 'file_upload' && styles.selectedText]}>
            Tải tệp lên
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.importCard, importType === 'manual_input' && styles.selectedImport]}
          onPress={() => setImportType('manual_input')}
        >
          <Text style={styles.importIcon}>✍️</Text>
          <Text style={[styles.importTitle, importType === 'manual_input' && styles.selectedText]}>
            Nhập văn bản
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.importCard, importType === 'text_parsing' && styles.selectedImport]}
          onPress={() => setImportType('text_parsing')}
        >
          <Text style={styles.importIcon}>🧠</Text>
          <Text style={[styles.importTitle, importType === 'text_parsing' && styles.selectedText]}>
            Phân tích thông minh
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderFileUploadSection = () => (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>Tải tệp lên</Text>

      <View style={styles.sourceGrid}>
        <TouchableOpacity
          style={[styles.sourceButton, sourceType === 'csv' && styles.selectedSource]}
          onPress={() => setSourceType('csv')}
        >
          <View style={styles.sourceIcon}>
            <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
              <Path d="M9.96061 20.8081H26.3431C26.4592 20.8081 26.5706 20.8543 26.6527 20.9364C26.7348 21.0185 26.7809 21.1298 26.7809 21.2459C26.7809 21.3621 26.7348 21.4734 26.6527 21.5555C26.5706 21.6376 26.4592 21.6838 26.3431 21.6838H9.96061C9.90311 21.6838 9.84618 21.6724 9.79306 21.6504C9.73994 21.6284 9.69168 21.5962 9.65103 21.5555C9.61037 21.5149 9.57812 21.4666 9.55612 21.4135C9.53412 21.3604 9.52279 21.3034 9.52279 21.2459C9.52279 21.1884 9.53412 21.1315 9.55612 21.0784C9.57812 21.0253 9.61037 20.977 9.65103 20.9364C9.69168 20.8957 9.73994 20.8635 9.79306 20.8415C9.84618 20.8195 9.90311 20.8081 9.96061 20.8081ZM26.3431 24.0894H9.96061C9.84449 24.0894 9.73313 24.1355 9.65103 24.2176C9.56892 24.2997 9.52279 24.4111 9.52279 24.5272C9.52279 24.6433 9.56892 24.7547 9.65103 24.8368C9.73313 24.9189 9.84449 24.965 9.96061 24.965H26.3431C26.4592 24.965 26.5706 24.9189 26.6527 24.8368C26.7348 24.7547 26.7809 24.6433 26.7809 24.5272C26.7809 24.4111 26.7348 24.2997 26.6527 24.2176C26.5706 24.1355 26.4592 24.0894 26.3431 24.0894ZM26.3431 27.3706H9.96061C9.90315 27.3706 9.84626 27.3819 9.79318 27.4039C9.7401 27.4259 9.69187 27.4581 9.65125 27.4988C9.61062 27.5394 9.57839 27.5876 9.55641 27.6407C9.53442 27.6938 9.52311 27.7507 9.52311 27.8081C9.52311 27.8656 9.53442 27.9225 9.55641 27.9755C9.57839 28.0286 9.61062 28.0769 9.65125 28.1175C9.69187 28.1581 9.7401 28.1903 9.79318 28.2123C9.84626 28.2343 9.90315 28.2456 9.96061 28.2456H26.3431C26.4591 28.2456 26.5704 28.1995 26.6525 28.1175C26.7345 28.0354 26.7806 27.9242 26.7806 27.8081C26.7806 27.6921 26.7345 27.5808 26.6525 27.4988C26.5704 27.4167 26.4591 27.3706 26.3431 27.3706ZM30.0512 9.395V29.3156C30.0502 30.0276 29.7667 30.71 29.2631 31.2132C28.7596 31.7165 28.0769 31.9994 27.365 32H8.93811C8.22623 31.9994 7.54367 31.7164 7.04018 31.2132C6.53669 30.7099 6.25341 30.0275 6.25248 29.3156V18.0094H2.88248C2.63494 18.009 2.39764 17.9105 2.2226 17.7355C2.04757 17.5605 1.94908 17.3232 1.94873 17.0756V9.89125C1.94896 9.64367 2.04741 9.40631 2.22248 9.23125C2.39754 9.05618 2.63491 8.95773 2.88248 8.9575H6.25248V2.68563C6.25326 1.97359 6.53646 1.29094 7.03994 0.78746C7.54342 0.283976 8.22607 0.000777537 8.93811 0L20.6562 0C20.7722 0.000237346 20.8834 0.0462882 20.9656 0.128125L29.9231 9.08562C30.0049 9.16782 30.051 9.27901 30.0512 9.395ZM7.22136 16.0375C7.56824 16.0373 7.90089 15.8996 8.14633 15.6545C8.39178 15.4093 8.52998 15.0769 8.53061 14.73V14.3704C8.53061 14.2543 8.48451 14.1431 8.40246 14.061C8.32042 13.979 8.20914 13.9329 8.09311 13.9329C7.97707 13.9329 7.86579 13.979 7.78375 14.061C7.7017 14.1431 7.65561 14.2543 7.65561 14.3704V14.73C7.65387 14.8444 7.60752 14.9536 7.52644 15.0344C7.44536 15.1151 7.33596 15.161 7.22154 15.1622H6.13404C6.0192 15.1624 5.909 15.1169 5.82763 15.0359C5.74625 14.9548 5.70034 14.8448 5.69998 14.73V12.2369C5.70034 12.1221 5.74625 12.0121 5.82763 11.9311C5.909 11.85 6.0192 11.8046 6.13404 11.8047H7.22186C7.33627 11.8059 7.44568 11.8518 7.52676 11.9326C7.60784 12.0133 7.65418 12.1225 7.65592 12.2369V12.5966C7.65592 12.7127 7.70201 12.8239 7.78406 12.906C7.86611 12.988 7.97739 13.0341 8.09342 13.0341C8.20945 13.0341 8.32073 12.988 8.40278 12.906C8.48482 12.8239 8.53092 12.7127 8.53092 12.5966V12.2369C8.53029 11.8901 8.39209 11.5576 8.14665 11.3125C7.9012 11.0674 7.56855 10.9296 7.22167 10.9294H6.13417C5.78729 10.9296 5.45463 11.0674 5.20919 11.3125C4.96374 11.5576 4.82555 11.8901 4.82492 12.2369V14.7297C4.82548 15.0766 4.96356 15.409 5.20888 15.6542C5.4542 15.8993 5.78673 16.0372 6.13354 16.0375H7.22136ZM29.1762 9.83313H21.905C21.4578 9.83256 21.029 9.65466 20.7128 9.33843C20.3966 9.0222 20.2187 8.59346 20.2181 8.14625V0.875H8.93811C8.45809 0.875628 7.99792 1.06659 7.65849 1.40601C7.31907 1.74544 7.12811 2.20561 7.12748 2.68563V8.9575H18.9056C19.1532 8.95773 19.3905 9.05618 19.5656 9.23125C19.7407 9.40631 19.8391 9.64367 19.8394 9.89125V17.0756C19.839 17.3232 19.7405 17.5605 19.5655 17.7355C19.3904 17.9105 19.1531 18.009 18.9056 18.0094H7.12748V29.3156C7.12831 29.7955 7.31937 30.2554 7.65879 30.5946C7.9982 30.9338 8.45827 31.1245 8.93811 31.125H27.365C27.8449 31.1247 28.3052 30.934 28.6447 30.5948C28.9843 30.2556 29.1754 29.7956 29.1762 29.3156V9.83313ZM11.8187 14.5419C11.8185 14.7063 11.7531 14.8639 11.6369 14.9802C11.5207 15.0964 11.3631 15.1618 11.1987 15.162H10.4848C10.3202 15.1621 10.1622 15.0968 10.0456 14.9806C9.92906 14.8643 9.86335 14.7066 9.86292 14.5419C9.86292 14.4259 9.81682 14.3146 9.73478 14.2326C9.65273 14.1505 9.54145 14.1044 9.42542 14.1044C9.30939 14.1044 9.19811 14.1505 9.11606 14.2326C9.03401 14.3146 8.98792 14.4259 8.98792 14.5419C8.98853 14.9386 9.14647 15.3189 9.4271 15.5992C9.70772 15.8796 10.0881 16.0372 10.4848 16.0375H11.1988C11.5939 16.0349 11.972 15.8762 12.2505 15.5959C12.5291 15.3155 12.6854 14.9364 12.6854 14.5413C12.6854 14.1461 12.5291 13.767 12.2505 13.4867C11.972 13.2064 11.5939 13.0476 11.1988 13.0451H10.4848C10.3203 13.0451 10.1626 12.9797 10.0463 12.8635C9.93006 12.7472 9.86473 12.5895 9.86473 12.425C9.86473 12.2605 9.93006 12.1028 10.0463 11.9865C10.1626 11.8703 10.3203 11.8049 10.4848 11.8049H11.1988C11.3632 11.8052 11.5207 11.8706 11.637 11.9868C11.7532 12.103 11.8185 12.2606 11.8187 12.425C11.8187 12.541 11.8648 12.6523 11.9469 12.7344C12.0289 12.8164 12.1402 12.8625 12.2562 12.8625C12.3723 12.8625 12.4835 12.8164 12.5656 12.7344C12.6476 12.6523 12.6937 12.541 12.6937 12.425C12.6933 12.0286 12.5356 11.6485 12.2553 11.3682C11.975 11.0878 11.5949 10.9302 11.1985 10.9297H10.4848C10.2884 10.9297 10.094 10.9684 9.91256 11.0435C9.73114 11.1187 9.5663 11.2288 9.42745 11.3677C9.28859 11.5065 9.17845 11.6713 9.1033 11.8528C9.02816 12.0342 8.98948 12.2286 8.98948 12.425C8.98948 12.6214 9.02816 12.8158 9.1033 12.9972C9.17845 13.1787 9.28859 13.3435 9.42745 13.4823C9.5663 13.6212 9.73114 13.7313 9.91256 13.8065C10.094 13.8816 10.2884 13.9203 10.4848 13.9203H11.1988C11.3634 13.9208 11.521 13.9865 11.6372 14.103C11.7534 14.2195 11.8187 14.3774 11.8187 14.5419ZM13.2817 11.5059L14.6972 15.7384C14.7263 15.8255 14.782 15.9012 14.8565 15.9549C14.931 16.0086 15.0204 16.0375 15.1123 16.0375C15.2041 16.0375 15.2936 16.0086 15.368 15.9549C15.4425 15.9012 15.4982 15.8255 15.5273 15.7384L16.9412 11.5059C16.978 11.3958 16.9695 11.2756 16.9177 11.1718C16.8658 11.0679 16.7749 10.9889 16.6648 10.9521C16.5547 10.9153 16.4345 10.9238 16.3307 10.9756C16.2268 11.0275 16.1478 11.1184 16.111 11.2285L15.112 14.2192L14.1117 11.2284C14.0749 11.1183 13.9958 11.0274 13.892 10.9756C13.7881 10.9238 13.6679 10.9154 13.5579 10.9522C13.4478 10.989 13.3569 11.068 13.3051 11.1719C13.2533 11.2758 13.2449 11.3959 13.2817 11.506V11.5059Z" fill="#29845A" />
            </Svg>
          </View>
          <Text style={styles.sourceText}>.csv</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sourceButton, sourceType === 'excel' && styles.selectedSource]}
          onPress={() => setSourceType('excel')}
        >
          <Text style={styles.sourceIcon}>📈</Text>
          <Text style={styles.sourceText}>.xlsx</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sourceButton, sourceType === 'txt' && styles.selectedSource]}
          onPress={() => setSourceType('txt')}
        >
          <Text style={styles.sourceIcon}>📄</Text>
          <Text style={styles.sourceText}>.doc</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Chọn tập tin"
          onPress={handleFileUpload}
          variant="outline"
          style={styles.button}
        />
        {selectedTemplate && (
          <Button
            title="Tải xuống mẫu"
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
          <Text style={styles.templateTitle}>Mẫu: {selectedTemplate.template_name}</Text>
          <View style={styles.templateActions}>
            <TouchableOpacity
              style={styles.templateActionButton}
              onPress={() => handleDownloadTemplate(selectedTemplate.id, 'template')}
            >
              <Text style={styles.templateActionText}>Tải xuống mẫu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.templateActionButton}
              onPress={() => setShowTemplateModal(true)}
            >
              <Text style={styles.templateActionText}>Thay đổi mẫu</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Card>
  );

  const renderTextInputSection = () => (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>
        {importType === 'manual_input' ? 'Nhập dữ liệu lịch trình' : 'Đầu vào ngôn ngữ tự nhiên'}
      </Text>
      <Text style={styles.sectionDescription}>
        {importType === 'manual_input'
          ? 'Nhập lịch trình của bạn theo định dạng có cấu trúc'
          : 'Mô tả lịch trình của bạn bằng ngôn ngữ tự nhiên'
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
      <Text style={styles.sectionTitle}>Nhập khẩu gần đây</Text>
      {recentImports.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.recentImportCard}
          onPress={() => router.push(`/schedule/import/${item.id}`)}
        >
          <View style={styles.importHeader}>
            <Text style={styles.importId}>Nhập file #{item.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.importType}>{item.import_type} • {item.source_type}</Text>
          <Text style={styles.importStats}>
            {item.total_entries} mục nhập • {item.success_entries} thành công
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
            <MaterialIcons name="arrow-back-ios" size={20} />
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo nhiệm vụ của bạn</Text>
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
              title={importing ? 'Xử lý...' : 'Bắt đầu nhập'}
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
            <Text style={styles.modalTitle}>Chọn mẫu</Text>

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
    display: "flex",
    flexDirection: "row",
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    ...Typography.body1,
    color: Colors.text.primary,
    flex: 1,
  },
  dropdownContainer: {
    flex: 1,
    position: 'relative',
  },
  dropdownArrow: {
    ...Typography.body1,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  dropdownItemText: {
    ...Typography.body1,
    color: Colors.text.primary,
  },
  selectedDropdownItem: {
    backgroundColor: Colors.primary + '10',
  },
  selectedDropdownItemText: {
    color: Colors.primary,
    fontWeight: '600',
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