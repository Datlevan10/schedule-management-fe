import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors, Typography } from '../../constants';
import { ActivityReportsAPI, type UserTaskActivity, type ActivityFilters } from '../../api/activity-reports.api';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

interface TaskCardProps {
  task: UserTaskActivity;
  onPress: (task: UserTaskActivity) => void;
}

const TaskCard = ({ task, onPress }: TaskCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'in_progress':
        return Colors.warning;
      case 'scheduled':
        return Colors.primary;
      case 'cancelled':
        return Colors.danger || '#e74c3c';
      case 'postponed':
        return Colors.info || '#3498db';
      default:
        return Colors.text.secondary;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'alert-circle';
      case 'high':
        return 'chevron-up-circle';
      case 'medium':
        return 'remove-circle';
      case 'low':
        return 'chevron-down-circle';
      default:
        return 'ellipse';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Pressable style={styles.taskCard} onPress={() => onPress(task)}>
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {task.title}
          </Text>
          <View style={styles.taskMeta}>
            <Ionicons 
              name={getPriorityIcon(task.priority)} 
              size={16} 
              color={getStatusColor(task.status)} 
            />
            <Text style={[styles.taskStatus, { color: getStatusColor(task.status) }]}>
              {task.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
          <Text style={[styles.priorityText, { color: getStatusColor(task.status) }]}>
            {task.priority.toUpperCase()}
          </Text>
        </View>
      </View>

      {task.description && (
        <Text style={styles.taskDescription} numberOfLines={2}>
          {task.description}
        </Text>
      )}

      <View style={styles.taskDetails}>
        <View style={styles.taskDetailRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.text.secondary} />
          <Text style={styles.taskDetailText}>
            {formatDate(task.start_datetime)}
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

        {task.category && (
          <View style={styles.taskDetailRow}>
            <Ionicons name="folder-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.taskDetailText}>
              {task.category.name}
            </Text>
          </View>
        )}

        <View style={styles.taskDetailRow}>
          <Ionicons name="person-outline" size={14} color={Colors.text.secondary} />
          <Text style={styles.taskDetailText}>
            {task.user.name}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default function ActivityReportsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<UserTaskActivity[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<UserTaskActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);

  const statusOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Hoàn thành', value: 'completed' },
    { label: 'Đang thực hiện', value: 'in_progress' },
    { label: 'Đã lên lịch', value: 'scheduled' },
    { label: 'Đã hủy', value: 'cancelled' },
    { label: 'Hoãn lại', value: 'postponed' },
  ];

  const priorityOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Khẩn cấp', value: 'urgent' },
    { label: 'Cao', value: 'high' },
    { label: 'Trung bình', value: 'medium' },
    { label: 'Thấp', value: 'low' },
  ];

  const loadActivities = useCallback(async () => {
    try {
      setError(null);
      console.log('🔍 Loading user activities...');

      const filters: ActivityFilters = {
        user_id: user?.id,
        per_page: 50
      };

      const response = await ActivityReportsAPI.getUserActivities(filters);
      
      if (response.status === 'success' && response.data) {
        setTasks(response.data.tasks);
        setFilteredTasks(response.data.tasks);
        setTotalTasks(response.data.summary.total_tasks);
        setCompletionRate(response.data.summary.completion_rate);
        console.log('✅ Activities loaded:', response.data.tasks.length);
      } else {
        throw new Error(response.message || 'Failed to load activities');
      }
    } catch (error: any) {
      console.error('❌ Error loading activities:', error);
      setError(error.message || 'Failed to load activities');
      
      // Fallback demo data
      const demoTasks: UserTaskActivity[] = [
        {
          id: 1,
          title: 'Họp team meeting',
          description: 'Review sprint progress and plan next week',
          start_datetime: new Date().toISOString(),
          end_datetime: new Date(Date.now() + 3600000).toISOString(),
          location: 'Meeting Room A',
          status: 'completed',
          priority: 'high',
          task_type: 'meeting',
          category: { id: 1, name: 'Work' },
          user: { id: user?.id || 1, name: user?.name || 'Demo User', email: user?.email || 'demo@example.com' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Viết báo cáo tháng',
          description: 'Tổng kết các hoạt động trong tháng',
          start_datetime: new Date(Date.now() + 86400000).toISOString(),
          end_datetime: new Date(Date.now() + 90000000).toISOString(),
          location: 'Office',
          status: 'in_progress',
          priority: 'medium',
          task_type: 'report',
          category: { id: 2, name: 'Reports' },
          user: { id: user?.id || 1, name: user?.name || 'Demo User', email: user?.email || 'demo@example.com' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      
      setTasks(demoTasks);
      setFilteredTasks(demoTasks);
      setTotalTasks(demoTasks.length);
      setCompletionRate(50);
    }
  }, [user]);

  const filterTasks = useCallback(() => {
    let filtered = tasks;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, selectedStatus, selectedPriority]);

  useEffect(() => {
    filterTasks();
  }, [filterTasks]);

  useEffect(() => {
    loadActivities().finally(() => setLoading(false));
  }, [loadActivities]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  }, [loadActivities]);

  const handleTaskPress = (task: UserTaskActivity) => {
    console.log('Task pressed:', task.title);
    // TODO: Navigate to task detail screen
  };

  const FilterButton = ({ 
    label, 
    value, 
    selectedValue, 
    onSelect 
  }: {
    label: string;
    value: string;
    selectedValue: string;
    onSelect: (value: string) => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        value === selectedValue && styles.filterButtonActive
      ]}
      onPress={() => onSelect(value)}
    >
      <Text style={[
        styles.filterButtonText,
        value === selectedValue && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-outline" size={64} color={Colors.text.secondary} />
      <Text style={styles.emptyStateTitle}>Không có hoạt động nào</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all' 
          ? 'Không tìm thấy hoạt động phù hợp với bộ lọc'
          : 'Bạn chưa có hoạt động nào được ghi nhận'
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải báo cáo hoạt động...</Text>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Báo Cáo Hoạt Động</Text>
        <Text style={styles.subtitle}>
          {totalTasks} hoạt động • {completionRate}% hoàn thành
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          <Text style={styles.summaryNumber}>{filteredTasks.filter(t => t.status === 'completed').length}</Text>
          <Text style={styles.summaryLabel}>Hoàn thành</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="time" size={24} color={Colors.warning} />
          <Text style={styles.summaryNumber}>{filteredTasks.filter(t => t.status === 'in_progress').length}</Text>
          <Text style={styles.summaryLabel}>Đang thực hiện</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="calendar" size={24} color={Colors.primary} />
          <Text style={styles.summaryNumber}>{filteredTasks.filter(t => t.status === 'scheduled').length}</Text>
          <Text style={styles.summaryLabel}>Đã lên lịch</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm hoạt động..."
          placeholderTextColor={Colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Trạng thái:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusOptions}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <FilterButton
              label={item.label}
              value={item.value}
              selectedValue={selectedStatus}
              onSelect={setSelectedStatus}
            />
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Độ ưu tiên:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={priorityOptions}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <FilterButton
              label={item.label}
              value={item.value}
              selectedValue={selectedPriority}
              onSelect={setSelectedPriority}
            />
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskCard task={item} onPress={handleTaskPress} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          filteredTasks.length === 0 && styles.listContentEmpty
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  errorText: {
    ...Typography.body2,
    color: Colors.danger || '#e74c3c',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },

  // Summary Cards
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    ...Typography.h2,
    color: Colors.text.primary,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    ...Typography.body1,
    color: Colors.text.primary,
    flex: 1,
    marginLeft: 12,
  },

  // Filters
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterLabel: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterList: {
    paddingRight: 20,
  },
  filterButton: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border || '#e1e1e1',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },

  // Task List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listContentEmpty: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskStatus: {
    ...Typography.caption,
    fontWeight: '600',
    marginLeft: 4,
  },
  priorityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    marginLeft: 8,
    flex: 1,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});