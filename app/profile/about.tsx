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

export default function AboutScreen() {
  const appInfo = {
    name: 'Schedule Management',
    version: '1.0.0',
    build: '2025.1',
    developer: 'Your Company',
    website: 'https://example.com',
    support: 'support@example.com',
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>About</Text>
      </View>

      <Card style={styles.card}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>📅</Text>
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.version}>Version {appInfo.version}</Text>
          <Text style={styles.build}>Build {appInfo.build}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Developer</Text>
        <Text style={styles.infoText}>{appInfo.developer}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Contact</Text>
        
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => handleOpenLink(appInfo.website)}
        >
          <Text style={styles.linkLabel}>Website:</Text>
          <Text style={styles.linkText}>{appInfo.website}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => handleOpenLink(`mailto:${appInfo.support}`)}
        >
          <Text style={styles.linkLabel}>Support:</Text>
          <Text style={styles.linkText}>{appInfo.support}</Text>
        </TouchableOpacity>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Legal</Text>
        
        <TouchableOpacity style={styles.legalLink}>
          <Text style={styles.legalText}>Terms of Service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.legalLink}>
          <Text style={styles.legalText}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.legalLink}>
          <Text style={styles.legalText}>Open Source Licenses</Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.copyright}>
          © 2025 {appInfo.developer}. All rights reserved.
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
  },
  card: {
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  version: {
    ...Typography.body1,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  build: {
    ...Typography.body2,
    color: Colors.text.tertiary,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  infoText: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  linkRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  linkLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  linkText: {
    ...Typography.body2,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  legalLink: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  legalText: {
    ...Typography.body1,
    color: Colors.primary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  copyright: {
    ...Typography.body2,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});