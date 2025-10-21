import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Colors, Typography } from '../../constants';
import { Card, Button } from '../../components/common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  tasksCompleted: number;
  currentStreak: number;
}

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: 'January 2024',
    tasksCompleted: 127,
    currentStreak: 7,
  });

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUserProfile(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const menuItems = [
    { icon: '👤', title: 'Edit Profile', action: () => Alert.alert('Edit Profile', 'Profile editing coming soon!') },
    { icon: '🔔', title: 'Notification Settings', action: () => Alert.alert('Notifications', 'Notification settings coming soon!') },
    { icon: '🔒', title: 'Privacy & Security', action: () => Alert.alert('Privacy', 'Privacy settings coming soon!') },
    { icon: '📊', title: 'Activity Reports', action: () => Alert.alert('Reports', 'Activity reports coming soon!') },
    { icon: '💾', title: 'Backup & Sync', action: () => Alert.alert('Backup', 'Backup settings coming soon!') },
    { icon: '❓', title: 'Help & Support', action: () => Alert.alert('Help', 'Help center coming soon!') },
    { icon: '📜', title: 'Terms of Service', action: () => Alert.alert('Terms', 'Terms of service coming soon!') },
    { icon: 'ℹ️', title: 'About', action: () => Alert.alert('About', 'Schedule Management App v1.0.0') },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.userEmail}>{userProfile.email}</Text>
            <Text style={styles.joinDate}>Member since {userProfile.joinDate}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userProfile.tasksCompleted}</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userProfile.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Settings</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌙</Text>
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E5E7EB', true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔔</Text>
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E5E7EB', true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>☁️</Text>
              <Text style={styles.settingText}>Auto-Sync</Text>
            </View>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: '#E5E7EB', true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Card style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity style={styles.menuItem} onPress={item.action}>
                <View style={styles.menuLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
              {index < menuItems.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card>
      </View>

      <Button
        title="Logout"
        onPress={handleLogout}
        style={styles.logoutButton}
      />

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  profileCard: {
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  joinDate: {
    ...Typography.body2,
    color: Colors.text.tertiary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border.light,
    marginVertical: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  settingsCard: {
    marginHorizontal: 20,
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingText: {
    ...Typography.body2,
    color: Colors.text.primary,
  },
  menuCard: {
    marginHorizontal: 20,
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    ...Typography.body2,
    color: Colors.text.primary,
  },
  menuArrow: {
    fontSize: 20,
    color: Colors.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginHorizontal: 16,
  },
  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: '#EF4444',
    marginBottom: 20,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  version: {
    ...Typography.body2,
    color: Colors.text.tertiary,
  },
});