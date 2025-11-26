import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AdminCustomerReportingAPI, { CustomerStats } from '../api/admin-customer-reporting.api';
import { Card } from '../components/common';
import { Colors, Typography } from '../constants';

export default function CustomerStatsScreen() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCustomerStats();
  }, []);

  const loadCustomerStats = async () => {
    try {
      setLoading(true);
      const response = await AdminCustomerReportingAPI.getCustomerStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load customer statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getProfessionColor = (index: number) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Failed to load customer statistics</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={() => {
            setRefreshing(true);
            loadCustomerStats();
          }} 
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Customer Statistics</Text>
        <Text style={styles.subtitle}>Comprehensive customer analytics and insights</Text>
      </View>

      {/* Overview Stats */}
      <View style={styles.overviewContainer}>
        <Card style={styles.overviewCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total_customers}</Text>
              <Text style={styles.statLabel}>Total Customers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.active_customers}</Text>
              <Text style={styles.statLabel}>Active Customers</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.recent_registrations}</Text>
              <Text style={styles.statLabel}>Recent Registrations</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.success }]}>
                +{stats.monthly_growth.toFixed(1)}%
              </Text>
              <Text style={styles.statLabel}>Monthly Growth</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Activity Rate */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Customer Activity Rate</Text>
        <View style={styles.activityContainer}>
          <View style={styles.activityBar}>
            <View 
              style={[
                styles.activityFill, 
                { width: `${(stats.active_customers / stats.total_customers) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.activityText}>
            {((stats.active_customers / stats.total_customers) * 100).toFixed(1)}% of customers are active
          </Text>
        </View>
      </Card>

      {/* Customers by Profession */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Customers by Profession</Text>
        <View style={styles.professionContainer}>
          {Object.entries(stats.customers_by_profession).map(([profession, count], index) => (
            <View key={profession} style={styles.professionItem}>
              <View style={styles.professionInfo}>
                <View 
                  style={[
                    styles.professionColor, 
                    { backgroundColor: getProfessionColor(index) }
                  ]} 
                />
                <Text style={styles.professionName}>
                  {profession.charAt(0).toUpperCase() + profession.slice(1)}
                </Text>
              </View>
              <View style={styles.professionStats}>
                <Text style={styles.professionCount}>{count}</Text>
                <Text style={styles.professionPercentage}>
                  {((count / stats.total_customers) * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Growth Metrics */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Growth Metrics</Text>
        <View style={styles.growthContainer}>
          <View style={styles.growthItem}>
            <Text style={styles.growthLabel}>Monthly Growth Rate</Text>
            <Text style={[styles.growthValue, { color: Colors.success }]}>
              +{stats.monthly_growth.toFixed(2)}%
            </Text>
          </View>
          <View style={styles.growthItem}>
            <Text style={styles.growthLabel}>New Registrations</Text>
            <Text style={styles.growthValue}>{stats.recent_registrations}</Text>
          </View>
          <View style={styles.growthItem}>
            <Text style={styles.growthLabel}>Retention Rate</Text>
            <Text style={[styles.growthValue, { color: Colors.primary }]}>
              {((stats.active_customers / stats.total_customers) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </Card>

      {/* Summary */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Summary Insights</Text>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            • You have {stats.total_customers} total customers with {stats.active_customers} currently active
          </Text>
          <Text style={styles.summaryText}>
            • {stats.recent_registrations} new registrations in the recent period
          </Text>
          <Text style={styles.summaryText}>
            • Customer base is growing at {stats.monthly_growth.toFixed(1)}% monthly rate
          </Text>
          <Text style={styles.summaryText}>
            • Most popular profession: {
              Object.entries(stats.customers_by_profession)
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
            }
          </Text>
        </View>
      </Card>

      <View style={styles.footer} />
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
  loadingText: {
    ...Typography.body1,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  errorText: {
    ...Typography.body1,
    color: Colors.danger,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  overviewContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  overviewCard: {
    padding: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...Typography.h1,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  sectionCard: {
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  activityContainer: {
    alignItems: 'center',
  },
  activityBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border.light,
    borderRadius: 4,
    marginBottom: 12,
  },
  activityFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  activityText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  professionContainer: {
    gap: 12,
  },
  professionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  professionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  professionColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  professionName: {
    ...Typography.body1,
    color: Colors.text.primary,
  },
  professionStats: {
    alignItems: 'flex-end',
  },
  professionCount: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  professionPercentage: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  growthContainer: {
    gap: 16,
  },
  growthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  growthLabel: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  growthValue: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  summaryContainer: {
    gap: 12,
  },
  summaryText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    height: 40,
  },
});