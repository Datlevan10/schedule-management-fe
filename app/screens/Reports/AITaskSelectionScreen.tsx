import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { NotificationAPI } from '../../api/notifications.api';
import { ScheduleImportNewAPI } from '../../api/schedule-import-new.api';
import { TaskSelectionAPI, type AIAnalysisRequest, type SelectableTask, type TaskListFilters } from '../../api/task-selection.api';
import { CSVTaskAnalysisAPI, type CSVAnalysisRequest } from '../../api/csv-task-analysis.api';
import { Colors, Typography } from '../../constants';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

// Custom AI Icon Component
const AIIcon = ({ color = "#8051FF", size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.97051 6.077L7.57276 7.7495C8.24176 9.60575 9.70351 11.0675 11.5598 11.7365L13.2323 12.3388C13.383 12.3935 13.383 12.6073 13.2323 12.6613L11.5598 13.2635C9.70351 13.9325 8.24176 15.3943 7.57276 17.2505L6.97051 18.923C6.91576 19.0738 6.70201 19.0738 6.64801 18.923L6.04576 17.2505C5.37676 15.3943 3.91501 13.9325 2.05876 13.2635L0.386256 12.6613C0.235506 12.6065 0.235506 12.3928 0.386256 12.3388L2.05876 11.7365C3.91501 11.0675 5.37676 9.60575 6.04576 7.7495L6.64801 6.077C6.70201 5.9255 6.91576 5.9255 6.97051 6.077Z"
      fill={color}
    />
    <Path
      d="M14.4991 2.05794L14.8043 2.90469C15.1433 3.84444 15.8836 4.58469 16.8233 4.92369L17.6701 5.22894C17.7466 5.25669 17.7466 5.36469 17.6701 5.39244L16.8233 5.69769C15.8836 6.03669 15.1433 6.77694 14.8043 7.71669L14.4991 8.56344C14.4713 8.63994 14.3633 8.63994 14.3356 8.56344L14.0303 7.71669C13.6913 6.77694 12.9511 6.03669 12.0113 5.69769L11.1646 5.39244C11.0881 5.36469 11.0881 5.25669 11.1646 5.22894L12.0113 4.92369C12.9511 4.58469 13.6913 3.84444 14.0303 2.90469L14.3356 2.05794C14.3633 1.98069 14.4721 1.98069 14.4991 2.05794Z"
      fill={color}
    />
    <Path
      d="M14.4991 16.4377L14.8043 17.2845C15.1433 18.2242 15.8836 18.9645 16.8233 19.3035L17.6701 19.6087C17.7466 19.6365 17.7466 19.7445 17.6701 19.7722L16.8233 20.0775C15.8836 20.4165 15.1433 21.1567 14.8043 22.0965L14.4991 22.9432C14.4713 23.0197 14.3633 23.0197 14.3356 22.9432L14.0303 22.0965C13.6913 21.1567 12.9511 20.4165 12.0113 20.0775L11.1646 19.7722C11.0881 19.7445 11.0881 19.6365 11.1646 19.6087L12.0113 19.3035C12.9511 18.9645 13.6913 18.2242 14.0303 17.2845L14.3356 16.4377C14.3633 16.3612 14.4721 16.3612 14.4991 16.4377Z"
      fill={color}
    />
  </Svg>
);

interface SelectableTaskCardProps {
  task: SelectableTask;
  isSelected: boolean;
  onToggleSelect: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  isDeleting: boolean;
}

const SelectableTaskCard = ({ task, isSelected, onToggleSelect, onDelete, isDeleting }: SelectableTaskCardProps) => {
  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  const renderDeleteAction = () => (
    <View style={styles.deleteAction}>
      <TouchableOpacity
        style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
        onPress={() => !isDeleting && onDelete(task.task_id)}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="trash" size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );

  const getSourceIcon = (source: string) => {
    return source === 'manual' ? 'create-outline' : 'cloud-download-outline';
  };

  const getSourceLabel = (source: string) => {
    return source === 'manual' ? 'Thủ công' : 'CSV Import';
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return Colors.danger || '#e74c3c';
    if (priority >= 3) return Colors.warning || '#f39c12';
    return Colors.info || '#3498db';
  };

  return (
    <Swipeable renderRightActions={renderDeleteAction}>
      <Pressable
        style={[
          styles.taskCard,
          isSelected && styles.selectedTaskCard,
          !task.is_selectable && styles.disabledTaskCard,
          isDeleting && styles.deletingTaskCard
        ]}
        onPress={() => task.is_selectable && onToggleSelect(task.task_id)}
        disabled={!task.is_selectable || isDeleting}
      >
      <View style={styles.taskHeader}>
        <View style={styles.taskMainInfo}>
          <View style={styles.checkboxContainer}>
            <View style={[
              styles.checkbox,
              isSelected && styles.checkedCheckbox,
              !task.is_selectable && styles.disabledCheckbox
            ]}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
          </View>

          <View style={styles.taskTitleContainer}>
            <Text style={[
              styles.taskTitle,
              !task.is_selectable && styles.disabledText
            ]} numberOfLines={2}>
              {task.title}
            </Text>
            <View style={styles.taskMeta}>
              <View style={styles.sourceTag}>
                <Ionicons
                  name={getSourceIcon(task.source)}
                  size={12}
                  color={Colors.text.secondary}
                />
                <Text style={styles.sourceText}>
                  {getSourceLabel(task.source)}
                </Text>
              </View>

              <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                  Ưu tiên {task.priority}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {task.description && (
        <Text style={[
          styles.taskDescription,
          !task.is_selectable && styles.disabledText
        ]} numberOfLines={2}>
          {task.description}
        </Text>
      )}

      {/* Show lock/analysis status for CSV tasks */}
      {task.source === 'imported' && task.metadata && (
        <View style={styles.statusIndicator}>
          {task.metadata.is_locked && (
            <View style={styles.lockedBadge}>
              <Ionicons name="lock-closed" size={12} color="#f39c12" />
              <Text style={styles.lockedText}>Đang xử lý</Text>
            </View>
          )}
          {task.metadata.analysis_status === 'completed' && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#27ae60" />
              <Text style={styles.completedText}>Đã phân tích</Text>
            </View>
          )}
          {task.metadata.analysis_status === 'failed' && (
            <View style={styles.failedBadge}>
              <Ionicons name="alert-circle" size={12} color="#e74c3c" />
              <Text style={styles.failedText}>Lỗi</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.taskDetails}>
        <View style={styles.taskDetailRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.text.secondary} />
          <Text style={styles.taskDetailText}>
            {formatDateTime(task.start_datetime)}
          </Text>
        </View>

        <View style={styles.taskDetailRow}>
          <Ionicons name="time-outline" size={14} color={Colors.text.secondary} />
          <Text style={styles.taskDetailText}>
            {task.duration_minutes} phút
          </Text>
        </View>

        {task.location && (
          <View style={styles.taskDetailRow}>
            <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.taskDetailText} numberOfLines={1}>
              {task.location}
            </Text>
          </View>
        )}

        {task.metadata.ai_confidence && (
          <View style={styles.taskDetailRow}>
            <Ionicons name="analytics-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.taskDetailText}>
              Độ tin cậy AI: {(task.metadata.ai_confidence * 100).toFixed(0)}%
            </Text>
          </View>
        )}
      </View>
      </Pressable>
    </Swipeable>
  );
};

export default function AITaskSelectionScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<SelectableTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<SelectableTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    total_tasks: 0,
    manual_tasks: 0,
    imported_tasks: 0,
    selectable_tasks: 0
  });
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [deletingTasks, setDeletingTasks] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'manual' | 'imported'>(
    (params.tab as 'all' | 'manual' | 'imported') || 'all'
  );
  const [csvAnalysisStatus, setCSVAnalysisStatus] = useState<any>(null);

  // Helper function to convert Vietnamese time format to 24h format
  const convertVietnameseTime = (timeStr: string, context?: { isAfternoon?: boolean }): string => {
    if (!timeStr) return '09:00';
    
    // Remove extra spaces and normalize
    const normalized = timeStr.trim().toLowerCase();
    
    // Extract hours and minutes
    const match = normalized.match(/(\d+)\s*(giờ|h)?\s*(\d+)?\s*(phút|p)?/);
    if (!match) return '09:00';
    
    let hours = parseInt(match[1]) || 0;
    let minutes = parseInt(match[3]) || 0;
    
    // Smart PM detection for Vietnamese context
    // School classes typically run 7AM-5PM
    if (hours <= 6 && normalized.includes('giờ')) {
      // Times like 1-6 giờ are likely PM in school context
      if (hours >= 1 && hours <= 5) {
        hours += 12; // Convert to 13:00-17:00
      }
    } else if (hours === 2 && minutes > 0) {
      // "2 giờ 15 phút" in afternoon context is 14:15
      hours = 14;
    }
    
    // If context suggests afternoon and hour is ambiguous
    if (context?.isAfternoon && hours < 12 && hours > 0 && hours <= 6) {
      hours += 12;
    }
    
    // Format as HH:MM
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Helper function to calculate duration in minutes
  const calculateDurationMinutes = (startDateTime: string, endDateTime: string): number => {
    try {
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);
      const diffMs = end.getTime() - start.getTime();
      return Math.max(30, Math.round(diffMs / (1000 * 60))); // Minimum 30 minutes
    } catch {
      return 60; // Default to 60 minutes
    }
  };

  // Helper function to parse date from DD/MM/YYYY format
  const parseVietnameseDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return new Date().toISOString().split('T')[0];
  };

  const sourceOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Thủ công', value: 'manual' },
    { label: 'Nhập khẩu', value: 'imported' }
  ];

  const tabOptions = [
    { key: 'all', label: 'Tất cả nhiệm vụ', icon: 'list' },
    { key: 'manual', label: 'Thủ công', icon: 'create' },
    { key: 'imported', label: 'Nhập từ CSV', icon: 'cloud-download' }
  ];

  const loadTasks = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      console.log('🔍 Loading user task list for AI selection...');

      // Load both manual and imported tasks
      const filters: TaskListFilters = {
        // Load all tasks regardless of date for AI analysis
      };

      // Fetch all tasks, imports and entries in parallel
      const [taskListResponse, importsResponse] = await Promise.all([
        TaskSelectionAPI.getUserTaskList(user.id, filters).catch(() => ({ 
          status: 'error', 
          data: { tasks: [], summary: { total_tasks: 0, manual_tasks: 0, imported_tasks: 0, selectable_tasks: 0 } } 
        })),
        ScheduleImportNewAPI.getImports(user.id).catch(() => ({ success: false, data: [] }))
      ]);

      let allTasks: SelectableTask[] = [];
      let importedTasks: SelectableTask[] = [];

      // Handle manual tasks from TaskSelectionAPI
      if (taskListResponse.status === 'success' && taskListResponse.data) {
        allTasks = taskListResponse.data.tasks;
      }

      // Handle CSV imported tasks from ScheduleImportNewAPI
      if (importsResponse.success && importsResponse.data.length > 0) {
        console.log('📥 Found schedule imports:', importsResponse.data.length);
        
        // Process each import and its entries
        for (const scheduleImport of importsResponse.data) {
          if (scheduleImport.user_id === user.id && scheduleImport.total_entries > 0) {
            try {
              // Fetch entries for this import - pass both import ID and user ID
              const entriesResponse = await ScheduleImportNewAPI.getImportEntries(scheduleImport.id, user.id);
              
              if (entriesResponse.success && entriesResponse.data) {
                // Convert schedule entries to SelectableTask format
                const tasksFromImport = entriesResponse.data.map((entry: any) => {
                  // Parse the data to create task
                  const parsedData = entry.parsed_data || {};
                  const originalText = entry.original_text || '';
                  
                  // Generate dates from parsed data
                  const dateStr = parsedData.start_date || new Date().toISOString().split('T')[0];
                  const startTimeStr = parsedData.start_time || '09:00';
                  const endTimeStr = parsedData.end_time || '10:00';
                  
                  // Determine if it's an afternoon class based on start time
                  const startHour = parseInt(startTimeStr.match(/(\d+)/)?.[1] || '9');
                  const isAfternoonContext = startHour >= 13 || (startHour >= 1 && startHour <= 5 && startTimeStr.includes('giờ'));
                  
                  // Create full datetime strings with context
                  const startDateTime = `${dateStr}T${convertVietnameseTime(startTimeStr, { isAfternoon: isAfternoonContext })}:00`;
                  const endDateTime = `${dateStr}T${convertVietnameseTime(endTimeStr, { isAfternoon: isAfternoonContext })}:00`;
                  
                  // Check if task is available for analysis and not locked
                  // CSV entries are available if they're valid and not converted
                  const isAvailableForAnalysis = entry.validation_status === 'valid' && !entry.is_converted;
                  const isLocked = entry.is_converted;
                  const analysisStatus = entry.is_converted ? 'completed' : 'pending';
                  
                  const task: SelectableTask = {
                    task_id: `import_${scheduleImport.id}_entry_${entry.id}`,
                    source: 'imported',
                    source_id: entry.id,
                    title: parsedData.title || originalText.substring(0, 50) || `Entry ${entry.id}`,
                    description: parsedData.description || originalText,
                    start_datetime: startDateTime,
                    end_datetime: endDateTime,
                    location: parsedData.location || '',
                    status: entry.is_converted ? 'scheduled' : 'pending',
                    priority: parseInt(parsedData.priority || '3'),
                    completion_percentage: 0,
                    category: parsedData.category || null,
                    duration_minutes: calculateDurationMinutes(startDateTime, endDateTime),
                    is_selectable: isAvailableForAnalysis && !isLocked && analysisStatus === 'pending',
                    created_at: entry.created_at,
                    metadata: {
                      source_type: 'csv',
                      original_text: originalText,
                      ai_confidence: entry.ai_confidence || 0.75,
                      import_id: scheduleImport.id,
                      entry_id: entry.id,
                      validation_status: entry.validation_status,
                      is_locked: isLocked,
                      analysis_status: analysisStatus,
                      is_available_for_analysis: isAvailableForAnalysis
                    }
                  };
                  
                  return task;
                });
                
                importedTasks = [...importedTasks, ...tasksFromImport];
                console.log(`✅ Processed ${tasksFromImport.length} tasks from import #${scheduleImport.id}`);
              }
            } catch (error) {
              console.error(`Error processing import #${scheduleImport.id}:`, error);
            }
          }
        }
      }

      // Merge all tasks (remove duplicates by task_id)
      const taskMap = new Map<string, SelectableTask>();
      [...allTasks, ...importedTasks].forEach(task => {
        taskMap.set(task.task_id, task);
      });
      const mergedTasks = Array.from(taskMap.values());
      
      console.log('📋 Total tasks loaded:', mergedTasks.length);
      console.log('📋 Task breakdown:');
      console.log('  Manual tasks:', mergedTasks.filter(t => t.source === 'manual').length);
      console.log('  Imported tasks:', mergedTasks.filter(t => t.source === 'imported').length);
      
      setTasks(mergedTasks);
      filterTasksByTab(mergedTasks, activeTab);
      
      // Update summary
      setSummary({
        total_tasks: mergedTasks.length,
        manual_tasks: mergedTasks.filter(t => t.source === 'manual').length,
        imported_tasks: mergedTasks.filter(t => t.source === 'imported').length,
        selectable_tasks: mergedTasks.filter(t => t.is_selectable).length
      });
      
      console.log('✅ Task list loaded successfully');
    } catch (error) {
      console.error('❌ Error loading task list:', error);
      setError('Không thể tải danh sách nhiệm vụ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, activeTab]);

  const filterTasksByTab = (taskList: SelectableTask[], tab: string) => {
    let filtered = taskList;
    
    if (tab === 'manual') {
      filtered = taskList.filter(task => task.source === 'manual');
    } else if (tab === 'imported') {
      filtered = taskList.filter(task => task.source === 'imported');
    }
    
    // Apply search filter if any
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredTasks(filtered);
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadTasks();
  }, [loadTasks]);

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.task_id === taskId);
    if (!task) return;

    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa nhiệm vụ "${task.title}"?`,
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => confirmDeleteTask(taskId)
        }
      ]
    );
  };

  const confirmDeleteTask = async (taskId: string) => {
    try {
      setDeletingTasks(prev => new Set([...prev, taskId]));
      
      console.log(`🗑️ Attempting to delete task: ${taskId}`);
      
      // Try to find the most recent analysis_id that might contain this task
      // For task selection screen, we'll use a special analysis_id or handle it differently
      let analysisId = 0; // Default for manual tasks without specific analysis
      
      try {
        // Use the complete-removal endpoint for comprehensive deletion
        await NotificationAPI.deleteTask(
          taskId,
          "User deleted from task selection screen - no longer needed for AI analysis",
          analysisId,
          "user"
        );
        
        console.log(`✅ Task ${taskId} deleted successfully with complete removal`);
      } catch (apiError: any) {
        console.log(`⚠️ Complete removal failed, this might be a task without AI analysis association`);
        console.log('Error:', apiError.message);
        
        // If complete-removal fails, the task might not be part of an AI analysis
        // In this case, we could implement a simple task deletion endpoint
        // For now, we'll show this as an expected behavior
        throw new Error("Nhiệm vụ này có thể đã được xóa hoặc không thuộc phân tích AI nào");
      }

      // Remove task from local state only if API call succeeded
      setTasks(prev => prev.filter(t => t.task_id !== taskId));
      setFilteredTasks(prev => prev.filter(t => t.task_id !== taskId));
      
      // Remove from selected tasks if it was selected
      setSelectedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });

      Alert.alert("Thành công", "Nhiệm vụ đã được xóa khỏi hệ thống và dữ liệu AI");
    } catch (error: any) {
      console.error("Error deleting task:", error);
      Alert.alert(
        "Lỗi", 
        error?.response?.data?.message || error?.message || "Không thể xóa nhiệm vụ"
      );
    } finally {
      setDeletingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleToggleSelect = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(taskId)) {
        newSelected.delete(taskId);
      } else {
        newSelected.add(taskId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    const selectableTasks = filteredTasks.filter(task => task.is_selectable);
    if (selectedTasks.size === selectableTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(selectableTasks.map(task => task.task_id)));
    }
  };

  const handleCSVAnalysis = async () => {
    // Handle CSV task analysis separately
    const csvTasks = Array.from(selectedTasks)
      .map(id => filteredTasks.find(t => t.task_id === id))
      .filter(task => task?.source === 'imported');
    
    if (csvTasks.length === 0) {
      return handleAIAnalysis();
    }

    setAiLoading(true);
    try {
      // Extract entry IDs from CSV tasks
      const entryIds = csvTasks
        .map(task => task?.metadata?.entry_id)
        .filter((id): id is number => id !== undefined);
      
      const csvAnalysisRequest: CSVAnalysisRequest = {
        user_id: user!.id,
        entry_ids: entryIds,
        analysis_type: 'both',
        options: {
          language: 'vietnamese',
          optimize_schedule: true,
          detect_conflicts: true
        }
      };

      console.log('🤖 Submitting CSV tasks for analysis:', csvAnalysisRequest);
      
      const response = await CSVTaskAnalysisAPI.analyzeCSVTasks(csvAnalysisRequest);
      
      if (response.success) {
        const analysisId = response.data.analysis_id;
        
        Alert.alert(
          '🤖 Phân tích CSV đã bắt đầu!',
          `${response.data.entries_submitted} nhiệm vụ đã được gửi để phân tích.\n` +
          `${response.data.entries_locked} nhiệm vụ đã được khóa.\n` +
          `${response.data.entries_skipped} nhiệm vụ đã bỏ qua.\n\n` +
          `ID phân tích: ${analysisId}`,
          [
            {
              text: 'Xem kết quả',
              onPress: async () => {
                // Poll for results
                setTimeout(async () => {
                  try {
                    const results = await CSVTaskAnalysisAPI.getAnalysisResults(analysisId);
                    console.log('Analysis results:', results);
                    // Process and display results
                    setAiResult(results);
                    setShowAIModal(true);
                  } catch (error) {
                    console.error('Error fetching results:', error);
                  }
                }, 3000);
              }
            },
            { text: 'OK' }
          ]
        );
        
        // Refresh task list to update lock status
        await loadTasks();
      }
    } catch (error: any) {
      console.error('CSV Analysis error:', error);
      
      // Better error handling
      let errorMessage = 'Không thể phân tích tác vụ CSV';
      
      if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      } else if (error.response?.status === 404) {
        errorMessage = 'API không tìm thấy. Vui lòng kiểm tra cấu hình.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Lỗi phân tích CSV', errorMessage, [
        {
          text: 'Thử lại',
          onPress: () => handleCSVAnalysis()
        },
        {
          text: 'Hủy',
          style: 'cancel'
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (selectedTasks.size === 0) {
      Alert.alert('Chú ý', 'Vui lòng chọn ít nhất một nhiệm vụ để phân tích AI');
      return;
    }

    setAiLoading(true);
    try {
      const selectedTaskIds = Array.from(selectedTasks);
      const selectedTaskDetails = tasks.filter(task => selectedTaskIds.includes(task.task_id));
      
      const analysisRequest: AIAnalysisRequest = {
        selected_tasks: selectedTaskIds,
        analysis_type: 'optimization',
        focus_areas: ['conflict_detection', 'time_optimization', 'workload_balance'],
        additional_context: `Analyzing ${selectedTaskDetails.length} tasks for user ${user?.name || user?.id}`
      };

      // 🔍 DETAILED LOGGING FOR BACKEND DEBUGGING
      console.log('🤖 =================== AI ANALYSIS REQUEST ===================');
      console.log('👤 User ID:', user!.id);
      console.log('👤 User Name:', user?.name);
      console.log('📊 Selected Task Count:', selectedTaskIds.length);
      console.log('📝 Selected Task IDs:', JSON.stringify(selectedTaskIds, null, 2));
      
      console.log('\n📋 SELECTED TASK DETAILS:');
      selectedTaskDetails.forEach((task, index) => {
        console.log(`\n--- Task ${index + 1} ---`);
        console.log('ID:', task.task_id);
        console.log('Source:', task.source);
        console.log('Title:', task.title);
        console.log('Description:', task.description);
        console.log('Start:', task.start_datetime);
        console.log('End:', task.end_datetime);
        console.log('Location:', task.location);
        console.log('Priority:', task.priority);
        console.log('Duration:', task.duration_minutes, 'minutes');
        console.log('Status:', task.status);
        console.log('Category:', task.category);
        console.log('Metadata:', JSON.stringify(task.metadata, null, 2));
      });
      
      console.log('\n🔧 ANALYSIS REQUEST PAYLOAD:');
      console.log(JSON.stringify(analysisRequest, null, 2));
      
      console.log('\n🌐 API ENDPOINT:');
      console.log(`POST /ai-schedule/analyze-selected/${user!.id}`);
      
      console.log('\n📤 SENDING REQUEST TO BACKEND...');
      console.log('⏰ This may take up to 3 minutes for AI processing...');
      console.log('===========================================================\n');

      const response = await TaskSelectionAPI.analyzeSelectedTasks(user!.id, analysisRequest);

      console.log('📥 =================== AI ANALYSIS RESPONSE ===================');
      console.log('✅ Response Status:', response.status);
      console.log('📝 Response Message:', response.message);
      console.log('🔍 Response Data:', JSON.stringify(response.data, null, 2));
      console.log('==============================================================\n');

      if (response.status === 'success') {
        setAiResult(response.data);
        setShowAIModal(true);
        console.log('✅ AI analysis completed successfully!');
        
        // Vibrate device for success feedback
        Vibration.vibrate([100, 50, 100]);
        
        // Show success notification with task priority info
        const analysisData = response.data;
        const highPriorityTask = analysisData.ai_analysis?.structured_response?.priority_recommendations?.high_priority_task;
        const taskDetails = analysisData.selected_tasks?.find((t: any) => t.task_id === highPriorityTask?.task_id);
        
        let notificationMessage = `🎯 AI phân tích hoàn thành cho ${selectedTasks.size} nhiệm vụ!`;
        if (taskDetails) {
          notificationMessage += `\n⭐ Ưu tiên cao: ${taskDetails.title}`;
        }
        
        Alert.alert(
          '🤖 Phân tích AI hoàn thành!',
          notificationMessage,
          [
            {
              text: 'Xem chi tiết',
              style: 'default',
              onPress: () => {
                // Modal is already shown above
              }
            },
            {
              text: 'Xem thông báo', 
              style: 'default',
              onPress: () => {
                router.push('/screens/Reminder/NotifyScreen');
              }
            }
          ]
        );
        
        // Trigger notification refresh by storing a flag
        await AsyncStorage.setItem('newNotificationAvailable', 'true');
        
        // Store analysis completion timestamp for notifications
        await AsyncStorage.setItem('lastAIAnalysisCompleted', new Date().toISOString());
      } else {
        throw new Error(response.message || 'AI analysis failed');
      }
    } catch (error: any) {
      console.log('❌ =================== AI ANALYSIS ERROR ===================');
      console.error('❌ Error Type:', error.constructor.name);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Error Code:', error.code);
      console.error('❌ Request Config:', error.config ? {
        method: error.config.method,
        url: error.config.url,
        baseURL: error.config.baseURL,
        timeout: error.config.timeout,
        headers: error.config.headers
      } : 'No config available');
      console.error('❌ Response Data:', error.response?.data);
      console.error('❌ Response Status:', error.response?.status);
      console.error('❌ Response Headers:', error.response?.headers);
      console.error('❌ Full Error Object:', error);
      console.log('=============================================================\n');
      
      // Better error messages based on error type
      let errorTitle = 'Lỗi phân tích AI';
      let errorMessage = 'Không thể thực hiện phân tích AI.';

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorTitle = 'Timeout - AI đang xử lý';
        errorMessage = `AI đang xử lý dữ liệu và mất nhiều thời gian hơn dự kiến.\n\n• Hãy thử lại sau 1-2 phút\n• AI cần thời gian để phân tích dữ liệu phức tạp\n• Kiểm tra kết nối mạng`;
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorTitle = 'Lỗi kết nối';
        errorMessage = `Không thể kết nối đến server.\n\n• Kiểm tra kết nối internet\n• Server có thể đang bảo trì\n• Thử lại sau vài phút`;
      } else if (error.response?.status === 500) {
        errorTitle = 'Lỗi server';
        errorMessage = `Server gặp sự cố khi xử lý AI.\n\n• Server có thể quá tải\n• OpenAI API có thể gặp vấn đề\n• Thử lại sau vài phút`;
      } else if (error.response?.status === 404) {
        errorTitle = 'API không tìm thấy';
        errorMessage = `Endpoint AI không tồn tại.\n\n• Backend chưa deploy API\n• URL endpoint sai\n• Liên hệ developer`;
      }

      Alert.alert(errorTitle, errorMessage);
    } finally {
      setAiLoading(false);
    }
  };

  const filterTasks = useCallback(() => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(task => task.source === selectedSource);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, selectedSource]);

  useEffect(() => {
    loadTasks();
    // Check CSV analysis status if on imported tab
    if (activeTab === 'imported' && user?.id) {
      checkCSVAnalysisStatus();
    }
  }, [loadTasks]);

  // Auto-refresh when navigating from CSV import
  useEffect(() => {
    if (params.tab === 'imported' && !loading) {
      // Slight delay to ensure navigation has completed
      setTimeout(() => {
        handleRefresh();
      }, 500);
    }
  }, [params.tab]);

  const checkCSVAnalysisStatus = async () => {
    if (!user?.id) return;
    
    try {
      const status = await CSVTaskAnalysisAPI.getAnalysisStatus(user.id);
      setCSVAnalysisStatus(status);
      console.log('CSV Analysis Status:', status);
    } catch (error) {
      console.error('Error checking CSV analysis status:', error);
    }
  };

  useEffect(() => {
    filterTasksByTab(tasks, activeTab);
  }, [tasks, activeTab, searchQuery]);

  const handleTabChange = (tab: 'all' | 'manual' | 'imported') => {
    setActiveTab(tab);
    filterTasksByTab(tasks, tab);
    
    // Check CSV analysis status when switching to imported tab
    if (tab === 'imported' && user?.id) {
      checkCSVAnalysisStatus();
    }
  };

  const handleBatchAnalyze = async () => {
    if (!user?.id) return;
    
    // Get unique import IDs from selected tasks
    const importIds = Array.from(new Set(
      Array.from(selectedTasks)
        .map(id => filteredTasks.find(t => t.task_id === id))
        .filter(task => task?.source === 'imported' && task?.metadata?.import_id)
        .map(task => task!.metadata.import_id as number)
    ));
    
    if (importIds.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn các nhiệm vụ CSV để phân tích hàng loạt');
      return;
    }
    
    setAiLoading(true);
    try {
      const response = await CSVTaskAnalysisAPI.batchAnalyze({
        user_id: user.id,
        import_ids: importIds,
        analysis_type: 'both',
        skip_locked: true
      });
      
      if (response.success) {
        Alert.alert(
          '🚀 Phân tích hàng loạt',
          `Đã gửi ${response.data.entries_submitted} nhiệm vụ từ ${importIds.length} file nhập khẩu để phân tích.\\n` +
          `ID phân tích: ${response.data.analysis_id}`,
          [
            { 
              text: 'Xem tiến độ',
              onPress: () => checkCSVAnalysisStatus()
            },
            { text: 'OK' }
          ]
        );
        
        // Refresh task list
        await loadTasks();
      }
    } catch (error) {
      console.error('Batch analyze error:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện phân tích hàng loạt');
    } finally {
      setAiLoading(false);
    }
  };

  const renderTaskItem = ({ item }: { item: SelectableTask }) => (
    <SelectableTaskCard
      task={item}
      isSelected={selectedTasks.has(item.task_id)}
      onToggleSelect={handleToggleSelect}
      onDelete={handleDeleteTask}
      isDeleting={deletingTasks.has(item.task_id)}
    />
  );

  const renderAIResultModal = () => {
    if (!aiResult) return null;

    const analysis = aiResult.ai_analysis?.structured_response?.analysis;
    if (!analysis) return null;

    return (
      <Modal visible={showAIModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kết quả phân tích AI 🤖</Text>
            <TouchableOpacity onPress={() => setShowAIModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Task Summary */}
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>📊 Tổng quan</Text>
              <Text style={styles.sectionText}>
                • Số lượng nhiệm vụ: {analysis.assessment.task_count}
              </Text>
              <Text style={styles.sectionText}>
                • Tổng thời gian: {analysis.assessment.total_duration} phút
              </Text>
              <Text style={styles.sectionText}>
                • Ưu tiên cao: {analysis.assessment.priority_distribution.high || 0} | 
                  Trung bình: {analysis.assessment.priority_distribution.medium || 0}
              </Text>
            </View>

            {/* Conflicts */}
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>⚠️ Xung đột lịch trình</Text>
              {analysis.conflicts.issues && analysis.conflicts.issues.length > 0 ? (
                analysis.conflicts.issues.map((conflict: any, index: number) => (
                  <View key={index} style={styles.conflictItem}>
                    <Text style={styles.conflictType}>{conflict}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.sectionText}>
                  ✅ {analysis.conflicts.conflict_detection || 'Không có xung đột'}
                </Text>
              )}
            </View>

            {/* Time Management Suggestions */}
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>⏰ Gợi ý quản lý thời gian</Text>
              {analysis.optimization_suggestions.time_management.map((item: any, index: number) => {
                const task = aiResult.selected_tasks.find((t: any) => t.task_id === item.task_id);
                return (
                  <View key={index} style={styles.suggestionItem}>
                    <Text style={styles.taskName}>
                      📌 {task?.title || item.task_id}
                    </Text>
                    <Text style={styles.suggestionText}>
                      → {item.suggestion}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Workload Balance */}
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>⚖️ Cân bằng khối lượng công việc</Text>
              <Text style={styles.sectionText}>
                {analysis.optimization_suggestions.workload_balance}
              </Text>
            </View>

            {/* Priority Recommendations */}
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>🎯 Khuyến nghị ưu tiên</Text>
              <Text style={styles.sectionText}>
                • Ưu tiên cao: {aiResult.selected_tasks.find((t: any) => 
                  t.task_id === analysis.priority_recommendations.high_priority_task)?.title}
              </Text>
              <Text style={styles.sectionText}>
                • Ưu tiên trung bình: {aiResult.selected_tasks.find((t: any) => 
                  t.task_id === analysis.priority_recommendations.medium_priority_task)?.title}
              </Text>
            </View>

            {/* Actionable Improvements */}
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>💡 Cải tiến thực tế</Text>
              {analysis.actionable_improvements.map((item: any, index: number) => {
                const task = aiResult.selected_tasks.find((t: any) => t.task_id === item.task_id);
                return (
                  <View key={index} style={styles.improvementItem}>
                    <Text style={styles.taskName}>
                      📌 {task?.title || item.task_id}
                    </Text>
                    <Text style={styles.improvementText}>
                      ✨ {item.improvement}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* AI Model Info */}
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>🤖 Thông tin AI</Text>
              <Text style={styles.sectionText}>
                • Model: {aiResult.ai_analysis.model_used}
              </Text>
              <Text style={styles.sectionText}>
                • Độ tin cậy: {aiResult.ai_analysis.confidence}
              </Text>
              <Text style={styles.sectionText}>
                • Tokens sử dụng: {aiResult.ai_analysis.usage?.total_tokens || 'N/A'}
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách nhiệm vụ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}> <AIIcon /> Chọn nhiệm vụ cho AI</Text>
            <Text style={styles.headerSubtitle}>
              Chọn các nhiệm vụ để AI phân tích và tối ưu hóa lịch trình
            </Text>
          </View>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => router.push('/profile/ai-analysis-history')}
          >
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.historyButtonText}>Lịch sử</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {tabOptions.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => handleTabChange(tab.key as 'all' | 'manual' | 'imported')}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.key ? '#FFFFFF' : Colors.text.secondary}
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{filteredTasks.length}</Text>
          <Text style={styles.summaryLabel}>Tổng số</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{selectedTasks.size}</Text>
          <Text style={styles.summaryLabel}>Đã chọn</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{summary.selectable_tasks}</Text>
          <Text style={styles.summaryLabel}>Có thể chọn</Text>
        </View>
      </View>

      {/* Show CSV analysis status when on imported tab */}
      {activeTab === 'imported' && csvAnalysisStatus && (
        <View style={styles.csvStatusContainer}>
          <Text style={styles.csvStatusTitle}>Trạng thái phân tích CSV</Text>
          <View style={styles.csvStatusGrid}>
            <View style={styles.csvStatusItem}>
              <Text style={styles.csvStatusNumber}>{csvAnalysisStatus.available_for_analysis || 0}</Text>
              <Text style={styles.csvStatusLabel}>Có thể phân tích</Text>
            </View>
            <View style={styles.csvStatusItem}>
              <Text style={[styles.csvStatusNumber, { color: '#f39c12' }]}>
                {csvAnalysisStatus.in_progress || 0}
              </Text>
              <Text style={styles.csvStatusLabel}>Đang xử lý</Text>
            </View>
            <View style={styles.csvStatusItem}>
              <Text style={[styles.csvStatusNumber, { color: '#27ae60' }]}>
                {csvAnalysisStatus.completed || 0}
              </Text>
              <Text style={styles.csvStatusLabel}>Hoàn thành</Text>
            </View>
            <View style={styles.csvStatusItem}>
              <Text style={[styles.csvStatusNumber, { color: '#e74c3c' }]}>
                {csvAnalysisStatus.locked || 0}
              </Text>
              <Text style={styles.csvStatusLabel}>Đã khóa</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm nhiệm vụ..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllButton}>
          <Ionicons
            name={selectedTasks.size === filteredTasks.filter(t => t.is_selectable).length ? 'checkbox' : 'checkbox-outline'}
            size={20}
            color={Colors.primary}
          />
          <Text style={styles.selectAllText}>
            {selectedTasks.size === filteredTasks.filter(t => t.is_selectable).length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.task_id}
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={Colors.text.secondary} />
            <Text style={styles.emptyText}>Không có nhiệm vụ nào</Text>
            <Text style={styles.emptySubtext}>
              Tạo nhiệm vụ hoặc nhập khẩu lịch trình để bắt đầu
            </Text>
          </View>
        }
      />

      {selectedTasks.size > 0 && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.aiButton, aiLoading && styles.disabledButton]}
            onPress={handleCSVAnalysis}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <AIIcon color="white" size={20} />
            )}
            <Text style={styles.aiButtonText}>
              {aiLoading ? 'Đang phân tích AI... (có thể mất 1-3 phút)' : `Phân tích AI (${selectedTasks.size})`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {renderAIResultModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: 15,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  historyButtonText: {
    ...Typography.body2,
    color: Colors.primary,
    marginLeft: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    ...Typography.h3,
    color: Colors.primary,
    fontSize: 20,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  controlsContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    ...Typography.body1,
    color: Colors.text.primary,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    gap: 6,
  },
  selectAllText: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
  },
  tabContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  tabScroll: {
    paddingHorizontal: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    gap: 6,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    fontWeight: '500',
    fontSize: 14,
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  activeFilterButtonText: {
    color: 'white',
  },
  errorContainer: {
    backgroundColor: Colors.danger + '20' || '#e74c3c20',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    ...Typography.body1,
    color: Colors.danger || '#e74c3c',
    textAlign: 'center',
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  selectedTaskCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.primary + '05',
  },
  disabledTaskCard: {
    opacity: 0.5,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskMainInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedCheckbox: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  disabledCheckbox: {
    opacity: 0.3,
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sourceText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  taskDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  taskDetails: {
    gap: 6,
  },
  taskDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDetailText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginLeft: 6,
    flex: 1,
  },
  disabledText: {
    opacity: 0.5,
  },
  actionContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  aiButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  aiButtonText: {
    ...Typography.button,
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    ...Typography.h4,
    color: Colors.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    ...Typography.body2,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  resultSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  sectionText: {
    ...Typography.body1,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  conflictItem: {
    backgroundColor: Colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  conflictType: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  conflictTasks: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  conflictSuggestion: {
    ...Typography.caption,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  optimizationItem: {
    ...Typography.body1,
    color: Colors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  productivityScore: {
    ...Typography.h1,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  timeSavings: {
    ...Typography.h4,
    color: Colors.success || '#27ae60',
    textAlign: 'center',
    fontWeight: '600',
  },
  suggestionItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: Colors.background.secondary || '#f5f5f5',
    borderRadius: 8,
  },
  taskName: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  suggestionText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  improvementItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  improvementText: {
    ...Typography.body2,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  deleteAction: {
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginBottom: 12,
  },
  deleteButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  deletingTaskCard: {
    opacity: 0.6,
  },
  statusIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f39c1220',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  lockedText: {
    fontSize: 11,
    color: '#f39c12',
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae6020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  completedText: {
    fontSize: 11,
    color: '#27ae60',
    fontWeight: '600',
  },
  failedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  failedText: {
    fontSize: 11,
    color: '#e74c3c',
    fontWeight: '600',
  },
  csvStatusContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  csvStatusTitle: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  csvStatusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  csvStatusItem: {
    alignItems: 'center',
  },
  csvStatusNumber: {
    ...Typography.h4,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  csvStatusLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontSize: 10,
    marginTop: 2,
  },
});