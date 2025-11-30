import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminAPI, ScheduleTemplate } from '../api/admin.api';
import { Colors, Typography } from '../constants';
import FileDownloadManager from '../utils/fileDownload';

export default function ScheduleTemplatesScreen() {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getScheduleTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Error loading schedule templates:', error);
      Alert.alert('Error', 'Failed to load schedule templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTemplates();
    setRefreshing(false);
  }, [loadTemplates]);

  const handleDownloadTemplate = async (templateId: number) => {
    const success = await FileDownloadManager.downloadTemplate(templateId);
    if (success) {
      Alert.alert('Success', 'Template downloaded successfully');
    }
  };

  const handleDownloadSample = async (templateId: number) => {
    const success = await FileDownloadManager.downloadSample(templateId);
    if (success) {
      Alert.alert('Success', 'Sample file downloaded successfully');
    }
  };

  const handleDownloadInstructions = async (templateId: number) => {
    const success = await FileDownloadManager.downloadInstructions(templateId);
    if (success) {
      Alert.alert('Success', 'Instructions downloaded successfully');
    }
  };

  const handleToggleActive = async (template: ScheduleTemplate) => {
    try {
      const response = await AdminAPI.updateScheduleTemplate(template.id, {
        is_active: !template.is_active,
      });

      if (response.success) {
        loadTemplates();
        Alert.alert('Success', `Template ${template.is_active ? 'deactivated' : 'activated'} successfully`);
      }
    } catch (error) {
      console.error('Error updating template status:', error);
      Alert.alert('Error', 'Failed to update template status');
    }
  };

  const handleDelete = (template: ScheduleTemplate) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete template "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await AdminAPI.deleteScheduleTemplate(template.id);
              if (response.success) {
                Alert.alert('Success', 'Template deleted successfully');
                loadTemplates();
              }
            } catch (error) {
              console.error('Error deleting template:', error);
              Alert.alert('Error', 'Failed to delete template');
            }
          },
        },
      ]
    );
  };

  const renderTemplateItem = ({ item }: { item: ScheduleTemplate }) => (
    <View style={styles.templateCard}>
      <View style={styles.templateInfo}>
        <View style={styles.templateHeader}>
          <Text style={styles.templateName}>{item.name}</Text>
          <View style={[styles.statusBadge, item.is_active ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={[styles.statusText, item.is_active ? styles.activeText : styles.inactiveText]}>
              {item.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <Text style={styles.templateDescription}>{item.description}</Text>
        <View style={styles.templateMeta}>
          <Text style={styles.metaText}>Version: {item.version}</Text>
          <Text style={styles.metaText}>Created: {new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.templateActions}>
        <View style={styles.downloadActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton]}
            onPress={() => handleDownloadTemplate(item.id)}
          >
            <Ionicons name="download-outline" size={16} color={Colors.white} />
            <Text style={styles.actionButtonText}>Template</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.sampleButton]}
            onPress={() => handleDownloadSample(item.id)}
          >
            <Ionicons name="document-outline" size={16} color={Colors.white} />
            <Text style={styles.actionButtonText}>Sample</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.instructionsButton]}
            onPress={() => handleDownloadInstructions(item.id)}
          >
            <Ionicons name="help-circle-outline" size={16} color={Colors.white} />
            <Text style={styles.actionButtonText}>Guide</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controlActions}>
          <TouchableOpacity
            style={[styles.controlButton, item.is_active ? styles.deactivateButton : styles.activateButton]}
            onPress={() => handleToggleActive(item)}
          >
            <Ionicons 
              name={item.is_active ? 'pause-outline' : 'play-outline'} 
              size={20} 
              color={Colors.white} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={Colors.text.secondary} />
      <Text style={styles.emptyText}>No schedule templates found</Text>
      <Text style={styles.emptySubtext}>Templates will appear here when they are created</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Schedule Templates</Text>
          <Text style={styles.subtitle}>{templates.length} template(s) available</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={templates}
        renderItem={renderTemplateItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={[styles.listContent, templates.length === 0 && styles.listContentEmpty]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
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
  headerContent: {
    flex: 1,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  refreshButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  templateCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  templateInfo: {
    marginBottom: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  templateName: {
    ...Typography.h4,
    color: Colors.text.primary,
    flex: 1,
  },
  templateDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  activeBadge: {
    backgroundColor: Colors.success + '20',
  },
  inactiveBadge: {
    backgroundColor: Colors.warning + '20',
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  activeText: {
    color: Colors.success,
  },
  inactiveText: {
    color: Colors.warning,
  },
  templateActions: {
    gap: 12,
  },
  downloadActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  downloadButton: {
    backgroundColor: Colors.primary,
  },
  sampleButton: {
    backgroundColor: Colors.info,
  },
  instructionsButton: {
    backgroundColor: Colors.warning,
  },
  actionButtonText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  controlActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activateButton: {
    backgroundColor: Colors.success,
  },
  deactivateButton: {
    backgroundColor: Colors.warning,
  },
  deleteButton: {
    backgroundColor: Colors.danger,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...Typography.h4,
    color: Colors.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    ...Typography.body2,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});