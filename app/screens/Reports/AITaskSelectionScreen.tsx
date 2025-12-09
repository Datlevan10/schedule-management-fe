import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
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
  View,
  Vibration
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { TaskSelectionAPI, type AIAnalysisRequest, type SelectableTask, type TaskListFilters } from '../../api/task-selection.api';
import { NotificationAPI } from '../../api/notifications.api';
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
    return source === 'manual' ? 'Thủ công' : 'Nhập khẩu';
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

  const sourceOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Thủ công', value: 'manual' },
    { label: 'Nhập khẩu', value: 'imported' }
  ];

  const loadTasks = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      console.log('🔍 Loading user task list for AI selection...');

      // Remove restrictive date filtering to show all user tasks
      const filters: TaskListFilters = {
        // Load all tasks regardless of date for AI analysis
      };

      const response = await TaskSelectionAPI.getUserTaskList(user.id, filters);

      if (response.status === 'success' && response.data) {
        console.log('📋 Raw API Response - Total tasks:', response.data.tasks.length);
        console.log('📋 Task details:');
        response.data.tasks.forEach((task, index) => {
          console.log(`  ${index + 1}. ${task.task_id}: ${task.title}`);
          console.log(`     Date: ${task.start_datetime}`);
          console.log(`     Selectable: ${task.is_selectable}`);
        });
        
        setTasks(response.data.tasks);
        setFilteredTasks(response.data.tasks);
        setSummary(response.data.summary);
        
        console.log('✅ Task list loaded successfully:', {
          totalTasks: response.data.tasks.length,
          summary: response.data.summary
        });
        console.log('📱 State updated - Tasks in memory:', response.data.tasks.length);
      } else {
        throw new Error(response.message || 'Failed to load tasks');
      }
    } catch (error) {
      console.error('❌ Error loading task list:', error);
      setError('Không thể tải danh sách nhiệm vụ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

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
  }, [loadTasks]);

  useEffect(() => {
    filterTasks();
  }, [filterTasks]);

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

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{summary.total_tasks}</Text>
          <Text style={styles.summaryLabel}>Tổng số</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{summary.manual_tasks}</Text>
          <Text style={styles.summaryLabel}>Thủ công</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{summary.imported_tasks}</Text>
          <Text style={styles.summaryLabel}>Nhập khẩu</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{selectedTasks.size}</Text>
          <Text style={styles.summaryLabel}>Đã chọn</Text>
        </View>
      </View>

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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllButton}>
            <Text style={styles.selectAllText}>
              {selectedTasks.size === filteredTasks.filter(t => t.is_selectable).length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Text>
          </TouchableOpacity>

          {sourceOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterButton,
                selectedSource === option.value && styles.activeFilterButton
              ]}
              onPress={() => setSelectedSource(option.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedSource === option.value && styles.activeFilterButtonText
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
            onPress={handleAIAnalysis}
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    marginRight: 8,
  },
  selectAllText: {
    ...Typography.caption,
    color: Colors.primary,
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
});