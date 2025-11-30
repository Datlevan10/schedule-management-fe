import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminAPI, SystemSettings } from '../api/admin.api';
import { Colors, Typography } from '../constants';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getSystemSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load system settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setLoading(true);
      const response = await AdminAPI.updateSystemSettings(settings);
      if (response.success) {
        Alert.alert('Success', 'Settings saved successfully');
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border.medium, true: Colors.primary + '40' }}
        thumbColor={value ? Colors.primary : Colors.white}
      />
    </View>
  );

  if (!settings) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Settings</Text>
        {hasChanges && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
            <Ionicons name="save" size={20} color={Colors.white} />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Registration</Text>
          <View style={styles.sectionCard}>
            {renderSettingItem(
              'Allow User Registration',
              'Enable new users to register for accounts',
              settings.allow_user_registration,
              (value) => updateSetting('allow_user_registration', value)
            )}
            {renderSettingItem(
              'Require Email Verification',
              'Users must verify their email before accessing the app',
              settings.require_email_verification,
              (value) => updateSetting('require_email_verification', value)
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionCard}>
            {renderSettingItem(
              'Email Notifications',
              'Send system notifications via email',
              settings.enable_email_notifications,
              (value) => updateSetting('enable_email_notifications', value)
            )}
            {renderSettingItem(
              'Push Notifications',
              'Send push notifications to mobile devices',
              settings.enable_push_notifications,
              (value) => updateSetting('enable_push_notifications', value)
            )}
            {renderSettingItem(
              'SMS Notifications',
              'Send notifications via SMS',
              settings.enable_sms_notifications,
              (value) => updateSetting('enable_sms_notifications', value)
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.sectionCard}>
            {renderSettingItem(
              'Two-Factor Authentication',
              'Require 2FA for all admin accounts',
              settings.require_2fa,
              (value) => updateSetting('require_2fa', value)
            )}
            {renderSettingItem(
              'Session Timeout',
              'Automatically log out inactive users',
              settings.enable_session_timeout,
              (value) => updateSetting('enable_session_timeout', value)
            )}
            
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>Session Timeout (minutes)</Text>
              <TextInput
                style={styles.textInput}
                value={settings.session_timeout_minutes.toString()}
                onChangeText={(text) => updateSetting('session_timeout_minutes', parseInt(text) || 30)}
                keyboardType="numeric"
                placeholder="30"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <View style={styles.sectionCard}>
            {renderSettingItem(
              'Data Backup',
              'Automatically backup system data',
              settings.enable_data_backup,
              (value) => updateSetting('enable_data_backup', value)
            )}
            {renderSettingItem(
              'Analytics Collection',
              'Collect usage analytics for system improvement',
              settings.enable_analytics,
              (value) => updateSetting('enable_analytics', value)
            )}
            
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>Max File Upload Size (MB)</Text>
              <TextInput
                style={styles.textInput}
                value={settings.max_file_upload_size.toString()}
                onChangeText={(text) => updateSetting('max_file_upload_size', parseInt(text) || 10)}
                keyboardType="numeric"
                placeholder="10"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maintenance</Text>
          <View style={styles.sectionCard}>
            {renderSettingItem(
              'Maintenance Mode',
              'Enable maintenance mode to prevent user access',
              settings.maintenance_mode,
              (value) => updateSetting('maintenance_mode', value)
            )}
            
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>Maintenance Message</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={settings.maintenance_message}
                onChangeText={(text) => updateSetting('maintenance_message', text)}
                placeholder="System is under maintenance. Please try again later."
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.sectionCard}>
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>Support Email</Text>
              <TextInput
                style={styles.textInput}
                value={settings.support_email}
                onChangeText={(text) => updateSetting('support_email', text)}
                placeholder="support@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>Support Phone</Text>
              <TextInput
                style={styles.textInput}
                value={settings.support_phone}
                onChangeText={(text) => updateSetting('support_phone', text)}
                placeholder="+1 (555) 123-4567"
                keyboardType="phone-pad"
              />
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
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  saveButtonText: {
    ...Typography.body2,
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
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: 12,
    marginTop: 16,
  },
  sectionCard: {
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  inputItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  inputLabel: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.background.secondary,
    ...Typography.body1,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});