import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { NotificationAPI } from '../../api/notifications.api';
import { Card } from '../../components/common';
import { Colors, StorageKeys, Typography } from '../../constants';
import { notificationService } from '../../services/NotificationService';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'ai_analysis' | 'priority_task' | 'reminder' | 'nhiệm vụ' | 'sự kiện' | 'cảnh báo';
  isRead: boolean;
  priority: 'thấp' | 'trung bình' | 'cao' | 'rất cao';
  analysis_id?: number;
  task_id?: string;
  created_at?: string;
}



export default function NotifyScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      console.log('🔔 ===== NOTIFY SCREEN: LOADING NOTIFICATIONS =====');
      setLoading(true);

      // Debug: Check what keys are stored in AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('🔍 All AsyncStorage keys:', allKeys);

      // Try both possible user data keys
      const userDataStr = await AsyncStorage.getItem(StorageKeys.AUTH.USER_DATA);
      const oldUserDataStr = await AsyncStorage.getItem('userData');

      console.log('🔍 USER_DATA (@user_data):', userDataStr ? 'found' : 'not found');
      console.log('🔍 userData (old key):', oldUserDataStr ? 'found' : 'not found');

      const finalUserData = userDataStr || oldUserDataStr;

      if (!finalUserData) {
        console.log('❌ No user data found in either key, showing empty notifications');
        setNotifications([]);
        return;
      }

      const userData = JSON.parse(finalUserData);
      const userId = userData.id;
      console.log('👤 User ID found:', userId);

      // Load Enhanced AI notifications with Task Priority from backend
      console.log('📱 Calling getEnhancedAINotifications...');
      const aiNotifications = await NotificationAPI.getEnhancedAINotifications(userId);

      // Generate task reminders for upcoming high-priority tasks
      console.log('⏰ Generating task reminders...');
      await notificationService.generateTaskReminders(userId);

      // Use only backend notifications
      console.log('✅ Setting notifications:', aiNotifications.length);
      setNotifications(aiNotifications);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      setNotifications([]); // Show empty array on error instead of mock data
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('🔔 ===== NOTIFY SCREEN: LOADING COMPLETE =====');
    }
  }, []);

  // Load notifications on component mount
  useEffect(() => {
    console.log('🔔 NotifyScreen useEffect triggered - loading notifications...');
    loadNotifications();
  }, [loadNotifications]);

  // Load notifications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔔 NotifyScreen focused - reloading notifications...');
      loadNotifications();
    }, [loadNotifications])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ai_analysis': return '🤖';
      case 'priority_task': return '⭐';
      case 'reminder': return '🔔';
      case 'nhiệm vụ': return '📝';
      case 'sự kiện': return '📅';
      case 'cảnh báo': return '⚠️';
      default: return '📌';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'rất cao': return '#DC2626'; // Critical - Dark red
      case 'cao': return '#EF4444'; // High - Red
      case 'trung bình': return '#F59E0B'; // Medium - Orange
      case 'thấp': return '#10B981'; // Low - Green
      default: return Colors.text.secondary;
    }
  };

  const markAsRead = async (id: string) => {
    // Mark as read in local state
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );

    // Mark as read via API
    try {
      await NotificationAPI.markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);

    // Handle navigation based on notification type
    if (notification.type === 'ai_analysis' && notification.analysis_id) {
      // Navigate to AI analysis history
      router.push('/profile/ai-analysis-history');
    } else if (notification.type === 'priority_task') {
      if (notification.analysis_id && notification.task_id) {
        // Navigate to AI task selection with focus on the specific task and analysis
        router.push({
          pathname: '/screens/Reports/AITaskSelectionScreen',
          params: {
            analysisId: notification.analysis_id.toString(),
            taskId: notification.task_id,
            priority: 'high'
          }
        });
      } else if (notification.analysis_id) {
        // Navigate to AI task selection with focus on the specific analysis
        router.push({
          pathname: '/screens/Reports/AITaskSelectionScreen',
          params: { analysisId: notification.analysis_id.toString() }
        });
      } else {
        // Default navigation to task selection screen
        router.push('/screens/Reports/AITaskSelectionScreen');
      }
    } else if (notification.type === 'cảnh báo' && notification.analysis_id) {
      // Navigate to AI analysis history for warnings/conflicts
      router.push('/profile/ai-analysis-history');
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông báo...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Thông báo</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </Text>
        </View>
        <View style={styles.notificationToggle}>
          <Text style={styles.toggleLabel}>Cho phép</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E5E7EB', true: Colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'unread' && styles.filterButtonActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            Chưa đọc ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.notificationsList}>
        {filteredNotifications.length === 0 ? (
          <Card style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Không có thông báo</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread' ? 'All notifications have been read' : 'You have no notifications at this time'}
            </Text>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => handleNotificationPress(notification)}
            >
              <Card>
                <View style={styles.notificationHeader}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.typeIcon}>{getTypeIcon(notification.type)}</Text>
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.titleRow}>
                      <Text style={[
                        styles.notificationTitle,
                        !notification.isRead && styles.unreadTitle,
                      ]}>
                        {notification.title}
                      </Text>
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: getPriorityColor(notification.priority) },
                        ]}
                      />
                    </View>
                    <Text style={styles.notificationDescription}>
                      {notification.description}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {notification.time}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Cài đặt nhanh</Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Âm thanh thông báo</Text>
            <Text style={styles.settingValue}>Default</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Rung động</Text>
            <Text style={styles.settingValue}>On</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Không làm phiền</Text>
            <Text style={styles.settingValue}>Tắt</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  notificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  notificationsList: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 16
  },
  notificationCard: {
    padding: 16,
    marginBottom: 12,
  },
  unreadCard: {
    backgroundColor: '#F0F4FF',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeIcon: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  unreadTitle: {
    color: Colors.primary,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  notificationTime: {
    ...Typography.body2,
    color: Colors.text.tertiary,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingText: {
    ...Typography.body2,
    color: Colors.text.primary,
  },
  settingValue: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.text.secondary,
    marginTop: 10,
  },
});