import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { AdminAPI, AdminUser } from '../api/admin.api';
import { Colors, Typography } from '../constants';

const { width } = Dimensions.get('window');

function CustomDrawerContent(props: any) {
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    try {
      const response = await AdminAPI.getProfile();
      if (response.success) {
        setAdminProfile(response.data);
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    }
  };

  const handleLogout = () => {
    // For web platform, handle logout directly without Alert
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Bạn có chắc muốn đăng xuất khỏi tài khoản Admin?');
      if (confirmLogout) {
        performLogout();
      }
    } else {
      // For mobile platforms, use Alert
      Alert.alert(
        'Đăng xuất',
        'Bạn có chắc muốn đăng xuất khỏi tài khoản Admin?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đăng xuất',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

  const performLogout = async () => {
    try {
      await AdminAPI.logout();
      await AsyncStorage.removeItem('userRole');
      
      // Handle navigation based on platform
      if (Platform.OS === 'web') {
        // For web, use window.location for more reliable navigation
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/welcome';
          } else {
            router.replace('/welcome');
          }
        }, 100);
      } else {
        // For mobile platforms, use router
        router.replace('/welcome');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Image
          source={{ uri: 'https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=fff' }}
          style={styles.avatar}
        />
        <Text style={styles.adminName}>{adminProfile?.name || 'Admin'}</Text>
        <Text style={styles.adminEmail}>{adminProfile?.email || ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {adminProfile?.role === 'super_admin' ? 'Super Admin' :
              adminProfile?.role === 'admin' ? 'Admin' : 'Moderator'}
          </Text>
        </View>
      </View>

      <DrawerItemList {...props} />

      <View style={styles.divider} />

      <DrawerItem
        label="Đăng xuất"
        onPress={handleLogout}
        icon={({ color, size }) => (
          <Ionicons name="log-out-outline" size={size} color={Colors.danger} />
        )}
        labelStyle={[styles.logoutLabel]}
      />
    </DrawerContentScrollView>
  );
}

export default function AdminLayout() {
  const isWeb = Platform.OS === 'web';
  const drawerWidth = isWeb && width > 768 ? 320 : 280;

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.text.secondary,
        drawerStyle: {
          backgroundColor: Colors.background.primary,
          width: drawerWidth,
          ...(isWeb && {
            borderRightWidth: 1,
            borderRightColor: Colors.border.light,
          }),
        },
        headerStyle: {
          backgroundColor: Colors.primary,
          ...(isWeb && {
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }),
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          ...Typography.h3,
          ...(isWeb && {
            fontSize: 18,
            fontWeight: '600',
          }),
        },
        ...(isWeb && {
          drawerPosition: 'left',
          drawerType: width > 768 ? 'permanent' : 'back',
        }),
      }}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          drawerLabel: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="speedometer-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="users"
        options={{
          title: 'Quản lý người dùng',
          drawerLabel: 'Quản lý người dùng',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="welcome-screens"
        options={{
          title: 'Màn hình chào mừng',
          drawerLabel: 'Màn hình chào mừng',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="image-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="feature-highlights"
        options={{
          title: 'Tính năng nổi bật',
          drawerLabel: 'Tính năng nổi bật',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="customer-reporting"
        options={{
          title: 'Báo cáo khách hàng',
          drawerLabel: 'Báo cáo khách hàng',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="schedule-templates"
        options={{
          title: 'Mẫu lịch trình',
          drawerLabel: 'Mẫu lịch trình',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="analytics"
        options={{
          title: 'Phân tích & Thống kê',
          drawerLabel: 'Phân tích & Thống kê',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="notifications"
        options={{
          title: 'Thông báo hệ thống',
          drawerLabel: 'Thông báo hệ thống',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          title: 'Cài đặt hệ thống',
          drawerLabel: 'Cài đặt hệ thống',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="admin-management"
        options={{
          title: 'Quản lý Admin',
          drawerLabel: 'Quản lý Admin',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  adminName: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  adminEmail: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  logoutLabel: {
    color: Colors.danger,
    ...Typography.body1,
  },
});