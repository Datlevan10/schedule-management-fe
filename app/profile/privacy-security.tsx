import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from '../components/common';
import { Colors, Typography } from '../constants';

export default function PrivacySecurityScreen() {
  const securityOptions = [
    {
      icon: '🔐',
      title: 'Change Password',
      description: 'Update your account password',
      onPress: () => router.push('/profile/change-password'),
    },
    {
      icon: '🔑',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security',
      onPress: () => {},
    },
    {
      icon: '📱',
      title: 'Manage Devices',
      description: 'View and manage logged-in devices',
      onPress: () => {},
    },
    {
      icon: '📧',
      title: 'Email Verification',
      description: 'Verify your email address',
      onPress: () => {},
    },
    {
      icon: '🚫',
      title: 'Privacy Settings',
      description: 'Control who can see your information',
      onPress: () => {},
    },
    {
      icon: '📊',
      title: 'Data Export',
      description: 'Download your personal data',
      onPress: () => {},
    },
    {
      icon: '🗑️',
      title: 'Delete Account',
      description: 'Permanently delete your account',
      onPress: () => {},
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Privacy & Security</Text>
        <Text style={styles.subtitle}>
          Manage your account security and privacy settings
        </Text>
      </View>

      {securityOptions.map((option, index) => (
        <TouchableOpacity key={index} onPress={option.onPress}>
          <Card style={styles.optionCard}>
            <View style={styles.optionContent}>
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
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
  optionCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  chevron: {
    fontSize: 20,
    color: Colors.text.tertiary,
  },
});