import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from '../components/common';
import { Colors, Typography } from '../constants';

export default function AdminReportsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports & Analytics</Text>
      </View>
      <Card style={styles.card}>
        <Text style={styles.text}>Reports and analytics features coming soon...</Text>
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
  },
  card: {
    marginHorizontal: 20,
    padding: 20,
  },
  text: {
    ...Typography.body1,
    color: Colors.text.primary,
  },
});