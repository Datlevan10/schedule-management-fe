import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CreateScheduleImportRequest,
  ScheduleImport,
  ScheduleImportNewAPI,
  ScheduleImportTemplate,
} from '../../api/schedule-import-new.api';
import { Button, Card } from '../../components/common';
import { Colors, Typography } from '../../constants';
import { FileDownloadManager } from '../../utils/fileDownload';

type ImportType = 'file_upload' | 'manual_input' | 'text_parsing';
type SourceType = 'csv' | 'excel' | 'txt' | 'manual' | 'json';

interface FileType {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
}

export default function ScheduleImportScreen() {
  const [importType, setImportType] = useState<ImportType>('file_upload');
  const [sourceType, setSourceType] = useState<SourceType>('csv');
  const [templates, setTemplates] = useState<ScheduleImportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleImportTemplate | null>(null);
  const [file, setFile] = useState<FileType | null>(null);
  const [textContent, setTextContent] = useState('');
  const [importing, setImporting] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [recentImports, setRecentImports] = useState<ScheduleImport[]>([]);
  const [loadingImports, setLoadingImports] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadRecentImports();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await ScheduleImportNewAPI.getTemplates();
      if (response.success) {
        setTemplates(response.data);
        // Auto-select first active template
        const activeTemplate = response.data.find(t => t.status.is_active);
        if (activeTemplate) {
          setSelectedTemplate(activeTemplate);
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      Alert.alert('Error', 'Failed to load templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadRecentImports = async () => {
    try {
      setLoadingImports(true);
      const response = await ScheduleImportNewAPI.getImports();
      if (response.success) {
        setRecentImports(response.data.slice(0, 5)); // Show last 5 imports
      }
    } catch (error) {
      console.error('Error loading recent imports:', error);
    } finally {
      setLoadingImports(false);
    }
  };

  const handleFileUpload = async () => {
    try {
      let result;
      
      if (sourceType === 'csv') {
        result = await DocumentPicker.getDocumentAsync({
          type: ['text/csv', 'text/comma-separated-values'],
          copyToCacheDirectory: true,
        });
      } else if (sourceType === 'excel') {
        result = await DocumentPicker.getDocumentAsync({
          type: [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ],
          copyToCacheDirectory: true,
        });
      } else if (sourceType === 'txt') {
        result = await DocumentPicker.getDocumentAsync({
          type: ['text/plain'],
          copyToCacheDirectory: true,
        });
      }

      if (!result?.canceled && result.assets[0]) {
        const selectedFile = result.assets[0];
        setFile({
          name: selectedFile.name,
          uri: selectedFile.uri,
          mimeType: selectedFile.mimeType,
          size: selectedFile.size,
        });
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const handleDownloadTemplate = async (templateId: number, type: 'template' | 'sample' | 'instructions') => {
    try {
      let success = false;

      switch (type) {
        case 'template':
          success = await FileDownloadManager.downloadTemplate(templateId);
          break;
        case 'sample':
          success = await FileDownloadManager.downloadSample(templateId);
          break;
        case 'instructions':
          success = await FileDownloadManager.downloadInstructions(templateId);
          break;
      }

      if (success) {
        console.log(`Successfully downloaded ${type} for template ${templateId}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const handleImport = async () => {
    try {
      setImporting(true);

      let importData: CreateScheduleImportRequest;

      if (importType === 'file_upload') {
        if (!file) {
          Alert.alert('Error', 'Please select a file to upload');
          return;
        }

        importData = {
          import_type: 'file_upload',
          source_type: sourceType,
          file: {
            uri: file.uri,
            type: file.mimeType,
            name: file.name,
          },
        };
      } else {
        if (!textContent.trim()) {
          Alert.alert('Error', 'Please enter some content');
          return;
        }

        importData = {
          import_type: importType,
          source_type: importType === 'manual_input' ? 'manual' : 'txt',
          raw_content: textContent,
        };
      }

      const response = await ScheduleImportNewAPI.createImport(importData);

      if (response.success) {
        Alert.alert(
          'Import Started',
          `Your ${importType === 'file_upload' ? 'file' : 'text'} import has been started. Import ID: ${response.data.id}`,
          [
            {
              text: 'View Details',
              onPress: () => router.push(`/schedule/import/${response.data.id}`),
            },
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setFile(null);
                setTextContent('');
                loadRecentImports();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Import error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to start import');
    } finally {
      setImporting(false);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb > 1) {
      return `${mb.toFixed(1)} MB`;
    }
    return `${kb.toFixed(1)} KB`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'processing': return Colors.warning;
      case 'failed': return Colors.danger;
      default: return Colors.text.secondary;
    }
  };

  const renderImportOption = (type: ImportType, title: string, description: string) => (
    <TouchableOpacity
      style={[styles.optionCard, importType === type && styles.selectedOption]}
      onPress={() => setImportType(type)}
    >
      <Text style={[styles.optionTitle, importType === type && styles.selectedText]}>
        {title}
      </Text>
      <Text style={[styles.optionDescription, importType === type && styles.selectedText]}>
        {description}
      </Text>
    </TouchableOpacity>
  );

  const renderSourceOption = (type: SourceType, title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.sourceButton, sourceType === type && styles.selectedSource]}
      onPress={() => setSourceType(type)}
    >
      <Text style={styles.sourceIcon}>{icon}</Text>
      <Text style={[styles.sourceText, sourceType === type && styles.selectedSourceText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderRecentImport = ({ item }: { item: ScheduleImport }) => (
    <TouchableOpacity
      style={styles.importCard}
      onPress={() => router.push(`/schedule/import/${item.id}`)}
    >
      <View style={styles.importHeader}>
        <Text style={styles.importId}>Import #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.importType}>
        {item.import_type} • {item.source_type}
      </Text>
      <Text style={styles.importStats}>
        {item.total_entries} entries • {item.success_entries} successful
      </Text>
      <Text style={styles.importDate}>
        {item.metadata.created_at_human}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule Import</Text>
        </View>

        {/* Import Type Selection */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Import Method</Text>
          {renderImportOption('file_upload', 'File Upload', 'Upload CSV, Excel, or text files')}
          {renderImportOption('manual_input', 'Manual Input', 'Type your schedule directly')}
          {renderImportOption('text_parsing', 'Smart Parsing', 'Natural language processing')}
        </Card>

        {/* File Upload Section */}
        {importType === 'file_upload' && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>File Upload</Text>
            
            <View style={styles.sourceGrid}>
              {renderSourceOption('csv', 'CSV', '📊')}
              {renderSourceOption('excel', 'Excel', '📈')}
              {renderSourceOption('txt', 'Text', '📄')}
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="Select File"
                onPress={handleFileUpload}
                variant="outline"
                style={styles.button}
              />
              {selectedTemplate && (
                <Button
                  title="Download Sample"
                  onPress={() => handleDownloadTemplate(selectedTemplate.id, 'sample')}
                  variant="secondary"
                  style={styles.button}
                />
              )}
            </View>

            {file && (
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>📎 {file.name}</Text>
                <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Manual Input Section */}
        {(importType === 'manual_input' || importType === 'text_parsing') && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>
              {importType === 'manual_input' ? 'Enter Schedule Data' : 'Natural Language Input'}
            </Text>
            <Text style={styles.sectionDescription}>
              {importType === 'manual_input'
                ? 'Enter your schedule in a structured format'
                : 'Describe your schedule in natural language'
              }
            </Text>

            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={8}
              placeholder={
                importType === 'manual_input'
                  ? 'Example:\nMonday 9:00-10:00 Team Meeting\nTuesday 14:00-16:00 Project Review'
                  : 'Example:\nTôi có cuộc họp team vào thứ 2 lúc 9 giờ sáng\nThứ 3 tôi cần review dự án từ 2-4 giờ chiều'
              }
              value={textContent}
              onChangeText={setTextContent}
              textAlignVertical="top"
            />
          </Card>
        )}

        {/* Template Selection */}
        {importType === 'file_upload' && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Template</Text>
            <TouchableOpacity
              style={styles.templateSelector}
              onPress={() => setShowTemplateModal(true)}
            >
              <Text style={styles.templateText}>
                {selectedTemplate ? selectedTemplate.template_name : 'Select Template'}
              </Text>
              <Text style={styles.templateArrow}>›</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Recent Imports */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Imports</Text>
          {loadingImports ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <FlatList
              data={recentImports}
              renderItem={renderRecentImport}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Card>

        {/* Import Button */}
        <Button
          title={importing ? 'Processing...' : 'Start Import'}
          onPress={handleImport}
          loading={importing}
          disabled={
            importing ||
            (importType === 'file_upload' && !file) ||
            ((importType === 'manual_input' || importType === 'text_parsing') && !textContent.trim())
          }
          style={styles.importButton}
        />
      </ScrollView>

      {/* Template Selection Modal */}
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Template</Text>
            
            {loadingTemplates ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              <FlatList
                data={templates}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.templateItem,
                      selectedTemplate?.id === item.id && styles.selectedTemplate
                    ]}
                    onPress={() => {
                      setSelectedTemplate(item);
                      setShowTemplateModal(false);
                    }}
                  >
                    <Text style={styles.templateName}>{item.template_name}</Text>
                    <Text style={styles.templateDescription}>{item.template_description}</Text>
                    
                    <View style={styles.templateActions}>
                      <TouchableOpacity
                        style={styles.templateActionButton}
                        onPress={() => handleDownloadTemplate(item.id, 'sample')}
                      >
                        <Text style={styles.templateActionText}>Sample</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.templateActionButton}
                        onPress={() => handleDownloadTemplate(item.id, 'template')}
                      >
                        <Text style={styles.templateActionText}>Template</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}

            <Button
              title="Close"
              onPress={() => setShowTemplateModal(false)}
              variant="outline"
              style={styles.modalCloseButton}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    ...Typography.body1,
    color: Colors.primary,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    flex: 1,
  },
  section: {
    margin: 20,
    marginTop: 0,
    padding: 20,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  sectionDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  optionCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: 12,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
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
  selectedText: {
    color: Colors.primary,
  },
  sourceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sourceButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  selectedSource: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  sourceIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  sourceText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  selectedSourceText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
  },
  fileInfo: {
    backgroundColor: Colors.background.secondary,
    padding: 12,
    borderRadius: 8,
  },
  fileName: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  fileSize: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 16,
    ...Typography.body1,
    color: Colors.text.primary,
    minHeight: 120,
  },
  templateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
  },
  templateText: {
    ...Typography.body1,
    color: Colors.text.primary,
    flex: 1,
  },
  templateArrow: {
    ...Typography.h3,
    color: Colors.text.secondary,
  },
  importCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  importHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  importId: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  importType: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  importStats: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  importDate: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  importButton: {
    margin: 20,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  templateItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: 12,
  },
  selectedTemplate: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  templateName: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  templateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  templateActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary + '20',
    borderRadius: 6,
  },
  templateActionText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 20,
  },
});