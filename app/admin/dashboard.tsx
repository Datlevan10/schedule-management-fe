import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors, Typography } from '../constants';

/**
 * Admin Dashboard Screen
 * 
 * Features:
 * - Real-time statistics display (users, tasks, AI analytics)
 * - Interactive charts (bar chart for user growth, donut chart for task analysis)
 * - AI insights section with intelligent recommendations
 * - Quick action shortcuts
 * - Pull-to-refresh functionality
 * - Loading states
 * 
 * API Integration Points (ready for backend):
 * - GET /api/admin/dashboard/stats - for main statistics
 * - GET /api/admin/dashboard/user-growth - for user growth chart data
 * - GET /api/admin/dashboard/task-analytics - for task breakdown
 * - GET /api/admin/dashboard/ai-insights - for AI-generated insights
 */

// Mock data interfaces
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  aiAnalyzedTasks: number;
  totalSchedules: number;
  activeSchedules: number;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 1247,
    activeUsers: 892,
    newUsersThisWeek: 43,
    totalTasks: 8934,
    completedTasks: 6789,
    pendingTasks: 2145,
    aiAnalyzedTasks: 7821,
    totalSchedules: 3456,
    activeSchedules: 2890,
  });

  const [userGrowthData] = useState<ChartData[]>([
    { label: 'Jan', value: 120, color: Colors.primary },
    { label: 'Feb', value: 190, color: Colors.primary },
    { label: 'Mar', value: 250, color: Colors.primary },
    { label: 'Apr', value: 320, color: Colors.primary },
    { label: 'May', value: 410, color: Colors.primary },
    { label: 'Jun', value: 520, color: Colors.primary },
  ]);

  const [taskAnalyticsData] = useState<ChartData[]>([
    { label: 'Completed', value: stats.completedTasks, color: Colors.success },
    { label: 'Pending', value: stats.pendingTasks, color: Colors.warning },
    { label: 'AI Analyzed', value: stats.aiAnalyzedTasks, color: Colors.info || '#3498db' },
  ]);

  // Mock data loading function
  const loadDashboardData = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In real implementation, you would call your API here
      // const response = await AdminAPI.getDashboardStats();
      // setStats(response.data);

      // For now, we'll randomly update some values to show dynamic data
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 5),
        newUsersThisWeek: Math.floor(Math.random() * 50) + 30,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
      }));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, []);

  // Calculate percentages
  const userActiveRate = Math.round((stats.activeUsers / stats.totalUsers) * 100);
  const taskCompletionRate = Math.round((stats.completedTasks / stats.totalTasks) * 100);
  const aiAnalysisRate = Math.round((stats.aiAnalyzedTasks / stats.totalTasks) * 100);
  const scheduleActiveRate = Math.round((stats.activeSchedules / stats.totalSchedules) * 100);

  // Load data on mount
  useEffect(() => {
    loadDashboardData().finally(() => setLoading(false));
  }, [loadDashboardData]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  const StatCard = ({ title, value, subtitle, icon, color, trend }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={16}
              color={trend.isPositive ? Colors.success : Colors.danger}
            />
            <Text style={[styles.trendText, {
              color: trend.isPositive ? Colors.success : Colors.danger
            }]}>
              {trend.value}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const SimpleBarChart = ({ data, title }: { data: ChartData[]; title: string }) => {
    const maxValue = Math.max(...data.map(item => item.value));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.barChart}>
          {data.map((item, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (item.value / maxValue) * 120,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{item.label}</Text>
              <Text style={styles.barValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const DonutChart = ({ data, title }: { data: ChartData[]; title: string }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.donutContainer}>
          <View style={styles.donutChart}>
            {/* Simple representation with colored blocks */}
            {data.map((item, index) => {
              const percentage = Math.round((item.value / total) * 100);
              return (
                <View key={index} style={styles.donutItem}>
                  <View style={[styles.donutIndicator, { backgroundColor: item.color }]} />
                  <Text style={styles.donutLabel}>{item.label}</Text>
                  <Text style={styles.donutValue}>{percentage}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Tổng quan hệ thống quản lý lịch trình</Text>
      </View>

      {/* Overview Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Tổng người dùng"
          value={stats.totalUsers.toLocaleString()}
          subtitle={`${userActiveRate}% đang hoạt động`}
          icon="people-outline"
          color={Colors.primary}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Người dùng mới"
          value={stats.newUsersThisWeek}
          subtitle="Tuần này"
          icon="person-add-outline"
          color={Colors.success}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Tổng số Task"
          value={stats.totalTasks.toLocaleString()}
          subtitle={`${taskCompletionRate}% hoàn thành`}
          icon="checkmark-circle-outline"
          color={Colors.warning}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="AI Phân tích"
          value={stats.aiAnalyzedTasks.toLocaleString()}
          subtitle={`${aiAnalysisRate}% của tổng Task`}
          icon="analytics-outline"
          color={Colors.info || '#3498db'}
          trend={{ value: 23, isPositive: true }}
        />
      </View>

      {/* Charts Section */}
      <View style={styles.chartsSection}>
        {/* User Growth Chart */}
        <SimpleBarChart
          data={userGrowthData}
          title="Tăng trưởng người dùng (6 tháng qua)"
        />

        {/* Task Analytics Donut */}
        <DonutChart
          data={taskAnalyticsData}
          title="Phân tích Task theo trạng thái"
        />
      </View>

      {/* AI Insights Section */}
      <View style={styles.aiSection}>
        <Text style={styles.sectionTitle}>🤖 AI Insights</Text>
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="bulb-outline" size={20} color={Colors.warning} />
            <Text style={styles.insightTitle}>Xu hướng sử dụng</Text>
          </View>
          <Text style={styles.insightText}>
            AI đã phân tích {aiAnalysisRate}% task và phát hiện người dùng thường tạo task vào buổi sáng (70%) và có xu hướng hoàn thành task trong 2-3 ngày.
          </Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="trending-up-outline" size={20} color={Colors.success} />
            <Text style={styles.insightTitle}>Dự đoán tăng trưởng</Text>
          </View>
          <Text style={styles.insightText}>
            Dự kiến người dùng mới sẽ tăng 25% trong tháng tới dựa trên xu hướng hiện tại và độ tương tác của người dùng.
          </Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="time-outline" size={20} color={Colors.info || '#3498db'} />
            <Text style={styles.insightTitle}>Hiệu suất hệ thống</Text>
          </View>
          <Text style={styles.insightText}>
            Thời gian phản hồi trung bình: 0.8s. AI xử lý task tự động với độ chính xác 94.2%.
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>⚡ Thao tác nhanh</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={[styles.actionCard, { borderColor: Colors.primary }]}>
            <Ionicons name="people-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Quản lý Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { borderColor: Colors.success }]}>
            <Ionicons name="analytics-outline" size={24} color={Colors.success} />
            <Text style={styles.actionText}>Xem báo cáo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { borderColor: Colors.warning }]}>
            <Ionicons name="settings-outline" size={24} color={Colors.warning} />
            <Text style={styles.actionText}>Cài đặt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { borderColor: Colors.info || '#3498db' }]}>
            <Ionicons name="notifications-outline" size={24} color={Colors.info || '#3498db'} />
            <Text style={styles.actionText}>Thông báo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    margin: 4,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    ...Typography.caption,
    fontWeight: '600',
    marginLeft: 2,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.text.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  statSubtitle: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },

  // Charts
  chartsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  chartContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },

  // Bar Chart
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  barValue: {
    ...Typography.caption,
    color: Colors.text.primary,
    fontWeight: '600',
    marginTop: 2,
  },

  // Donut Chart
  donutContainer: {
    alignItems: 'center',
  },
  donutChart: {
    width: '100%',
  },
  donutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  donutIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  donutLabel: {
    ...Typography.body2,
    color: Colors.text.primary,
    flex: 1,
  },
  donutValue: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
  },

  // AI Section
  aiSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  insightText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    lineHeight: 20,
  },

  // Actions Section
  actionsSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 48) / 2,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    margin: 4,
    alignItems: 'center',
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});