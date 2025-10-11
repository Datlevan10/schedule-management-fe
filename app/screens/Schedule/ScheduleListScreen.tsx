import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Schedule } from '../../api/schedule.api';
import { Button, Card } from '../../components/common';
import { Colors, Typography } from '../../constants';
import { useSchedule } from '../../hooks';

interface ScheduleItemProps {
  schedule: Schedule;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({
  schedule,
  onPress,
  onEdit,
  onDelete,
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return Colors.danger;
      case 'medium':
        return Colors.warning;
      case 'low':
        return Colors.success;
      default:
        return Colors.gray;
    }
  };

  return (
    <Card onPress={onPress} style={styles.scheduleItem}>
      <View style={styles.scheduleHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.scheduleTitle} numberOfLines={1}>
            {schedule.title}
          </Text>
          {schedule.priority && (
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(schedule.priority) },
              ]}
            >
              <Text style={styles.priorityText}>
                {schedule.priority.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Text style={styles.actionText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Text style={styles.actionText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.scheduleDetails}>
        <Text style={styles.timeText}>
          {formatDate(schedule.startTime)} • {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
        </Text>
        {schedule.location && (
          <Text style={styles.locationText}>📍 {schedule.location}</Text>
        )}
        {schedule.description && (
          <Text style={styles.descriptionText} numberOfLines={2}>
            {schedule.description}
          </Text>
        )}
      </View>

      {schedule.category && (
        <View style={styles.categoryContainer}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: schedule.color || Colors.primary },
            ]}
          >
            <Text style={styles.categoryText}>{schedule.category}</Text>
          </View>
        </View>
      )}
    </Card>
  );
};

export default function ScheduleListScreen() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [refreshing, setRefreshing] = useState(false);

  const {
    schedules,
    loading,
    error,
    refetch,
    remove,
    isDeleting,
  } = useSchedule();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddSchedule = () => {
    router.push('/schedule/add');
  };

  const handleSchedulePress = (schedule: Schedule) => {
    router.push(`/schedule/${schedule.id}`);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    router.push(`/schedule/edit/${schedule.id}`);
  };

  const handleDeleteSchedule = (schedule: Schedule) => {
    Alert.alert(
      'Delete Schedule',
      `Are you sure you want to delete "${schedule.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(schedule.id),
        },
      ]
    );
  };

  const confirmDelete = async (id: string) => {
    const result = await remove(id);
    if (result.success) {
      Alert.alert('Success', 'Schedule deleted successfully');
    } else {
      Alert.alert('Error', result.error || 'Failed to delete schedule');
    }
  };

  const renderScheduleItem = ({ item }: { item: Schedule }) => (
    <ScheduleItem
      schedule={item}
      onPress={() => handleSchedulePress(item)}
      onEdit={() => handleEditSchedule(item)}
      onDelete={() => handleDeleteSchedule(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📅</Text>
      <Text style={styles.emptyStateTitle}>No Schedules Yet</Text>
      <Text style={styles.emptyStateMessage}>
        Create your first schedule to get started with managing your time
      </Text>
      <Button
        title="Add Schedule"
        onPress={handleAddSchedule}
        style={styles.emptyStateButton}
      />
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load schedules</Text>
        <Button title="Retry" onPress={refetch} variant="outline" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Schedule</Text>
          <Text style={styles.headerSubtitle}>
            {schedules.length} {schedules.length === 1 ? 'event' : 'events'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'list' && styles.activeViewMode,
            ]}
            onPress={() => setViewMode('list')}
          >
            <Text style={styles.viewModeText}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'calendar' && styles.activeViewMode,
            ]}
            onPress={() => setViewMode('calendar')}
          >
            <Text style={styles.viewModeText}>📅</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={schedules}
        renderItem={renderScheduleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddSchedule}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  activeViewMode: {
    backgroundColor: Colors.primary,
  },
  viewModeText: {
    fontSize: 20,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  scheduleItem: {
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleTitle: {
    ...Typography.h5,
    color: Colors.text.primary,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    ...Typography.overline,
    color: Colors.white,
    fontSize: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
  },
  scheduleDetails: {
    marginBottom: 12,
  },
  timeText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  locationText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  descriptionText: {
    ...Typography.body2,
    color: Colors.text.tertiary,
    lineHeight: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyStateMessage: {
    ...Typography.body1,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 32,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    ...Typography.body1,
    color: Colors.danger,
    marginBottom: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: '600',
  },
});