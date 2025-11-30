import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from '../../components/common';
import { Colors, Typography } from '../../constants';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'reminder' | 'nhiệm vụ' | 'sự kiện' | 'cảnh báo';
  isRead: boolean;
  priority: 'thấp' | 'trung bình' | 'cao';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Họp nhóm',
    description: 'Họp đứng hàng ngày trong 15 phút',
    time: '15 phút',
    type: 'reminder',
    isRead: false,
    priority: 'cao'
  },
  {
    id: '2',
    title: 'Nhiệm vụ đến hạn',
    description: 'Hoàn thành slide thuyết trình dự án',
    time: '1 giờ',
    type: 'nhiệm vụ',
    isRead: false,
    priority: 'cao'
  },
  {
    id: '3',
    title: 'Nghỉ trưa',
    description: 'Giờ nghỉ giải lao và ăn trưa',
    time: '2 giờ',
    type: 'reminder',
    isRead: true,
    priority: 'thấp'
  },
  {
    id: '4',
    title: 'Hẹn gặp bác sĩ',
    description: 'Khám sức khỏe định kỳ lúc 3:00 chiều',
    time: '3 giờ',
    type: 'sự kiện',
    isRead: false,
    priority: 'trung bình'
  },
  {
    id: '5',
    title: 'Hạn chót dự án',
    description: 'Nộp báo cáo cuối cùng trước cuối ngày',
    time: '5 giờ',
    type: 'cảnh báo',
    isRead: true,
    priority: 'cao'
  }
]


export default function NotifyScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder': return '🔔';
      case 'nhiệm vụ': return '📝';
      case 'sự kiện': return '📅';
      case 'cảnh báo': return '⚠️';
      default: return '📌';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'cao': return '#EF4444';
      case 'trung bình': return '#F59E0B';
      case 'thấp': return '#10B981';
      default: return Colors.text.secondary;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <ScrollView style={styles.container}>
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
              onPress={() => markAsRead(notification.id)}
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
});