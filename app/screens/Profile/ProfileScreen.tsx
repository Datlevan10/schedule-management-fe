import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { UserAPI, UserProfile } from '../../api/user.api';
import { Button, Card } from '../../components/common';
import { Colors, Typography } from '../../constants';


export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await UserAPI.getUserProfile();
      if (response.success && response.data) {
        setUserProfile(response.data);
        setNotifications(response.data.notification_preferences?.push_notifications ?? true);
      }
    } catch (error: any) {
      console.error('Error loading user profile:', error);
      // If user ID not found, user might not be properly logged in
      if (error.message === 'User ID not found') {
        Alert.alert(
          'Authentication Required', 
          'Please log in again to view your profile.',
          [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
        );
      } else {
        Alert.alert('Error', 'Failed to load user profile');
      }
    } finally {
      setLoading(false);
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
    { icon: '👤', title: 'Edit Profile', action: () => router.push('/profile/edit-profile') },
    { icon: '🔔', title: 'Notification Settings', action: () => router.push('/profile/notification-settings') },
    { icon: '🔒', title: 'Privacy & Security', action: () => router.push('/profile/privacy-security') },
    { icon: '📊', title: 'Activity Reports', action: () => router.push('/profile/activity-reports') },
    { icon: '💾', title: 'Backup & Sync', action: () => router.push('/profile/backup-sync') },
    { icon: '❓', title: 'Help & Support', action: () => router.push('/profile/help-support') },
    { icon: '📜', title: 'Terms of Service', action: () => router.push('/profile/terms-of-service') },
    { icon: 'ℹ️', title: 'About', action: () => router.push('/profile/about') },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <Button title="Retry" onPress={loadUserProfile} style={styles.retryButton} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hồ sơ</Text>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.userEmail}>{userProfile.email}</Text>
            {userProfile.email_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
            <Text style={styles.joinDate}>Thành viên từ {userProfile.member_since}</Text>
          </View>
        </View>

        <View style={styles.professionalInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Profession:</Text>
            <Text style={styles.infoValue}>
              {userProfile.profession?.display_name} ({userProfile.profession?.level})
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Workplace:</Text>
            <Text style={styles.infoValue}>{userProfile.workplace}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Department:</Text>
            <Text style={styles.infoValue}>{userProfile.department}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Work Schedule:</Text>
            <Text style={styles.infoValue}>
              {userProfile.work_schedule?.join(', ')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Work Habits:</Text>
            <Text style={styles.infoValue}>
              {userProfile.work_habits?.join(', ')}
            </Text>
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
        title="Đăng xuất"
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  errorText: {
    ...Typography.body1,
    color: Colors.danger,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 32,
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  verifiedText: {
    ...Typography.body2,
    color: Colors.success,
    fontWeight: '600',
  },
  professionalInfo: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    fontWeight: '600',
    width: 120,
  },
  infoValue: {
    ...Typography.body2,
    color: Colors.text.primary,
    flex: 1,
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