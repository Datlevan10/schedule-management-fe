import { Ionicons } from '@expo/vector-icons';
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
  View
} from 'react-native';
import { Colors, Typography } from '../../constants';
import { TaskSelectionAPI, type SelectableTask, type TaskListFilters, type AIAnalysisRequest } from '../../api/task-selection.api';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

interface SelectableTaskCardProps {
  task: SelectableTask;
  isSelected: boolean;
  onToggleSelect: (taskId: string) => void;
}

const SelectableTaskCard = ({ task, isSelected, onToggleSelect }: SelectableTaskCardProps) => {
  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

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
    <Pressable 
      style={[
        styles.taskCard, 
        isSelected && styles.selectedTaskCard,
        !task.is_selectable && styles.disabledTaskCard
      ]} 
      onPress={() => task.is_selectable && onToggleSelect(task.task_id)}
      disabled={!task.is_selectable}
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

      const filters: TaskListFilters = {
        upcoming_only: true,
        date_from: new Date().toISOString().split('T')[0]
      };

      const response = await TaskSelectionAPI.getUserTaskList(user.id, filters);
      
      if (response.status === 'success' && response.data) {
        setTasks(response.data.tasks);
        setFilteredTasks(response.data.tasks);
        setSummary(response.data.summary);
        console.log('✅ Task list loaded successfully:', response.data.summary);
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
      const analysisRequest: AIAnalysisRequest = {
        selected_tasks: Array.from(selectedTasks),
        analysis_type: 'optimization',
        focus_areas: ['conflict_detection', 'time_optimization', 'workload_balance']
      };

      const response = await TaskSelectionAPI.analyzeSelectedTasks(user!.id, analysisRequest);
      
      if (response.status === 'success') {
        setAiResult(response.data);
        setShowAIModal(true);
        console.log('✅ AI analysis completed:', response.data);
      } else {
        throw new Error(response.message || 'AI analysis failed');
      }
    } catch (error) {
      console.error('❌ Error in AI analysis:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện phân tích AI. Vui lòng thử lại.');
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
    />
  );

  const renderAIResultModal = () => {
    if (!aiResult) return null;

    return (
      <Modal visible={showAIModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kết quả phân tích AI</Text>
            <TouchableOpacity onPress={() => setShowAIModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>Đánh giá tổng quan</Text>
              <Text style={styles.sectionText}>
                {aiResult.ai_analysis.structured_response.assessment}
              </Text>
            </View>

            {aiResult.ai_analysis.structured_response.conflicts.length > 0 && (
              <View style={styles.resultSection}>
                <Text style={styles.sectionTitle}>Xung đột phát hiện</Text>
                {aiResult.ai_analysis.structured_response.conflicts.map((conflict: any, index: number) => (
                  <View key={index} style={styles.conflictItem}>
                    <Text style={styles.conflictType}>{conflict.type}</Text>
                    <Text style={styles.conflictTasks}>Nhiệm vụ: {conflict.tasks.join(', ')}</Text>
                    <Text style={styles.conflictSuggestion}>Gợi ý: {conflict.suggestion}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>Tối ưu hóa</Text>
              {aiResult.ai_analysis.structured_response.optimizations.map((opt: string, index: number) => (
                <Text key={index} style={styles.optimizationItem}>• {opt}</Text>
              ))}
            </View>

            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>Điểm năng suất</Text>
              <Text style={styles.productivityScore}>
                {aiResult.ai_analysis.structured_response.productivity_score}/100
              </Text>
            </View>

            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>Tiết kiệm thời gian</Text>
              <Text style={styles.timeSavings}>
                {aiResult.ai_analysis.structured_response.time_savings}
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
        <Text style={styles.headerTitle}>Chọn nhiệm vụ cho AI</Text>
        <Text style={styles.headerSubtitle}>
          Chọn các nhiệm vụ để AI phân tích và tối ưu hóa lịch trình
        </Text>
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
              <Ionicons name="brain" size={20} color="white" />
            )}
            <Text style={styles.aiButtonText}>
              {aiLoading ? 'Đang phân tích...' : `Phân tích AI (${selectedTasks.size})`}
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
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...Typography.body1,
    color: Colors.text.secondary,
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
});