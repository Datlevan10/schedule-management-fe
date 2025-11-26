import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from '../components/common';
import { Colors, Typography } from '../constants';

export default function HelpSupportScreen() {
  const helpOptions = [
    {
      icon: '📖',
      title: 'User Guide',
      description: 'Learn how to use the app effectively',
      onPress: () => {},
    },
    {
      icon: '❓',
      title: 'FAQ',
      description: 'Frequently asked questions',
      onPress: () => {},
    },
    {
      icon: '🎥',
      title: 'Video Tutorials',
      description: 'Watch step-by-step tutorials',
      onPress: () => {},
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: 'Chat with our support team',
      onPress: () => {},
    },
    {
      icon: '📧',
      title: 'Email Support',
      description: 'Send us an email',
      onPress: () => Linking.openURL('mailto:support@example.com'),
    },
    {
      icon: '📞',
      title: 'Phone Support',
      description: 'Call our support hotline',
      onPress: () => Linking.openURL('tel:+1234567890'),
    },
  ];

  const contactInfo = {
    email: 'support@example.com',
    phone: '+1 (234) 567-8900',
    website: 'https://support.example.com',
    hours: 'Monday - Friday, 9:00 AM - 6:00 PM',
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>Get help and support for the app</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>How can we help?</Text>
        {helpOptions.map((option, index) => (
          <TouchableOpacity key={index} style={styles.helpOption} onPress={option.onPress}>
            <Text style={styles.helpIcon}>{option.icon}</Text>
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>{option.title}</Text>
              <Text style={styles.helpDescription}>{option.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Email:</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${contactInfo.email}`)}>
            <Text style={styles.contactValue}>{contactInfo.email}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Phone:</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${contactInfo.phone}`)}>
            <Text style={styles.contactValue}>{contactInfo.phone}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Website:</Text>
          <TouchableOpacity onPress={() => Linking.openURL(contactInfo.website)}>
            <Text style={styles.contactValue}>{contactInfo.website}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Hours:</Text>
          <Text style={styles.contactHours}>{contactInfo.hours}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Quick Tips</Text>
        <View style={styles.tip}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            Use the search feature to quickly find specific tasks or schedules
          </Text>
        </View>
        <View style={styles.tip}>
          <Text style={styles.tipIcon}>⏰</Text>
          <Text style={styles.tipText}>
            Set up notifications to never miss important deadlines
          </Text>
        </View>
        <View style={styles.tip}>
          <Text style={styles.tipIcon}>📊</Text>
          <Text style={styles.tipText}>
            Check your activity reports to track your productivity
          </Text>
        </View>
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
  helpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  helpIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  helpText: {
    flex: 1,
  },
  helpTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  chevron: {
    fontSize: 20,
    color: Colors.text.tertiary,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  contactLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    width: 80,
  },
  contactValue: {
    ...Typography.body2,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  contactHours: {
    ...Typography.body2,
    color: Colors.text.primary,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    flex: 1,
  },
});