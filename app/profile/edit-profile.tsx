import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { UserAPI, UserProfile } from '../api/user.api';
import { Button, Card, Input } from '../components/common';
import { Colors, Typography } from '../constants';

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await UserAPI.getUserProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const handleSave = async () => {
    if (!profile.id) return;
    
    setLoading(true);
    try {
      await UserAPI.updateUserProfile(profile.id, {
        name: profile.name,
        workplace: profile.workplace,
        department: profile.department,
      });
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Profile</Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="Name"
            value={profile.name || ''}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
            placeholder="Enter your name"
          />

          <Input
            label="Email"
            value={profile.email || ''}
            placeholder="Email"
          />

          <Input
            label="Workplace"
            value={profile.workplace || ''}
            onChangeText={(text) => setProfile({ ...profile, workplace: text })}
            placeholder="Enter your workplace"
          />

          <Input
            label="Department"
            value={profile.department || ''}
            onChangeText={(text) => setProfile({ ...profile, department: text })}
            placeholder="Enter your department"
          />
        </Card>

        <View style={styles.buttons}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title="Save"
            onPress={handleSave}
            loading={loading}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  buttons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});