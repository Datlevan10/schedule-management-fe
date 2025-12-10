import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { UserAPI, UserProfile } from '../api/user.api';
import { Button, Card } from '../components/common';
import { Colors, Typography } from '../constants';

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const { userId } = useLocalSearchParams<{ userId: string }>();

  useEffect(() => {
    if (userId) {
      loadProfile(parseInt(userId));
    } else {
      setInitialLoading(false);
    }
  }, [userId]);

  const loadProfile = async (userIdParam: number) => {
    try {
      setInitialLoading(true);
      console.log('🔍 Loading user profile for edit with user ID:', userIdParam);
      const response = await UserAPI.getUserProfile(userIdParam);
      if (response.success) {
        setProfile(response.data);
        console.log('✅ Profile loaded for editing:', response.data);
      }
    } catch (error) {
      console.error('❌ Error loading profile for edit:', error);
      Alert.alert('Lỗi', 'Không thể tải hồ sơ');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.id) {
      Alert.alert('Lỗi', 'Không tìm thấy ID người dùng');
      return;
    }

    setLoading(true);
    try {
      console.log('💾 Updating profile for user ID:', profile.id);

      // First, let's test what endpoints are available
      console.log('🔍 Testing available endpoints...');
      await UserAPI.testUserEndpoints(profile.id);

      const updateData = {
        name: profile.name,
        workplace: profile.workplace,
        department: profile.department,
        work_schedule: profile.work_schedule,
        work_habits: profile.work_habits,
      };

      console.log('📤 Sending update data:', updateData);

      let response;
      try {
        // Try the main method first
        response = await UserAPI.updateUserProfile(profile.id, updateData);
      } catch (mainError: any) {
        console.log('❌ Main method failed, trying simple method...');
        console.log('❌ Main error details:', {
          status: mainError.response?.status,
          statusText: mainError.response?.statusText,
          data: mainError.response?.data
        });

        // Fallback to simple method
        try {
          response = await UserAPI.updateUserProfileSimple(profile.id, updateData);
        } catch (simpleError: any) {
          console.log('❌ Simple method also failed:', {
            status: simpleError.response?.status,
            statusText: simpleError.response?.statusText,
            data: simpleError.response?.data
          });

          // Show detailed error to user
          const errorMessage = simpleError.response?.data?.message ||
            simpleError.response?.data?.error ||
            simpleError.message ||
            'Failed to update profile';

          const errorDetails = `Status: ${simpleError.response?.status}\nURL: ${simpleError.config?.url}\nMethod: ${simpleError.config?.method}`;

          Alert.alert(
            'Cập nhật thất bại',
            `${errorMessage}\n\nThông tin kỹ thuật:\n${errorDetails}`,
            [
              { text: 'OK', style: 'cancel' },
              { text: 'Thử lại', onPress: () => handleSave() }
            ]
          );
          return;
        }
      }

      if (response && (response.success !== false)) {
        Alert.alert('Thành công', 'Hồ sơ đã được cập nhật thành công', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/profile') }
        ]);
      } else {
        Alert.alert('Lỗi', response?.message || 'Cập nhật thất bại');
      }
    } catch (error: any) {
      console.error('❌ Unexpected error updating profile:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi không mong đợi');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên</Text>
            <TextInput
              style={styles.input}
              value={profile.name || ''}
              onChangeText={(text) => setProfile({ ...profile, name: text })}
              placeholder="Nhập tên của bạn"
              placeholderTextColor={Colors.text.secondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={profile.email || ''}
              placeholder="Email"
              placeholderTextColor={Colors.text.secondary}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nghề nghiệp</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={profile.profession?.display_name || ''}
              placeholder="Nghề nghiệp"
              placeholderTextColor={Colors.text.secondary}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nơi làm việc</Text>
            <TextInput
              style={styles.input}
              value={profile.workplace || ''}
              onChangeText={(text) => setProfile({ ...profile, workplace: text })}
              placeholder="Nhập nơi làm việc"
              placeholderTextColor={Colors.text.secondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Khoa/Phòng</Text>
            <TextInput
              style={styles.input}
              value={profile.department || ''}
              onChangeText={(text) => setProfile({ ...profile, department: text })}
              placeholder="Nhập khoa/phòng"
              placeholderTextColor={Colors.text.secondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lịch làm việc</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={profile.work_schedule?.join(', ') || ''}
              onChangeText={(text) => setProfile({
                ...profile,
                work_schedule: text.split(',').map(item => item.trim()).filter(item => item.length > 0)
              })}
              placeholder="Ví dụ: Thứ 2-6, 8:00-17:00"
              placeholderTextColor={Colors.text.secondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Thói quen làm việc</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={profile.work_habits?.join(', ') || ''}
              onChangeText={(text) => setProfile({
                ...profile,
                work_habits: text.split(',').map(item => item.trim()).filter(item => item.length > 0)
              })}
              placeholder="Ví dụ: Họp sáng, Nghỉ trưa 12:00"
              placeholderTextColor={Colors.text.secondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </Card>

        <View style={styles.buttons}>
          <Button
            title="Hủy bỏ"
            onPress={() => router.replace('/(tabs)/profile')}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title="Lưu thay đổi"
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: Colors.background.secondary,
    opacity: 0.6,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.text.secondary,
    marginTop: 16,
  },
});