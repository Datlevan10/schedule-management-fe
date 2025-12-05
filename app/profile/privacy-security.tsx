import { router } from 'expo-router';
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
      title: 'Thay đổi mật khẩu',
      description: 'Cập nhật mật khẩu tài khoản của bạn',
      onPress: () => router.push('/profile/change-password'),
    },
    {
      icon: '🔑',
      title: 'Xác thực hai yếu tố',
      description: 'Thêm một lớp bảo mật',
      onPress: () => { },
    },
    {
      icon: '📱',
      title: 'Quản lý thiết bị',
      description: 'Xem và quản lý các thiết bị đã đăng nhập',
      onPress: () => { },
    },
    {
      icon: '📧',
      title: 'Xác minh Email',
      description: 'Xác minh địa chỉ email của bạn',
      onPress: () => { },
    },
    {
      icon: '🚫',
      title: 'Cài đặt quyền riêng tư',
      description: 'Kiểm soát những ai có thể xem thông tin của bạn',
      onPress: () => { },
    },
    {
      icon: '📊',
      title: 'Xuất dữ liệu',
      description: 'Tải xuống dữ liệu cá nhân của bạn',
      onPress: () => { },
    },
    {
      icon: '🗑️',
      title: 'Xóa tài khoản',
      description: 'Xóa vĩnh viễn tài khoản của bạn',
      onPress: () => { },
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quyền riêng tư và Bảo mật</Text>
        <Text style={styles.subtitle}>
          Quản lý cài đặt bảo mật và quyền riêng tư của tài khoản
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