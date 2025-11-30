import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminAPI, AnalyticsData } from '../api/admin.api';
import { Colors, Typography } from '../constants';

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAnalytics({ period: timeRange });
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  }, [loadAnalytics]);

  const renderTimeRangeButton = (range: typeof timeRange, label: string) => (
    <TouchableOpacity
      style={[
        styles.timeRangeButton,
        timeRange === range && styles.activeTimeRangeButton
      ]}
      onPress={() => setTimeRange(range)}
    >
      <Text style={[
        styles.timeRangeButtonText,
        timeRange === range && styles.activeTimeRangeButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderStatCard = (title: string, value: string | number, icon: string, color: string, subtitle?: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={styles.statHeader}>
          <Text style={styles.statTitle}>{title}</Text>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  if (!analytics) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Analytics & Reports</Text>
          <Text style={styles.subtitle}>System performance overview</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.timeRangeContainer}>
        {renderTimeRangeButton('7d', '7 Days')}
        {renderTimeRangeButton('30d', '30 Days')}
        {renderTimeRangeButton('90d', '90 Days')}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          {renderStatCard(
            'Total Users',
            analytics.total_users.toLocaleString(),
            'people',
            Colors.primary,
            `+${analytics.new_users_this_period} this period`
          )}
          
          {renderStatCard(
            'Active Users',
            analytics.active_users.toLocaleString(),
            'person',
            Colors.success,
            `${Math.round((analytics.active_users / analytics.total_users) * 100)}% of total`
          )}

          {renderStatCard(
            'Total Schedules',
            analytics.total_schedules.toLocaleString(),
            'calendar',
            Colors.info,
            `+${analytics.new_schedules_this_period} this period`
          )}

          {renderStatCard(
            'Completed Tasks',
            analytics.completed_tasks.toLocaleString(),
            'checkmark-circle',
            Colors.success,
            `${Math.round((analytics.completed_tasks / analytics.total_tasks) * 100)}% completion rate`
          )}

          {renderStatCard(
            'Pending Tasks',
            analytics.pending_tasks.toLocaleString(),
            'time',
            Colors.warning,
            `${Math.round((analytics.pending_tasks / analytics.total_tasks) * 100)}% of total`
          )}

          {renderStatCard(
            'Customer Reports',
            analytics.customer_reports.toLocaleString(),
            'document-text',
            Colors.danger,
            `${analytics.unresolved_reports} unresolved`
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <Text style={styles.activityLabel}>Daily Active Users</Text>
              <Text style={styles.activityValue}>{analytics.daily_active_users.toLocaleString()}</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityLabel}>Weekly Active Users</Text>
              <Text style={styles.activityValue}>{analytics.weekly_active_users.toLocaleString()}</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityLabel}>Monthly Active Users</Text>
              <Text style={styles.activityValue}>{analytics.monthly_active_users.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Features</Text>
          <View style={styles.featureCard}>
            {analytics.popular_features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureName}>{feature.name}</Text>
                <View style={styles.featureStats}>
                  <Text style={styles.featureUsage}>{feature.usage_count} uses</Text>
                  <View style={[styles.featureBar, { width: `${feature.usage_percentage}%` }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthItem}>
              <View style={styles.healthHeader}>
                <Ionicons name="server" size={20} color={Colors.primary} />
                <Text style={styles.healthLabel}>Server Status</Text>
              </View>
              <View style={[styles.healthStatus, { backgroundColor: Colors.success + '20' }]}>
                <Text style={[styles.healthStatusText, { color: Colors.success }]}>Healthy</Text>
              </View>
            </View>

            <View style={styles.healthItem}>
              <View style={styles.healthHeader}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
                <Text style={styles.healthLabel}>Security</Text>
              </View>
              <View style={[styles.healthStatus, { backgroundColor: Colors.success + '20' }]}>
                <Text style={[styles.healthStatusText, { color: Colors.success }]}>Secure</Text>
              </View>
            </View>

            <View style={styles.healthItem}>
              <View style={styles.healthHeader}>
                <Ionicons name="speedometer" size={20} color={Colors.primary} />
                <Text style={styles.healthLabel}>Performance</Text>
              </View>
              <View style={[styles.healthStatus, { backgroundColor: Colors.warning + '20' }]}>
                <Text style={[styles.healthStatusText, { color: Colors.warning }]}>Good</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  refreshButton: {
    padding: 8,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  activeTimeRangeButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeRangeButtonText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  activeTimeRangeButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  statsGrid: {
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: Colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statContent: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  statValue: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statSubtitle: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  activityLabel: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  activityValue: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  featureCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  featureName: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureUsage: {
    ...Typography.body2,
    color: Colors.text.secondary,
    minWidth: 80,
  },
  featureBar: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    flex: 1,
  },
  healthCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthLabel: {
    ...Typography.body1,
    color: Colors.text.primary,
  },
  healthStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthStatusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
});