import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminAPI, CustomerReport } from '../api/admin.api';
import { Colors, Typography } from '../constants';

export default function CustomerReportingScreen() {
  const [reports, setReports] = useState<CustomerReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CustomerReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'in_progress'>('all');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getCustomerReports();
      if (response.success) {
        setReports(response.data);
      }
    } catch (error) {
      console.error('Error loading customer reports:', error);
      Alert.alert('Error', 'Failed to load customer reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  }, [loadReports]);

  const handleUpdateStatus = async (reportId: number, status: 'pending' | 'in_progress' | 'resolved') => {
    try {
      const response = await AdminAPI.updateCustomerReport(reportId, { status });
      if (response.success) {
        loadReports();
        Alert.alert('Success', 'Report status updated successfully');
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      Alert.alert('Error', 'Failed to update report status');
    }
  };

  const handleDelete = (report: CustomerReport) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this report?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await AdminAPI.deleteCustomerReport(report.id);
              if (response.success) {
                Alert.alert('Success', 'Report deleted successfully');
                loadReports();
                setShowDetailModal(false);
              }
            } catch (error) {
              console.error('Error deleting report:', error);
              Alert.alert('Error', 'Failed to delete report');
            }
          },
        },
      ]
    );
  };

  const openDetailModal = (report: CustomerReport) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return Colors.warning;
      case 'in_progress':
        return Colors.info;
      case 'resolved':
        return Colors.success;
      default:
        return Colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return Colors.danger;
      case 'medium':
        return Colors.warning;
      case 'low':
        return Colors.success;
      default:
        return Colors.text.secondary;
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.subject.toLowerCase().includes(searchText.toLowerCase()) ||
      report.user_name.toLowerCase().includes(searchText.toLowerCase()) ||
      report.user_email.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const renderFilterButton = (filter: typeof statusFilter, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        statusFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => setStatusFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        statusFilter === filter && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderReportItem = ({ item }: { item: CustomerReport }) => (
    <TouchableOpacity style={styles.reportCard} onPress={() => openDetailModal(item)}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportSubject} numberOfLines={2}>{item.subject}</Text>
        <View style={styles.badges}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
              {item.priority.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.reportDescription} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.reportFooter}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user_name}</Text>
          <Text style={styles.userEmail}>{item.user_email}</Text>
        </View>
        <Text style={styles.reportDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color={Colors.text.secondary} />
      <Text style={styles.emptyText}>No customer reports found</Text>
      <Text style={styles.emptySubtext}>Reports will appear here when customers submit them</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('pending', 'Pending')}
        {renderFilterButton('in_progress', 'In Progress')}
        {renderFilterButton('resolved', 'Resolved')}
      </View>

      <FlatList
        data={filteredReports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={[styles.listContent, filteredReports.length === 0 && styles.listContentEmpty]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReport && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Report Details</Text>
                  <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                    <Ionicons name="close" size={24} color={Colors.text.primary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Subject</Text>
                    <Text style={styles.detailValue}>{selectedReport.subject}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailValue}>{selectedReport.description}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Customer</Text>
                    <Text style={styles.detailValue}>{selectedReport.user_name}</Text>
                    <Text style={styles.detailSubValue}>{selectedReport.user_email}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Priority</Text>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedReport.priority) + '20' }]}>
                        <Text style={[styles.priorityText, { color: getPriorityColor(selectedReport.priority) }]}>
                          {selectedReport.priority.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Current Status</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReport.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(selectedReport.status) }]}>
                          {getStatusText(selectedReport.status)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Created</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedReport.created_at).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Text style={styles.actionsLabel}>Update Status:</Text>
                  <View style={styles.statusActions}>
                    <TouchableOpacity
                      style={[styles.statusButton, styles.pendingButton]}
                      onPress={() => handleUpdateStatus(selectedReport.id, 'pending')}
                    >
                      <Text style={styles.statusButtonText}>Pending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.statusButton, styles.inProgressButton]}
                      onPress={() => handleUpdateStatus(selectedReport.id, 'in_progress')}
                    >
                      <Text style={styles.statusButtonText}>In Progress</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.statusButton, styles.resolvedButton]}
                      onPress={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                    >
                      <Text style={styles.statusButtonText}>Resolved</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(selectedReport)}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.white} />
                    <Text style={styles.deleteButtonText}>Delete Report</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  header: {
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  activeFilterButtonText: {
    color: Colors.white,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  reportCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportSubject: {
    ...Typography.h4,
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  badges: {
    gap: 4,
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  reportDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  userEmail: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  reportDate: {
    ...Typography.caption,
    color: Colors.text.secondary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  detailValue: {
    ...Typography.body1,
    color: Colors.text.primary,
  },
  detailSubValue: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  actionsLabel: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pendingButton: {
    backgroundColor: Colors.warning,
  },
  inProgressButton: {
    backgroundColor: Colors.info,
  },
  resolvedButton: {
    backgroundColor: Colors.success,
  },
  statusButtonText: {
    ...Typography.body2,
    color: Colors.white,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    ...Typography.body1,
    color: Colors.white,
    fontWeight: '600',
  },
});