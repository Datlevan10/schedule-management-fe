import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, StorageKeys } from '../constants';
import { NotificationAPI } from '../api/notifications.api';
import { MaterialIcons } from '@expo/vector-icons';

interface NotificationBadgeProps {
  color: string;
  size: number;
}

export default function NotificationBadge({ color, size }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    
    // Set up interval to check for new notifications periodically
    const interval = setInterval(checkForNewNotifications, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const checkForNewNotifications = async () => {
    try {
      const newNotificationFlag = await AsyncStorage.getItem('newNotificationAvailable');
      if (newNotificationFlag === 'true') {
        // Clear the flag and reload count
        await AsyncStorage.removeItem('newNotificationAvailable');
        loadUnreadCount();
      }
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem(StorageKeys.AUTH.USER_DATA);
      if (!userDataStr) return;

      const userData = JSON.parse(userDataStr);
      const userId = userData.id;

      // Get enhanced notification count including priority notifications
      const enhancedNotifications = await NotificationAPI.getEnhancedAINotifications(userId);
      const count = enhancedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  return (
    <View style={styles.container}>
      <MaterialIcons name="notifications" size={size} color={color} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});