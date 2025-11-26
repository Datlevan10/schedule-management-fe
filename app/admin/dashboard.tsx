import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AdminCustomerReportingAPI, { CustomerStats } from '../api/admin-customer-reporting.api';
import { Card } from '../components/common';
import { Colors, Typography } from '../constants';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalDepartments: number;
}

interface AdminDashboardStats extends DashboardStats {
  customerStats?: CustomerStats;
  reportingTemplates: number;
  reportsGenerated: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 125,
    activeUsers: 98,
    totalTasks: 543,
    completedTasks: 421,
    pendingTasks: 122,
    totalDepartments: 8,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      // TODO: Fetch real dashboard data from API
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất khỏi tài khoản Admin?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: '👥',
      title: 'Quản lý người dùng',
      subtitle: `${stats.totalUsers} người dùng`,
      color: '#3B82F6',
      onPress: () => router.push('/admin/users'),
    },
    {
      icon: '📋',
      title: 'Quản lý công việc',
      subtitle: `${stats.totalTasks} công việc`,
      color: '#10B981',
      onPress: () => router.push('/admin/tasks'),
    },
    {
      icon: '🏢',
      title: 'Quản lý phòng ban',
      subtitle: `${stats.totalDepartments} phòng ban`,
      color: '#F59E0B',
      onPress: () => router.push('/admin/departments'),
    },
    {
      icon: '📊',
      title: 'Báo cáo & Thống kê',
      subtitle: 'Xem báo cáo chi tiết',
      color: '#8B5CF6',
      onPress: () => router.push('/admin/reports'),
    },
    {
      icon: '🔔',
      title: 'Thông báo hệ thống',
      subtitle: 'Gửi thông báo',
      color: '#EF4444',
      onPress: () => router.push('/admin/notifications'),
    },
    {
      icon: '⚙️',
      title: 'Cài đặt hệ thống',
      subtitle: 'Cấu hình hệ thống',
      color: '#6B7280',
      onPress: () => router.push('/admin/settings'),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadDashboardData} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Xin chào, Admin</Text>
          <Text style={styles.title}>Bảng điều khiển quản trị</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeUsers}</Text>
          <Text style={styles.statLabel}>Người dùng hoạt động</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pendingTasks}</Text>
          <Text style={styles.statLabel}>Công việc đang chờ</Text>
        </Card>
      </View>

      <View style={styles.quickStats}>
        <Card style={styles.quickStatCard}>
          <View style={styles.quickStatRow}>
            <Text style={styles.quickStatLabel}>Tỷ lệ hoàn thành</Text>
            <Text style={styles.quickStatValue}>
              {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(stats.completedTasks / stats.totalTasks) * 100}%`,
                },
              ]}
            />
          </View>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Chức năng quản lý</Text>

      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Card style={[styles.menuCard, { borderLeftColor: item.color } as any]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Admin Dashboard v1.0.0</Text>
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
  welcomeText: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.danger + '20',
    borderRadius: 8,
  },
  logoutText: {
    ...Typography.body2,
    color: Colors.danger,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    ...Typography.h1,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  quickStats: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickStatCard: {
    padding: 16,
  },
  quickStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickStatLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  quickStatValue: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  menuGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuItem: {
    width: '47%',
  },
  menuCard: {
    padding: 20,
    borderLeftWidth: 4,
  },
  menuIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  menuTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuSubtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    ...Typography.body2,
    color: Colors.text.tertiary,
  },
});