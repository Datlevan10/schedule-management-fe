import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Card } from '../components/common';
import { Colors, Typography } from '../constants';

export default function BackupSyncScreen() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);

  const handleBackupNow = () => {
    Alert.alert('Backup', 'Starting backup...', [
      { text: 'OK' }
    ]);
  };

  const handleRestoreBackup = () => {
    Alert.alert(
      'Restore Backup',
      'Are you sure you want to restore from backup? This will replace your current data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', style: 'destructive' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Backup & Sync</Text>
        <Text style={styles.subtitle}>Manage your data backup and synchronization</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Backup Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto Backup</Text>
            <Text style={styles.settingDescription}>
              Automatically backup your data daily
            </Text>
          </View>
          <Switch
            value={autoBackup}
            onValueChange={setAutoBackup}
            trackColor={{ false: '#E5E7EB', true: Colors.primary }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Wi-Fi Only</Text>
            <Text style={styles.settingDescription}>
              Only backup when connected to Wi-Fi
            </Text>
          </View>
          <Switch
            value={wifiOnly}
            onValueChange={setWifiOnly}
            trackColor={{ false: '#E5E7EB', true: Colors.primary }}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Sync Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Enable Sync</Text>
            <Text style={styles.settingDescription}>
              Keep your data synchronized across devices
            </Text>
          </View>
          <Switch
            value={syncEnabled}
            onValueChange={setSyncEnabled}
            trackColor={{ false: '#E5E7EB', true: Colors.primary }}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Backup Status</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Last Backup:</Text>
          <Text style={styles.statusValue}>2 hours ago</Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Backup Size:</Text>
          <Text style={styles.statusValue}>12.5 MB</Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Next Backup:</Text>
          <Text style={styles.statusValue}>Tomorrow at 3:00 AM</Text>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          title="Backup Now"
          onPress={handleBackupNow}
          style={styles.button}
        />
        <Button
          title="Restore from Backup"
          onPress={handleRestoreBackup}
          variant="secondary"
          style={styles.button}
        />
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    ...Typography.body1,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statusLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  statusValue: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  button: {
    marginBottom: 12,
  },
});