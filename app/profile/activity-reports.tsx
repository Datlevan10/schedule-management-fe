import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from '../components/common';
import { Colors, Typography } from '../constants';

export default function ActivityReportsScreen() {
  const stats = {
    totalTasks: 234,
    completedTasks: 189,
    pendingTasks: 45,
    averageCompletionTime: '2.5 hours',
    productivityScore: 85,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Reports</Text>
        <Text style={styles.subtitle}>Your performance and activity statistics</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalTasks}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.completedTasks}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.pendingTasks}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.productivityScore}%</Text>
            <Text style={styles.statLabel}>Productivity</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Average Completion Time</Text>
        <Text style={styles.bigStat}>{stats.averageCompletionTime}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Completion Rate</Text>
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
        <Text style={styles.progressText}>
          {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completed
        </Text>
      </Card>
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
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  card: {
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  bigStat: {
    ...Typography.h1,
    color: Colors.primary,
    textAlign: 'center',
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.border.light,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
  },
  progressText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});