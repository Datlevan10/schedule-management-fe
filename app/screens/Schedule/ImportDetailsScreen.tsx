import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ScheduleEntry,
  ScheduleImport,
  ScheduleImportNewAPI,
} from '../../api/schedule-import-new.api';
import { Button, Card } from '../../components/common';
import { Colors, Typography } from '../../constants';

export default function ImportDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [importDetails, setImportDetails] = useState<ScheduleImport | null>(null);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (id) {
      loadImportDetails();
    }
  }, [id]);

  const loadImportDetails = async () => {
    try {
      setLoading(true);
      
      const [importResponse, entriesResponse] = await Promise.all([
        ScheduleImportNewAPI.getImport(parseInt(id)),
        ScheduleImportNewAPI.getEntries(parseInt(id)),
      ]);

      if (importResponse.success) {
        setImportDetails(importResponse.data);
      }

      if (entriesResponse.success) {
        setEntries(entriesResponse.data);
      }
    } catch (error) {
      console.error('Error loading import details:', error);
      Alert.alert('Error', 'Failed to load import details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadImportDetails();
  };

  const handleProcessImport = async () => {
    if (!importDetails) return;

    try {
      setProcessing(true);
      const response = await ScheduleImportNewAPI.processImport(importDetails.id);
      
      if (response.success) {
        Alert.alert('Processing Started', 'AI processing has been triggered');
        loadImportDetails();
      }
    } catch (error: any) {
      console.error('Error processing import:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to process import');
    } finally {
      setProcessing(false);
    }
  };

  const handleConvertToEvents = async () => {
    if (!importDetails) return;

    try {
      setConverting(true);
      const response = await ScheduleImportNewAPI.convertToEvents(importDetails.id);
      
      if (response.success) {
        Alert.alert('Conversion Started', 'Converting entries to calendar events');
        loadImportDetails();
      }
    } catch (error: any) {
      console.error('Error converting to events:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to convert to events');
    } finally {
      setConverting(false);
    }
  };

  const handleDeleteImport = () => {
    if (!importDetails) return;

    Alert.alert(
      'Delete Import',
      'Are you sure you want to delete this import? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ScheduleImportNewAPI.deleteImport(importDetails.id);
              if (response.success) {
                Alert.alert('Deleted', 'Import has been deleted', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              }
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete import');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'processing': return Colors.warning;
      case 'failed': return Colors.danger;
      default: return Colors.text.secondary;
    }
  };

  const getValidationStatusColor = (status: string): string => {
    switch (status) {
      case 'valid': return Colors.success;
      case 'invalid': return Colors.danger;
      case 'needs_review': return Colors.warning;
      default: return Colors.text.secondary;
    }
  };

  const renderProgressBar = (current: number, total: number, color: string) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: total > 0 ? `${(current / total) * 100}%` : '0%',
              backgroundColor: color 
            }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>{current}/{total}</Text>
    </View>
  );

  const renderEntry = ({ item }: { item: ScheduleEntry }) => (
    <Card style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle}>
          {item.parsed_data.title || 'Untitled Entry'}
        </Text>
        <View style={[
          styles.validationBadge,
          { backgroundColor: getValidationStatusColor(item.validation_status) + '20' }
        ]}>
          <Text style={[
            styles.validationText,
            { color: getValidationStatusColor(item.validation_status) }
          ]}>
            {item.validation_status}
          </Text>
        </View>
      </View>

      <Text style={styles.originalText}>Original: {item.original_text}</Text>
      
      {item.parsed_data.description && (
        <Text style={styles.entryDescription}>{item.parsed_data.description}</Text>
      )}

      <View style={styles.entryDetails}>
        {item.parsed_data.start_date && (
          <Text style={styles.entryDetail}>📅 {item.parsed_data.start_date}</Text>
        )}
        {item.parsed_data.start_time && (
          <Text style={styles.entryDetail}>⏰ {item.parsed_data.start_time}</Text>
        )}
        {item.parsed_data.location && (
          <Text style={styles.entryDetail}>📍 {item.parsed_data.location}</Text>
        )}
        {item.parsed_data.priority && (
          <Text style={styles.entryDetail}>🔥 {item.parsed_data.priority}</Text>
        )}
      </View>

      <View style={styles.entryFooter}>
        <Text style={styles.confidenceText}>
          AI Confidence: {Math.round(item.ai_confidence * 100)}%
        </Text>
        {item.is_converted && (
          <Text style={styles.convertedText}>✅ Converted to Event</Text>
        )}
      </View>

      {item.validation_errors && item.validation_errors.length > 0 && (
        <View style={styles.errorsContainer}>
          <Text style={styles.errorsTitle}>Validation Errors:</Text>
          {item.validation_errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>• {error}</Text>
          ))}
        </View>
      )}
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading import details...</Text>
      </View>
    );
  }

  if (!importDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>Import not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Import #{importDetails.id}</Text>
      </View>

      {/* Import Status */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Import Status</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(importDetails.status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(importDetails.status) }
            ]}>
              {importDetails.status}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Type:</Text>
          <Text style={styles.statusValue}>
            {importDetails.import_type} ({importDetails.source_type})
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Created:</Text>
          <Text style={styles.statusValue}>
            {importDetails.metadata.created_at_human}
          </Text>
        </View>

        {importDetails.original_filename && (
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>File:</Text>
            <Text style={styles.statusValue}>{importDetails.original_filename}</Text>
          </View>
        )}
      </Card>

      {/* Progress Overview */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Overview</Text>
        
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Total Entries</Text>
          {renderProgressBar(
            importDetails.total_entries,
            importDetails.total_entries,
            Colors.primary
          )}
        </View>

        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Processed</Text>
          {renderProgressBar(
            importDetails.processed_entries,
            importDetails.total_entries,
            Colors.warning
          )}
        </View>

        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Successful</Text>
          {renderProgressBar(
            importDetails.success_entries,
            importDetails.total_entries,
            Colors.success
          )}
        </View>

        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Failed</Text>
          {renderProgressBar(
            importDetails.failed_entries,
            importDetails.total_entries,
            Colors.danger
          )}
        </View>
      </Card>

      {/* AI Processing Status */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>AI Processing</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>AI Status:</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(importDetails.ai_processing_status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(importDetails.ai_processing_status) }
            ]}>
              {importDetails.ai_processing_status}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Conversion:</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(importDetails.conversion_status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(importDetails.conversion_status) }
            ]}>
              {importDetails.conversion_status}
            </Text>
          </View>
        </View>
      </Card>

      {/* Action Buttons */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <View style={styles.actionsGrid}>
          <Button
            title={processing ? 'Processing...' : 'Process with AI'}
            onPress={handleProcessImport}
            loading={processing}
            disabled={importDetails.ai_processing_status === 'completed'}
            style={styles.actionButton}
          />

          <Button
            title={converting ? 'Converting...' : 'Convert to Events'}
            onPress={handleConvertToEvents}
            loading={converting}
            disabled={
              importDetails.ai_processing_status !== 'completed' ||
              importDetails.conversion_status === 'completed'
            }
            variant="secondary"
            style={styles.actionButton}
          />

          <Button
            title="Delete Import"
            onPress={handleDeleteImport}
            variant="danger"
            style={styles.actionButton}
          />
        </View>
      </Card>

      {/* Parsed Entries */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Parsed Entries ({entries.length})</Text>
        
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    padding: 20,
  },
  errorMessage: {
    ...Typography.body1,
    color: Colors.text.secondary,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    width: 100,
  },
  statusValue: {
    ...Typography.body1,
    color: Colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    ...Typography.body2,
    fontWeight: '600',
  },
  progressItem: {
    marginBottom: 16,
  },
  progressLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
  entryCard: {
    marginBottom: 12,
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  validationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  validationText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  originalText: {
    ...Typography.body2,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  entryDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  entryDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  entryDetail: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  convertedText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '600',
  },
  errorsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.danger + '10',
    borderRadius: 8,
  },
  errorsTitle: {
    ...Typography.body2,
    color: Colors.danger,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    marginBottom: 2,
  },
});