import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ScheduleTemplateAPI.getTemplates();
      setTemplates(response.data.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Unable to load templates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const professions = ['All', ...new Set(templates.map(t => t.profession?.display_name || 'Other'))];

  const filteredTemplates = selectedProfession === 'All'
    ? templates
    : templates.filter(template => template.profession?.display_name === selectedProfession);

  const handleTemplateSelect = (template: ScheduleImportTemplate) => {
    Alert.alert(
      'Template Options',
      `Choose an action for "${template.template_name}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'View Details',
          onPress: () => {
            Alert.alert(
              template.template_name,
              `${template.template_description}\n\nRequired columns: ${template.format_specifications.required_columns.join(', ')}\n\nOptional columns: ${template.format_specifications.optional_columns.join(', ')}`,
              [{ text: 'OK' }]
            );
          }
        },
        {
          text: 'Download Template',
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
        Alert.alert('Success', 'Template download started!');
      } else {
        Alert.alert('Error', 'Download URL not available');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      Alert.alert('Error', 'Failed to download template');
    }
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Chào mừng trở lại,</Text>
          <Text style={styles.userName}>{user?.name || 'User'}! 👋</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickStats}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Nhiệm vụ đang hoạt động</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Lời nhắc nhở</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>85%</Text>
          <Text style={styles.statLabel}>Năng suất</Text>
        </Card>
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
    paddingHorizontal: isSmallDevice() ? spacing.md : spacing.lg,
    marginBottom: verticalScale(24),
    gap: scale(12),
  },
  statCard: {
    flex: 1,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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