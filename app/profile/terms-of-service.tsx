import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from '../components/common';
import { Colors, Typography } from '../constants';

export default function TermsOfServiceScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last updated: January 1, 2025</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By downloading, installing, or using the Schedule Management application ("the App"), 
          you agree to be bound by these Terms of Service ("Terms"). If you do not agree to 
          these Terms, please do not use the App.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          The App provides schedule management and task organization services to help users 
          manage their daily activities, appointments, and work schedules. The service 
          includes features such as task creation, scheduling, notifications, and reporting.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>3. User Account</Text>
        <Text style={styles.paragraph}>
          To use certain features of the App, you must create an account. You are responsible 
          for maintaining the security of your account and password. You agree to provide 
          accurate and complete information when creating your account.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>4. Privacy Policy</Text>
        <Text style={styles.paragraph}>
          Your privacy is important to us. Please review our Privacy Policy, which also 
          governs your use of the App, to understand our practices regarding your personal 
          information.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>5. Acceptable Use</Text>
        <Text style={styles.paragraph}>
          You agree to use the App only for lawful purposes and in accordance with these Terms. 
          You must not use the App in any way that could damage, disable, or impair the service 
          or interfere with other users' use of the App.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>6. Data and Content</Text>
        <Text style={styles.paragraph}>
          You retain ownership of any content you create or upload to the App. However, 
          you grant us a license to use, store, and process your content to provide the 
          service to you.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          The App is provided "as is" without warranties of any kind. We shall not be liable 
          for any indirect, incidental, special, consequential, or punitive damages arising 
          from your use of the App.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>8. Termination</Text>
        <Text style={styles.paragraph}>
          You may terminate your account at any time by deleting the App. We may terminate 
          or suspend your account if you violate these Terms.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these Terms at any time. We will notify you of 
          any changes by posting the new Terms in the App. Your continued use of the App 
          after such changes constitutes acceptance of the new Terms.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>10. Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms of Service, please contact us at 
          support@example.com.
        </Text>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 Schedule Management App. All rights reserved.
        </Text>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  lastUpdated: {
    ...Typography.body2,
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
    marginBottom: 12,
  },
  paragraph: {
    ...Typography.body1,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    ...Typography.body2,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});