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
  type: 'reminder' | 'task' | 'event' | 'alert';
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Daily standup meeting in 15 minutes',
    time: '15 min',
    type: 'reminder',
    isRead: false,
    priority: 'high',
  },
  {
    id: '2',
    title: 'Task Due',
    description: 'Complete project presentation slides',
    time: '1 hour',
    type: 'task',
    isRead: false,
    priority: 'high',
  },
  {
    id: '3',
    title: 'Lunch Break',
    description: 'Time to take a break and have lunch',
    time: '2 hours',
    type: 'reminder',
    isRead: true,
    priority: 'low',
  },
  {
    id: '4',
    title: 'Doctor Appointment',
    description: 'Annual health checkup at 3:00 PM',
    time: '3 hours',
    type: 'event',
    isRead: false,
    priority: 'medium',
  },
  {
    id: '5',
    title: 'Project Deadline',
    description: 'Submit final report by end of day',
    time: '5 hours',
    type: 'alert',
    isRead: true,
    priority: 'high',
  },
];

export default function NotifyScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder': return '🔔';
      case 'task': return '📝';
      case 'event': return '📅';
      case 'alert': return '⚠️';
      default: return '📌';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
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
            <Text style={styles.emptyTitle}>No notifications</Text>
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
              <Card style={[
                styles.notificationCard,
                !notification.isRead && styles.unreadCard,
              ]}>
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
        <Text style={styles.sectionTitle}>Quick Settings</Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Notification Sound</Text>
            <Text style={styles.settingValue}>Default</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Vibration</Text>
            <Text style={styles.settingValue}>On</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Do Not Disturb</Text>
            <Text style={styles.settingValue}>Off</Text>
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