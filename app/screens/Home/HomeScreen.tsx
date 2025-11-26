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
import { Colors, Typography } from '../../constants';
import { useAuth } from '../../hooks';

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
              {requiredColumns} required, {optionalColumns} optional fields
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
          <Text style={styles.statLabel}>Active Tasks</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Reminders</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>85%</Text>
          <Text style={styles.statLabel}>Productivity</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schedule Templates</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeText: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  userName: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  categoryList: {
    marginBottom: 16,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  templateList: {
    paddingBottom: 20,
  },
  templateCard: {
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  templateHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  templateIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  templateCategory: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  templateDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleItems: {
    ...Typography.body2,
    color: Colors.text.tertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  downloadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  downloadButtonText: {
    ...Typography.body2,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorText: {
    ...Typography.body2,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  retryButtonText: {
    ...Typography.body2,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
});