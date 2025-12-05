import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { UserAPI, UserProfile } from '../../api/user.api';
import { Button, Card } from '../../components/common';
import { Colors, Typography } from '../../constants';
import { useAuth } from '../../hooks';
import {
  deviceSpecific,
  getSafeAreaInsets,
  isIPhone7Plus,
  isLargeDevice,
  layoutHelpers,
  moderateScale,
  responsiveFontSize,
  scale,
  spacing
} from '../../utils/responsive';


export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  // Get user data from useAuth hook (for user ID)
  const { user, logout } = useAuth();

  useEffect(() => {
    // Only load profile if user is authenticated and has an ID
    if (user?.id) {
      console.log('✅ Loading profile for authenticated user ID:', user.id);
      loadUserProfile(user.id);
    } else {
      console.log('❌ No authenticated user found, cannot load profile');
      setLoading(false);
    }
  }, [user?.id]);

  const loadUserProfile = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      console.log('🔍 Loading user profile for user ID:', userId);

      // Use the /users/{id} endpoint with user ID
      const response = await UserAPI.getUserProfile(userId);

      console.log('📦 Profile API Response:', response);

      if (response.success && response.data) {
        setUserProfile(response.data);
        setNotifications(response.data.notification_preferences?.push_notifications ?? true);
        console.log('✅ User profile loaded successfully');
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('❌ Error loading user profile:', error);

      // Handle different types of errors without redirecting to login
      if (error.response?.status === 404) {
        Alert.alert(
          'Không tìm thấy người dùng',
          'Không thể tìm thấy hồ sơ người dùng.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Thử lại', onPress: () => loadUserProfile(userId) }
          ]
        );
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        Alert.alert(
          'Lỗi kết nối',
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Thử lại', onPress: () => loadUserProfile(userId) }
          ]
        );
      } else {
        Alert.alert(
          'Lỗi',
          'Không thể tải hồ sơ người dùng. Vui lòng thử lại.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Thử lại', onPress: () => loadUserProfile(userId) }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 Logging out user...');

              // Clear user data from auth hook
              await logout();

              console.log('✅ Logout successful');
              router.replace('/welcome');
            } catch (error) {
              console.error('❌ Logout error:', error);
              // Even if logout fails, clear local storage and redirect
              await AsyncStorage.clear();
              router.replace('/welcome');
            }
          },
        },
      ]
    );
  }, [logout]);

  const menuItems = [
    { icon: '👤', title: 'Chỉnh sửa hồ sơ', action: () => router.push(`/profile/edit-profile?userId=${user?.id}`) },
    { icon: '🔔', title: 'Cài đặt thông báo', action: () => router.push('/profile/notification-settings') },
    { icon: '🔒', title: 'Quyền riêng tư & Bảo mật', action: () => router.push('/profile/privacy-security') },
    { icon: '📊', title: 'Báo cáo hoạt động', action: () => router.push('/profile/activity-reports') },
    { icon: '🤖', title: 'Phân tích AI nhiệm vụ', action: () => router.push('/profile/ai-task-selection') },
    { icon: '💾', title: 'Sao lưu & Đồng bộ', action: () => router.push('/profile/backup-sync') },
    { icon: '❓', title: 'Hỗ trợ & Trợ giúp', action: () => router.push('/profile/help-support') },
    { icon: '📜', title: 'Điều khoản dịch vụ', action: () => router.push('/profile/terms-of-service') },
    { icon: 'ℹ️', title: 'Giới thiệu', action: () => router.push('/profile/about') },
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
        <Text style={styles.errorText}>Không thể tải hồ sơ</Text>
        <Button
          title="Thử lại"
          onPress={() => {
            const userId = user?.id || 3;
            loadUserProfile(userId);
          }}
          style={styles.retryButton}
        />
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
            <Text style={styles.infoLabel}>Nghề nghiệp:</Text>
            <Text style={styles.infoValue}>
              {userProfile.profession?.display_name} ({userProfile.profession?.level})
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nơi làm việc:</Text>
            <Text style={styles.infoValue}>{userProfile.workplace}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Khoa/Phòng:</Text>
            <Text style={styles.infoValue}>{userProfile.department}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lịch làm việc:</Text>
            <Text style={styles.infoValue}>
              {userProfile.work_schedule?.join(', ')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thói quen làm việc:</Text>
            <Text style={styles.infoValue}>
              {userProfile.work_habits?.join(', ')}
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt nhanh</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌙</Text>
              <Text style={styles.settingText}>Chế độ tối</Text>
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
              <Text style={styles.settingText}>Thông báo đẩy</Text>
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
              <Text style={styles.settingText}>Tự động đồng bộ</Text>
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
        <Text style={styles.sectionTitle}>Tài khoản</Text>
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
        <Text style={styles.version}>Phiên bản 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

// Get responsive layout properties
const profileLayout = layoutHelpers.getProfileLayoutProps();
const cardLayout = layoutHelpers.getCardLayoutProps();
const buttonLayout = layoutHelpers.getButtonLayoutProps();
const safeAreaInsets = getSafeAreaInsets();
const isLarge = isLargeDevice();
const iPhone7Plus = isIPhone7Plus();

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
    paddingHorizontal: profileLayout.containerPadding,
    paddingTop: safeAreaInsets.top + spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: responsiveFontSize['3xl'],
    fontWeight: Typography.h2.fontWeight,
    lineHeight: moderateScale(Typography.h2.lineHeight),
    color: Colors.text.primary,
  },
  errorText: {
    fontSize: responsiveFontSize.lg,
    fontWeight: Typography.body1.fontWeight,
    lineHeight: moderateScale(Typography.body1.lineHeight),
    color: Colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    height: deviceSpecific.buttonHeight(),
  },
  profileCard: {
    marginHorizontal: profileLayout.cardMargin,
    padding: iPhone7Plus ? spacing.xl : spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: cardLayout.borderRadius,
    backgroundColor: Colors.background.primary,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: cardLayout.shadowRadius,
    elevation: cardLayout.elevation,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    width: profileLayout.avatarSize,
    height: profileLayout.avatarSize,
    borderRadius: profileLayout.avatarSize / 2,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarEmoji: {
    fontSize: moderateScale(isLarge ? 45 : 35),
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: profileLayout.profileInfoWidth,
  },
  userName: {
    fontSize: responsiveFontSize.xl,
    fontWeight: Typography.h3.fontWeight,
    lineHeight: moderateScale(Typography.h3.lineHeight),
    color: Colors.text.primary,
    marginBottom: scale(4),
  },
  userEmail: {
    fontSize: responsiveFontSize.base,
    fontWeight: Typography.body2.fontWeight,
    lineHeight: moderateScale(Typography.body2.lineHeight),
    color: Colors.text.secondary,
    marginBottom: scale(4),
  },
  joinDate: {
    fontSize: responsiveFontSize.sm,
    fontWeight: Typography.body2.fontWeight,
    lineHeight: moderateScale(16),
    color: Colors.text.tertiary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: scale(4),
  },
  verifiedText: {
    fontSize: responsiveFontSize.sm,
    color: Colors.success,
    fontWeight: '600',
  },
  professionalInfo: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  infoRow: {
    flexDirection: isLarge ? 'row' : 'column',
    marginBottom: iPhone7Plus ? spacing.md : scale(10),
    alignItems: isLarge ? 'center' : 'flex-start',
  },
  infoLabel: {
    fontSize: responsiveFontSize.sm,
    color: Colors.text.secondary,
    fontWeight: '600',
    width: isLarge ? scale(120) : 'auto',
    marginBottom: isLarge ? 0 : scale(2),
  },
  infoValue: {
    fontSize: responsiveFontSize.base,
    color: Colors.text.primary,
    flex: isLarge ? 1 : 0,
    lineHeight: moderateScale(18),
  },
  statsContainer: {
    flexDirection: 'row',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: responsiveFontSize.xl,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: scale(4),
  },
  statLabel: {
    fontSize: responsiveFontSize.sm,
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border.light,
    marginVertical: scale(4),
  },
  section: {
    marginBottom: profileLayout.sectionSpacing,
  },
  sectionTitle: {
    fontSize: responsiveFontSize.lg,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    paddingHorizontal: profileLayout.containerPadding,
  },
  settingsCard: {
    marginHorizontal: profileLayout.cardMargin,
    padding: 0,
    overflow: 'hidden',
    borderRadius: cardLayout.borderRadius,
    backgroundColor: Colors.background.primary,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.1,
    shadowRadius: cardLayout.shadowRadius,
    elevation: cardLayout.elevation,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: iPhone7Plus ? spacing.md + scale(2) : spacing.sm + scale(2),
    paddingHorizontal: profileLayout.menuItemPadding,
    minHeight: scale(48),
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: moderateScale(18),
    marginRight: spacing.sm,
    width: scale(24),
    textAlign: 'center',
  },
  settingText: {
    fontSize: responsiveFontSize.base,
    color: Colors.text.primary,
    flex: 1,
  },
  menuCard: {
    marginHorizontal: profileLayout.cardMargin,
    padding: 0,
    overflow: 'hidden',
    borderRadius: cardLayout.borderRadius,
    backgroundColor: Colors.background.primary,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.1,
    shadowRadius: cardLayout.shadowRadius,
    elevation: cardLayout.elevation,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: iPhone7Plus ? spacing.md + scale(2) : spacing.sm + scale(2),
    paddingHorizontal: profileLayout.menuItemPadding,
    minHeight: scale(48),
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: moderateScale(18),
    marginRight: spacing.sm,
    width: scale(24),
    textAlign: 'center',
  },
  menuText: {
    fontSize: responsiveFontSize.base,
    color: Colors.text.primary,
    flex: 1,
  },
  menuArrow: {
    fontSize: moderateScale(16),
    color: Colors.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginHorizontal: profileLayout.menuItemPadding,
  },
  logoutButton: {
    marginHorizontal: profileLayout.cardMargin,
    backgroundColor: '#EF4444',
    marginBottom: spacing.lg,
    height: deviceSpecific.buttonHeight(),
    borderRadius: buttonLayout.borderRadius,
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xxl + safeAreaInsets.bottom,
  },
  version: {
    fontSize: responsiveFontSize.sm,
    color: Colors.text.tertiary,
  },
});