import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { UserAPI } from '../api/user.api';
import { Button, Card } from '../components/common';
import { Colors, Typography } from '../constants';

export default function NotificationSettingsScreen() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState({
    15: true,
    60: true,
    1440: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await UserAPI.getUserProfile();
      if (response.success && response.data.notification_preferences) {
        const prefs = response.data.notification_preferences;
        setEmailNotifications(prefs.email_notifications);
        setPushNotifications(prefs.push_notifications);
        
        const minutes = {
          15: prefs.reminder_advance_minutes.includes(15),
          60: prefs.reminder_advance_minutes.includes(60),
          1440: prefs.reminder_advance_minutes.includes(1440),
        };
        setReminderMinutes(minutes);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const advance_minutes = [];
      if (reminderMinutes[15]) advance_minutes.push(15);
      if (reminderMinutes[60]) advance_minutes.push(60);
      if (reminderMinutes[1440]) advance_minutes.push(1440);

      Alert.alert('Success', 'Notification settings updated');
      router.replace('/(tabs)/profile');
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification Settings</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Notification Types</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive updates via email
            </Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: '#E5E7EB', true: Colors.primary }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive push notifications
            </Text>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: '#E5E7EB', true: Colors.primary }}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Reminder Times</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>15 minutes before</Text>
          </View>
          <Switch
            value={reminderMinutes[15]}
            onValueChange={(value) =>
              setReminderMinutes({ ...reminderMinutes, 15: value })
            }
            trackColor={{ false: '#E5E7EB', true: Colors.primary }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>1 hour before</Text>
          </View>
          <Switch
            value={reminderMinutes[60]}
            onValueChange={(value) =>
              setReminderMinutes({ ...reminderMinutes, 60: value })
            }
            trackColor={{ false: '#E5E7EB', true: Colors.primary }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>1 day before</Text>
          </View>
          <Switch
            value={reminderMinutes[1440]}
            onValueChange={(value) =>
              setReminderMinutes({ ...reminderMinutes, 1440: value })
            }
            trackColor={{ false: '#E5E7EB', true: Colors.primary }}
          />
        </View>
      </Card>

      <View style={styles.buttons}>
        <Button
          title="Save Settings"
          onPress={handleSave}
          loading={loading}
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
  },
  card: {
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
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
    paddingVertical: 12,
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
    marginVertical: 8,
  },
  buttons: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  button: {
    marginTop: 20,
  },
});