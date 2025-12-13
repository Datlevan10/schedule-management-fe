import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DashboardAPI, type DashboardStats } from '../../api/dashboard.api';
import { ScheduleTemplateAPI, type ScheduleImportTemplate } from '../../api/schedule-template.api';
import { Card } from '../../components/common';
import { Colors } from '../../constants';
import { useAuth } from '../../hooks';
import {
  getSafeAreaInsets,
  isSmallDevice,
  moderateScale,
  responsiveFontSize,
  scale,
  spacing,
  verticalScale
} from '../../utils/responsive';

const professionIcons: Record<string, string> = {
  'doctor': '👨‍⚕️',
  'student': '📚',
  'teacher': '👨‍🏫',
  'engineer': '⚙️',
  'manager': '💼',
  'sales': '💰',
  'default': '📋',
};

const professionColors: Record<string, string> = {
  'doctor': '#EF4444',
  'student': '#6366F1',
  'teacher': '#10B981',
  'engineer': '#F59E0B',
  'manager': '#8B5CF6',
  'sales': '#EC4899',
  'default': '#6B7280',
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ScheduleImportTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfession, setSelectedProfession] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    active_tasks: 0,
    reminders: 0,
    productivity_percentage: '0%',
    productivity_score: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
    if (user?.id) {
      fetchDashboardStats();
    }
  }, [user?.id]);

  const fetchDashboardStats = async () => {
    if (!user?.id) return;

    try {
      setStatsLoading(true);
      const response = await DashboardAPI.getLatestPriorities(user.id);

      if (response.status === 'success' && response.data?.dashboard_stats) {
        setDashboardStats(response.data.dashboard_stats);
        console.log('📊 Dashboard stats loaded:', response.data.dashboard_stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep default values on error
    } finally {
      setStatsLoading(false);
    }
  };

  const getProductivityColor = (score: number): string => {
    if (score >= 80) return '#10B981'; // Green - Excellent
    if (score >= 60) return '#F59E0B'; // Yellow - Good
    if (score >= 40) return '#FB923C'; // Orange - Fair
    return '#EF4444'; // Red - Needs improvement
  };

  const fetchTemplates = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setIsLoading(true);
      }
      setError(null);
      const response = await ScheduleTemplateAPI.getTemplates();
      setTemplates(response.data.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Unable to load templates. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchTemplates(true),
      user?.id ? fetchDashboardStats() : Promise.resolve()
    ]);
    setRefreshing(false);
  };

  const professions = ['All', ...new Set(templates.map(t => t.profession?.display_name || 'Other'))];

  const filteredTemplates = selectedProfession === 'All'
    ? templates
    : templates.filter(template => template.profession?.display_name === selectedProfession);

  const handleTemplateSelect = (template: ScheduleImportTemplate) => {
    Alert.alert(
      'Tùy chọn mẫu lịch',
      `Chọn hành động cho "${template.template_name}"`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xem chi tiết',
          onPress: () => {
            Alert.alert(
              template.template_name,
              `${template.template_description}\n\nCột bắt buộc: ${template.format_specifications.required_columns.join(', ')}\n\nCột tùy chọn: ${template.format_specifications.optional_columns.join(', ')}`,
              [{ text: 'OK' }]
            );
          }
        },
        {
          text: 'Tải xuống mẫu',
          onPress: () => handleDownloadTemplate(template.id)
        },
      ]
    );
  };

  const handleDownloadTemplate = async (templateId: number) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (template?.file_information?.download_urls?.template) {
        await Linking.openURL(template.file_information.download_urls.template);
        Alert.alert('Thành công', 'Tải xuống mẫu đã bắt đầu!');
      } else {
        Alert.alert('Lỗi', 'URL tải xuống không có sẵn');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      Alert.alert('Lỗi', 'Không thể tải xuống mẫu');
    }
  };

  const handleNotificationPress = () => {
    router.push('/screens/Reminder/NotifyScreen');
  };

  const renderTemplate = ({ item }: { item: ScheduleImportTemplate }) => {
    const professionName = item.profession?.name || 'default';
    const icon = professionIcons[professionName] || professionIcons.default;
    const color = professionColors[professionName] || professionColors.default;
    const requiredColumns = item.format_specifications.required_columns.length;
    const optionalColumns = item.format_specifications.optional_columns.length;

    return (
      <TouchableOpacity onPress={() => handleTemplateSelect(item)}>
        <Card style={{ ...styles.templateCard, borderLeftColor: color }}>
          <View style={styles.templateHeader}>
            <Text style={styles.templateIcon}>{icon}</Text>
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{item.template_name}</Text>
              <Text style={styles.templateCategory}>
                {item.profession?.display_name || 'General'}
              </Text>
            </View>
          </View>
          <Text style={styles.templateDescription}>{item.template_description}</Text>
          <View style={styles.templateFooter}>
            <Text style={styles.scheduleItems}>
              {requiredColumns} yêu cầu điền giá trị, {optionalColumns} các trường tùy chọn
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.downloadButton, { backgroundColor: color }]}
                onPress={() => handleDownloadTemplate(item.id)}
              >
                <Text style={styles.downloadButtonText}>📥 CSV</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Chào mừng trở lại,</Text>
          <Text style={styles.userName}>{user?.name || 'User'}! 👋</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleNotificationPress}
        >
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickStats}>
        <TouchableOpacity
          style={styles.statCardWrapper}
          onPress={() => router.push('/profile/ai-task-selection')}
          activeOpacity={0.7}
        >
          <Card style={styles.statCard}>
            {statsLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Text style={styles.statNumber}>{dashboardStats.active_tasks}</Text>
                {dashboardStats.active_tasks > 0 && (
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>Đang chạy</Text>
                  </View>
                )}
              </>
            )}
            <Text style={styles.statLabel}>Nhiệm vụ</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCardWrapper}
          onPress={() => router.push('/screens/Reminder/NotifyScreen')}
          activeOpacity={0.7}
        >
          <Card style={styles.statCard}>
            {statsLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Text style={styles.statNumber}>{dashboardStats.reminders}</Text>
                {dashboardStats.reminders > 0 && (
                  <View style={[styles.statBadge, { backgroundColor: '#F59E0B20' }]}>
                    <Text style={[styles.statBadgeText, { color: '#F59E0B' }]}>Cần chú ý</Text>
                  </View>
                )}
              </>
            )}
            <Text style={styles.statLabel}>Lời nhắc nhở</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCardWrapper}
          onPress={() => router.push('/profile/productivity')}
          activeOpacity={0.7}
        >
          <Card style={styles.statCard}>
            {statsLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Text style={[
                  styles.statNumber,
                  { color: getProductivityColor(dashboardStats.productivity_score) }
                ]}>
                  {dashboardStats.productivity_percentage}
                </Text>
                <View style={[
                  styles.statBadge,
                  { backgroundColor: getProductivityColor(dashboardStats.productivity_score) + '20' }
                ]}>
                  <Text style={[
                    styles.statBadgeText,
                    { color: getProductivityColor(dashboardStats.productivity_score) }
                  ]}>
                    AI Score
                  </Text>
                </View>
              </>
            )}
            <Text style={styles.statLabel}>Năng suất</Text>
          </Card>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mẫu lịch trình</Text>
        <Text style={styles.sectionSubtitle}>
          Chọn mẫu lịch phù hợp với nghề nghiệp của bạn
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Đang tải mẫu lịch...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchTemplates}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryList}
            >
              {professions.map((profession) => (
                <TouchableOpacity
                  key={profession}
                  style={[
                    styles.categoryChip,
                    selectedProfession === profession && styles.categoryChipActive
                  ]}
                  onPress={() => setSelectedProfession(profession)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedProfession === profession && styles.categoryChipTextActive
                    ]}
                  >
                    {profession}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filteredTemplates.length > 0 ? (
              <FlatList
                data={filteredTemplates}
                renderItem={renderTemplate}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.templateList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không có mẫu lịch nào</Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const safeAreaInsets = getSafeAreaInsets();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice() ? spacing.md : spacing.lg,
    paddingTop: safeAreaInsets.top + verticalScale(20),
    paddingBottom: verticalScale(20),
  },
  welcomeText: {
    fontSize: responsiveFontSize.base,
    color: Colors.text.secondary,
  },
  userName: {
    fontSize: responsiveFontSize['2xl'],
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: verticalScale(4),
  },
  notificationButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: moderateScale(20),
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: isSmallDevice() ? spacing.xs : spacing.lg,
    marginBottom: verticalScale(24),
    gap: scale(12),
  },
  statCardWrapper: {
    flex: 1,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: verticalScale(16),
  },
  statNumber: {
    fontSize: responsiveFontSize.xl,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: responsiveFontSize.sm,
    color: Colors.text.secondary,
    marginTop: verticalScale(4),
  },
  statBadge: {
    marginTop: verticalScale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(10),
    backgroundColor: Colors.primary + '20',
  },
  statBadgeText: {
    fontSize: responsiveFontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  section: {
    paddingHorizontal: isSmallDevice() ? spacing.md : spacing.lg,
    paddingBottom: verticalScale(20),
  },
  sectionTitle: {
    fontSize: responsiveFontSize.xl,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: verticalScale(4),
  },
  sectionSubtitle: {
    fontSize: responsiveFontSize.base,
    color: Colors.text.secondary,
    marginBottom: verticalScale(16),
  },
  categoryList: {
    marginBottom: verticalScale(16),
    marginHorizontal: isSmallDevice() ? -spacing.md : -spacing.lg,
    paddingHorizontal: isSmallDevice() ? spacing.md : spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    backgroundColor: Colors.background.secondary,
    marginRight: scale(8),
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: responsiveFontSize.base,
    color: Colors.text.secondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  templateList: {
    paddingBottom: verticalScale(20),
  },
  templateCard: {
    padding: scale(16),
    marginBottom: verticalScale(12),
    borderLeftWidth: scale(4),
  },
  templateHeader: {
    flexDirection: 'row',
    marginBottom: verticalScale(8),
  },
  templateIcon: {
    fontSize: moderateScale(28),
    marginRight: scale(12),
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: responsiveFontSize.lg,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  templateCategory: {
    fontSize: responsiveFontSize.sm,
    color: Colors.text.secondary,
    marginTop: verticalScale(2),
  },
  templateDescription: {
    fontSize: responsiveFontSize.base,
    color: Colors.text.secondary,
    marginBottom: verticalScale(12),
  },
  templateFooter: {
    flexDirection: 'column',
    alignItems: "flex-start",
    gap: 8
  },
  scheduleItems: {
    fontSize: responsiveFontSize.sm,
    color: Colors.text.tertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: scale(8),
  },
  downloadButton: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(16),
  },
  downloadButtonText: {
    fontSize: responsiveFontSize.sm,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
  },
  loadingText: {
    fontSize: responsiveFontSize.base,
    color: Colors.text.secondary,
    marginTop: verticalScale(12),
  },
  errorContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
  },
  errorText: {
    fontSize: responsiveFontSize.base,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  retryButton: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    backgroundColor: Colors.primary,
    borderRadius: scale(20),
  },
  retryButtonText: {
    fontSize: responsiveFontSize.base,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: responsiveFontSize.base,
    color: Colors.text.secondary,
  },
});