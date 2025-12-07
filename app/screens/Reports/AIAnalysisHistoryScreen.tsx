import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskSelectionAPI, AnalysisHistoryItem } from '../../api/task-selection.api';
import { Colors, Typography } from '../../constants';

export default function AIAnalysisHistoryScreen() {
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistoryItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async (page: number = 1) => {
    try {
      setLoading(page === 1);
      const userDataStr = await AsyncStorage.getItem('userData');
      if (!userDataStr) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        return;
      }

      const userData = JSON.parse(userDataStr);
      const userId = userData.id;

      const response = await TaskSelectionAPI.getAnalysisHistory(userId, page, 10);
      
      if (response.status === 'success') {
        if (page === 1) {
          setAnalyses(response.data.analyses);
        } else {
          setAnalyses(prev => [...prev, ...response.data.analyses]);
        }
        setCurrentPage(response.data.pagination.current_page);
        setTotalPages(response.data.pagination.total_pages);
      }
    } catch (error) {
      console.error('Error loading analysis history:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử phân tích');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    loadAnalysisHistory(1);
  };

  const loadMore = () => {
    if (currentPage < totalPages && !loading) {
      loadAnalysisHistory(currentPage + 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'optimization':
        return 'Tối ưu hóa';
      case 'comprehensive':
        return 'Toàn diện';
      case 'weekly_optimization':
        return 'Tối ưu tuần';
      default:
        return 'Không xác định';
    }
  };

  const openAnalysisDetail = (analysis: AnalysisHistoryItem) => {
    setSelectedAnalysis(analysis);
    setModalVisible(true);
  };

  const renderAnalysisItem = ({ item }: { item: AnalysisHistoryItem }) => (
    <TouchableOpacity
      style={styles.analysisCard}
      onPress={() => openAnalysisDetail(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.analysisType}>{getAnalysisTypeLabel(item.analysis_type)}</Text>
        <Text style={styles.date}>{formatDate(item.analyzed_at)}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.taskCount}>
          {item.task_summary.selected_tasks_count} nhiệm vụ được phân tích
        </Text>
        <Text style={styles.duration}>
          Tổng thời gian: {Math.round(item.task_summary.total_duration_minutes / 60)}h {item.task_summary.total_duration_minutes % 60}m
        </Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Độ tin cậy:</Text>
          <Text style={[styles.score, { color: Colors.success }]}>
            {item.ai_analysis.confidence}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.model}>Model: {item.ai_analysis.model_used}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>📊 {item.ai_analysis.usage.total_tokens} tokens</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết phân tích AI</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            {selectedAnalysis && (
              <View>
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Thông tin chung</Text>
                  <Text style={styles.detailText}>
                    Loại: {getAnalysisTypeLabel(selectedAnalysis.analysis_type)}
                  </Text>
                  <Text style={styles.detailText}>
                    Ngày phân tích: {formatDate(selectedAnalysis.analyzed_at)}
                  </Text>
                  <Text style={styles.detailText}>
                    Số nhiệm vụ: {selectedAnalysis.task_summary.selected_tasks_count}
                  </Text>
                </View>

                {selectedAnalysis.ai_analysis.structured_response.task_assessment && (
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Đánh giá tổ hợp công việc</Text>
                    <Text style={styles.detailContent}>{selectedAnalysis.ai_analysis.structured_response.task_assessment.task_combination}</Text>
                    
                    <Text style={styles.sectionTitle}>Tổng thời gian</Text>
                    <Text style={styles.detailContent}>{selectedAnalysis.ai_analysis.structured_response.task_assessment.total_duration}</Text>
                  </View>
                )}

                {selectedAnalysis.ai_analysis.structured_response.conflicts_identified && (
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Xung đột lịch trình</Text>
                    <Text style={styles.detailContent}>{selectedAnalysis.ai_analysis.structured_response.conflicts_identified.scheduling_conflict}</Text>
                    
                    <Text style={styles.sectionTitle}>Xung đột địa điểm</Text>
                    <Text style={styles.detailContent}>{selectedAnalysis.ai_analysis.structured_response.conflicts_identified.location_conflict}</Text>
                  </View>
                )}

                {selectedAnalysis.ai_analysis.structured_response.optimization_suggestions && (
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Gợi ý tối ưu cho Nhiệm vụ 1</Text>
                    <Text style={styles.detailText}>ID: {selectedAnalysis.ai_analysis.structured_response.optimization_suggestions.task_1.task_id}</Text>
                    {selectedAnalysis.ai_analysis.structured_response.optimization_suggestions.task_1.suggestions.map((suggestion, index) => (
                      <Text key={index} style={styles.bulletPoint}>• {suggestion}</Text>
                    ))}
                    
                    <Text style={styles.sectionTitle}>Gợi ý tối ưu cho Nhiệm vụ 2</Text>
                    <Text style={styles.detailText}>ID: {selectedAnalysis.ai_analysis.structured_response.optimization_suggestions.task_2.task_id}</Text>
                    {selectedAnalysis.ai_analysis.structured_response.optimization_suggestions.task_2.suggestions.map((suggestion, index) => (
                      <Text key={index} style={styles.bulletPoint}>• {suggestion}</Text>
                    ))}
                  </View>
                )}

                {selectedAnalysis.ai_analysis.structured_response.priority_recommendations && (
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Nhiệm vụ ưu tiên cao</Text>
                    <Text style={styles.detailText}>ID: {selectedAnalysis.ai_analysis.structured_response.priority_recommendations.high_priority_task.task_id}</Text>
                    <Text style={styles.detailContent}>{selectedAnalysis.ai_analysis.structured_response.priority_recommendations.high_priority_task.time_allocation}</Text>
                    
                    <Text style={styles.sectionTitle}>Nhiệm vụ ưu tiên thấp</Text>
                    <Text style={styles.detailText}>ID: {selectedAnalysis.ai_analysis.structured_response.priority_recommendations.low_priority_task.task_id}</Text>
                    <Text style={styles.detailContent}>{selectedAnalysis.ai_analysis.structured_response.priority_recommendations.low_priority_task.time_allocation}</Text>
                  </View>
                )}

                {selectedAnalysis.ai_analysis.structured_response.recommended_schedule_sequence && (
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Thứ tự lịch trình đề xuất</Text>
                    {selectedAnalysis.ai_analysis.structured_response.recommended_schedule_sequence.map((schedule, index) => (
                      <View key={index} style={styles.scheduleItem}>
                        <Text style={styles.scheduleTask}>Nhiệm vụ: {schedule.task_id}</Text>
                        <Text style={styles.scheduleTime}>
                          {new Date(schedule.start_datetime).toLocaleString('vi-VN')} - {new Date(schedule.end_datetime).toLocaleString('vi-VN')}
                        </Text>
                        <Text style={styles.scheduleReason}>Ưu tiên: {schedule.priority}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedAnalysis.ai_analysis.structured_response.actionable_improvements && (
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Cải tiến thực tế</Text>
                    {selectedAnalysis.ai_analysis.structured_response.actionable_improvements.map((improvement, index) => (
                      <Text key={index} style={styles.bulletPoint}>• {improvement}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading && analyses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Lịch sử phân tích AI</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải lịch sử phân tích...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lịch sử phân tích AI</Text>
      </View>

      {analyses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có lịch sử phân tích nào</Text>
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={() => router.push('/profile/ai-task-selection')}
          >
            <Text style={styles.analyzeButtonText}>Bắt đầu phân tích</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={analyses}
          renderItem={renderAnalysisItem}
          keyExtractor={(item) => item.analysis_id.toString()}
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() => 
            loading && currentPage < totalPages ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : null
          }
        />
      )}

      {renderDetailModal()}
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.background.tertiary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    ...Typography.body1,
    color: Colors.primary,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.text.secondary,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    ...Typography.h3,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  analyzeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  analyzeButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  list: {
    flex: 1,
    padding: 20,
  },
  analysisCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisType: {
    ...Typography.h4,
    color: Colors.primary,
  },
  date: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  cardContent: {
    marginBottom: 12,
  },
  taskCount: {
    ...Typography.body1,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  duration: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  score: {
    ...Typography.body1,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  model: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...Typography.body2,
    color: Colors.warning,
  },
  loadMoreContainer: {
    padding: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    ...Typography.h3,
    color: Colors.text.secondary,
  },
  modalScrollView: {
    maxHeight: '100%',
  },
  modalSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.primary,
    marginBottom: 8,
  },
  detailText: {
    ...Typography.body1,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  detailContent: {
    ...Typography.body1,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  bulletPoint: {
    ...Typography.body1,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  conflictItem: {
    marginBottom: 12,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
  },
  conflictType: {
    ...Typography.body1,
    color: Colors.danger,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  conflictSuggestion: {
    ...Typography.body2,
    color: Colors.text.primary,
  },
  scheduleItem: {
    marginBottom: 12,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  scheduleTask: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scheduleTime: {
    ...Typography.body2,
    color: Colors.primary,
    marginBottom: 2,
  },
  scheduleReason: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
});