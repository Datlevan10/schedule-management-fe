import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AdminCustomerReportingAPI, {
  CustomerReportingTemplate,
} from '../api/admin-customer-reporting.api';
import { Button, Card, Input } from '../components/common';
import { Colors, Typography } from '../constants';

export default function CustomerReportingScreen() {
  const [templates, setTemplates] = useState<CustomerReportingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    template_name: '',
    report_frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    customer_limit: 1000,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await AdminCustomerReportingAPI.getTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load customer reporting templates');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.template_name.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return;
    }

    try {
      const templateData = {
        template_name: newTemplate.template_name,
        customer_fields: ['name', 'email', 'profession_id', 'created_at'],
        report_frequency: newTemplate.report_frequency,
        customer_limit: newTemplate.customer_limit,
        aggregation_rules: {
          name: 'count',
          profession_id: 'group_by',
        },
        filter_conditions: {},
        is_active: true,
      };

      const response = await AdminCustomerReportingAPI.createTemplate(templateData);
      if (response.success) {
        Alert.alert('Success', 'Template created successfully');
        setShowCreateModal(false);
        setNewTemplate({
          template_name: '',
          report_frequency: 'monthly',
          customer_limit: 1000,
        });
        loadTemplates();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create template');
    }
  };

  const handleToggleActive = async (templateId: number) => {
    try {
      await AdminCustomerReportingAPI.toggleTemplateActive(templateId);
      loadTemplates();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle template status');
    }
  };

  const handleCloneTemplate = async (templateId: number, templateName: string) => {
    try {
      const newName = `${templateName} (Copy)`;
      const response = await AdminCustomerReportingAPI.cloneTemplate(templateId, newName);
      if (response.success) {
        Alert.alert('Success', 'Template cloned successfully');
        loadTemplates();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to clone template');
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminCustomerReportingAPI.deleteTemplate(templateId);
              Alert.alert('Success', 'Template deleted successfully');
              loadTemplates();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete template');
            }
          },
        },
      ]
    );
  };

  const handleGenerateReport = async (templateId: number, templateName: string) => {
    Alert.alert(
      'Generate Report',
      `Generate report using template: ${templateName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            try {
              const response = await AdminCustomerReportingAPI.generateReport(templateId);
              if (response.success) {
                Alert.alert(
                  'Report Generated',
                  `Report generated successfully!\nRecords: ${response.data.summary.total_records}\nGenerated at: ${response.data.summary.generated_at}`
                );
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to generate report');
            }
          },
        },
      ]
    );
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '#EF4444';
      case 'weekly': return '#F59E0B';
      case 'monthly': return '#10B981';
      case 'yearly': return '#3B82F6';
      default: return Colors.primary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading templates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Reporting Templates</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Template</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadTemplates();
          }} />
        }
      >
        {templates.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No templates found</Text>
            <Text style={styles.emptySubtext}>Create your first reporting template</Text>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id} style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{template.template_name}</Text>
                  <View style={styles.templateMeta}>
                    <View style={[
                      styles.frequencyBadge,
                      { backgroundColor: getFrequencyColor(template.report_frequency) }
                    ]}>
                      <Text style={styles.frequencyText}>{template.report_frequency}</Text>
                    </View>
                    <Text style={styles.limitText}>Limit: {template.customer_limit}</Text>
                  </View>
                </View>
                <Switch
                  value={template.is_active}
                  onValueChange={() => handleToggleActive(template.id)}
                  trackColor={{ false: '#E5E7EB', true: Colors.success }}
                />
              </View>

              <View style={styles.templateStats}>
                <Text style={styles.statsText}>
                  Last generated: {template.metadata?.last_generated || 'Never'}
                </Text>
                <Text style={styles.statsText}>
                  Total generations: {template.metadata?.total_generations || 0}
                </Text>
              </View>

              <View style={styles.templateActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.generateButton]}
                  onPress={() => handleGenerateReport(template.id, template.template_name)}
                >
                  <Text style={styles.generateButtonText}>📊 Generate</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.cloneButton]}
                  onPress={() => handleCloneTemplate(template.id, template.template_name)}
                >
                  <Text style={styles.cloneButtonText}>📋 Clone</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteTemplate(template.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Create Template Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Template</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Card style={styles.modalCard}>
              <Input
                label="Template Name"
                value={newTemplate.template_name}
                onChangeText={(text) => setNewTemplate({ ...newTemplate, template_name: text })}
                placeholder="Enter template name"
              />

              <View style={styles.formGroup}>
                <Text style={styles.label}>Report Frequency</Text>
                <View style={styles.frequencyOptions}>
                  {['daily', 'weekly', 'monthly', 'yearly'].map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.frequencyOption,
                        newTemplate.report_frequency === freq && styles.selectedFrequency
                      ]}
                      onPress={() => setNewTemplate({ 
                        ...newTemplate, 
                        report_frequency: freq as 'daily' | 'weekly' | 'monthly' | 'yearly' 
                      })}
                    >
                      <Text style={[
                        styles.frequencyOptionText,
                        newTemplate.report_frequency === freq && styles.selectedFrequencyText
                      ]}>
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Input
                label="Customer Limit"
                value={newTemplate.customer_limit.toString()}
                onChangeText={(text) => setNewTemplate({ 
                  ...newTemplate, 
                  customer_limit: parseInt(text) || 1000 
                })}
                placeholder="1000"
                keyboardType="numeric"
              />
            </Card>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setShowCreateModal(false)}
              style={styles.modalButton}
            />
            <Button
              title="Create Template"
              onPress={handleCreateTemplate}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    ...Typography.body2,
    color: Colors.white,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  templateCard: {
    padding: 20,
    marginBottom: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  frequencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  frequencyText: {
    ...Typography.body2,
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  limitText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  templateStats: {
    marginBottom: 16,
  },
  statsText: {
    ...Typography.body2,
    color: Colors.text.tertiary,
    marginBottom: 4,
  },
  templateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: Colors.primary + '20',
  },
  generateButtonText: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
  },
  cloneButton: {
    backgroundColor: Colors.warning + '20',
  },
  cloneButtonText: {
    ...Typography.body2,
    color: '#D97706',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: Colors.danger + '20',
  },
  deleteButtonText: {
    ...Typography.body2,
    color: Colors.danger,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  closeButton: {
    ...Typography.h3,
    color: Colors.text.secondary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalCard: {
    padding: 20,
    marginTop: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  selectedFrequency: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  frequencyOptionText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  selectedFrequencyText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});