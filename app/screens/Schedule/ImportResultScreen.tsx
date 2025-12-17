import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { ScheduleImportNewAPI } from '../../api/schedule-import-new.api';
import { Card } from '../../components/common';
import { Colors } from '../../constants';
import { useAuth } from '../../hooks';
import { FileDownloadManager } from '../../utils/fileDownload';

interface ImportDetails {
  id: number;
  user_id: number;
  import_type: string;
  source_type: string;
  original_filename?: string;
  status: string;
  total_records_found: number;
  successfully_processed: number;
  failed_records: number;
  ai_confidence_score?: string;
  processing_duration?: string;
  created_at_formatted: string;
}

interface ProcessedEntry {
  id: number;
  original_text: string;
  parsed_data: {
    title?: string;
    description?: string;
    start_datetime?: string;
    end_datetime?: string;
    location?: string;
    priority?: string;
    category?: string;
  };
  ai_confidence: number;
  validation_status: string;
}

export default function ImportResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [importDetails, setImportDetails] = useState<ImportDetails | null>(null);
  const [entries, setEntries] = useState<ProcessedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (id) {
      loadImportDetails();
      loadEntries();
    }
  }, [id]);

  const loadImportDetails = async () => {
    try {
      const response = await ScheduleImportNewAPI.getImport(parseInt(id));
      if (response.success) {
        setImportDetails(response.data as any);
      }
    } catch (error) {
      console.error('Error loading import details:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin nhập khẩu');
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    try {
      const response = await ScheduleImportNewAPI.getImportEntries(parseInt(id), user?.id);
      if (response.success) {
        setEntries(response.data);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadImportDetails(), loadEntries()]);
    setRefreshing(false);
  };

  const handleExportCSV = async (format: string) => {
    try {
      setExporting(true);
      const response = await ScheduleImportNewAPI.exportImportAsCSV(
        parseInt(id),
        user?.id || 1,
        format
      );
      
      if (response.success) {
        // Save the CSV file
        const success = await FileDownloadManager.saveBase64File(
          response.data.content_base64,
          response.data.filename
        );
        
        if (success) {
          Alert.alert('Thành công', 'Đã xuất file CSV thành công');
        }
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Lỗi', 'Không thể xuất file CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleConvertToEvents = async () => {
    try {
      Alert.alert(
        'Xác nhận',
        'Bạn có muốn chuyển đổi dữ liệu này thành sự kiện?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Chuyển đổi',
            onPress: async () => {
              const response = await ScheduleImportNewAPI.convertToEvents(parseInt(id));
              if (response.success) {
                Alert.alert('Thành công', 'Đã chuyển đổi thành sự kiện');
                loadImportDetails();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error converting to events:', error);
      Alert.alert('Lỗi', 'Không thể chuyển đổi thành sự kiện');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'processing':
        return Colors.warning;
      case 'failed':
        return Colors.danger;
      default:
        return Colors.text.secondary;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return Colors.success;
    if (confidence >= 0.6) return Colors.warning;
    return Colors.danger;
  };

  const renderEntry = ({ item }: { item: ProcessedEntry }) => (
    <Card style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle}>
          {item.parsed_data.title || 'Không có tiêu đề'}
        </Text>
        <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(item.ai_confidence) }]}>
          <Text style={styles.confidenceText}>
            {(item.ai_confidence * 100).toFixed(0)}%
          </Text>
        </View>
      </View>
      
      {item.parsed_data.description && (
        <Text style={styles.entryDescription}>{item.parsed_data.description}</Text>
      )}
      
      <View style={styles.entryDetails}>
        {item.parsed_data.start_datetime && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.detailText}>
              {new Date(item.parsed_data.start_datetime).toLocaleString('vi-VN')}
            </Text>
          </View>
        )}
        
        {item.parsed_data.location && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.detailText}>{item.parsed_data.location}</Text>
          </View>
        )}
        
        {item.parsed_data.category && (
          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.detailText}>{item.parsed_data.category}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.originalText}>Văn bản gốc: {item.original_text}</Text>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải kết quả...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Import Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Thông tin nhập khẩu</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tệp:</Text>
          <Text style={styles.summaryValue}>
            {importDetails?.original_filename || 'Nhập thủ công'}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Trạng thái:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(importDetails?.status || '') }]}>
            <Text style={styles.statusText}>{importDetails?.status}</Text>
          </View>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng số bản ghi:</Text>
          <Text style={styles.summaryValue}>{importDetails?.total_records_found || 0}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Xử lý thành công:</Text>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>
            {importDetails?.successfully_processed || 0}
          </Text>
        </View>
        
        {importDetails?.failed_records > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Thất bại:</Text>
            <Text style={[styles.summaryValue, { color: Colors.danger }]}>
              {importDetails.failed_records}
            </Text>
          </View>
        )}
        
        {importDetails?.ai_confidence_score && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Độ tin cậy AI:</Text>
            <Text style={styles.summaryValue}>
              {(parseFloat(importDetails.ai_confidence_score) * 100).toFixed(0)}%
            </Text>
          </View>
        )}
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.primary }]}
          onPress={() => handleExportCSV('ai_enhanced')}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Xuất CSV (AI)</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.success }]}
          onPress={() => handleExportCSV('standard')}
          disabled={exporting}
        >
          <Ionicons name="document-text-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Xuất CSV chuẩn</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.warning }]}
          onPress={handleConvertToEvents}
        >
          <Ionicons name="sync-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Chuyển thành sự kiện</Text>
        </TouchableOpacity>
      </View>

      {/* Processed Entries */}
      <View style={styles.entriesSection}>
        <Text style={styles.sectionTitle}>Dữ liệu đã xử lý ({entries.length})</Text>
        
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>Chưa có dữ liệu được xử lý</Text>
            </Card>
          }
        />
      </View>
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
  },
  loadingText: {
    marginTop: 10,
    color: Colors.text.secondary,
  },
  summaryCard: {
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  entriesSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  entryCard: {
    padding: 12,
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  entryDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  entryDetails: {
    gap: 6,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  originalText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});