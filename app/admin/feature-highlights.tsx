import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminAPI, FeatureHighlight } from '../api/admin.api';
import api from '../api/index';
import { Card } from '../components/common';
import { Colors, Typography } from '../constants';

interface CreateFeatureRequest {
  title: string;
  description: string;
  icon_file?: any;
  icon_url?: string;
  order: number;
  is_active: boolean;
}

export default function FeatureHighlightsScreen() {
  const [features, setFeatures] = useState<FeatureHighlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureHighlight | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateFeatureRequest>({
    title: '',
    description: '',
    order: 1,
    is_active: true,
  });

  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getFeatureHighlights();
      if (response.status === 'success') {
        setFeatures(response.data);
      }
    } catch (error) {
      console.error('Error loading features:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách tính năng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Thông báo', 'Cần quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('order', formData.order.toString());
      formDataToSend.append('is_active', formData.is_active ? 'true' : 'false');

      if (selectedImage) {
        formDataToSend.append('icon_file', {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: 'icon.jpg',
        } as any);
      } else if (formData.icon_url) {
        formDataToSend.append('icon_url', formData.icon_url);
      }

      let response;
      if (editingFeature) {
        // Use PUT method with _method override for Laravel
        formDataToSend.append('_method', 'PUT');
        response = await api.post(`/feature-highlights/${editingFeature.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await api.post('/feature-highlights', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      console.log('💾 Feature save response:', response.data);
      
      if (response.data.success || response.data.status === 'success' || response.status === 200) {
        const successMessage = editingFeature 
          ? 'Tính năng đã được cập nhật thành công!' 
          : 'Tính năng mới đã được tạo thành công!';
          
        Alert.alert('Thành công', successMessage, [
          {
            text: 'OK',
            onPress: () => {
              handleCloseModal();
              loadFeatures();
            }
          }
        ]);
      } else {
        Alert.alert('Lỗi', 'Không thể lưu tính năng. Vui lòng thử lại.');
      }
    } catch (error: any) {
      console.error('Error saving feature:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể lưu tính năng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (feature: FeatureHighlight) => {
    setEditingFeature(feature);
    setFormData({
      title: feature.title,
      description: feature.description,
      order: feature.order,
      is_active: feature.is_active,
      icon_url: feature.icon_url || '',
    });
    setSelectedImage(null);
    setModalVisible(true);
  };

  const handleDelete = (feature: FeatureHighlight) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa tính năng "${feature.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.delete(`/feature-highlights/${feature.id}`);
              console.log('🗑️ Feature delete response:', response.data);
              
              if (response.data.success || response.data.status === 'success' || response.status === 200) {
                Alert.alert('Thành công', `Tính năng "${feature.title}" đã được xóa thành công!`, [
                  {
                    text: 'OK',
                    onPress: () => loadFeatures()
                  }
                ]);
              } else {
                Alert.alert('Lỗi', 'Không thể xóa tính năng. Vui lòng thử lại.');
              }
            } catch (error: any) {
              console.error('Error deleting feature:', error);
              Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xóa tính năng');
            }
          },
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingFeature(null);
    setFormData({
      title: '',
      description: '',
      order: 1,
      is_active: true,
    });
    setSelectedImage(null);
  };

  const renderFeature = ({ item }: { item: FeatureHighlight }) => (
    <Card style={styles.featureCard}>
      <View style={styles.featureHeader}>
        {item.icon_url ? (
          <Image source={{ uri: item.icon_url }} style={styles.featureIcon} />
        ) : (
          <View style={styles.placeholderIcon}>
            <Text style={styles.placeholderText}>?</Text>
          </View>
        )}

        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>{item.title}</Text>
          <Text style={styles.featureDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.featureMeta}>
            <Text style={styles.orderText}>Vị trí Slide: {item.order}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.is_active ? Colors.success + '20' : Colors.text.tertiary + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: item.is_active ? Colors.success : Colors.text.tertiary }
              ]}>
                {item.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.featureActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.editButtonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={features}
        renderItem={renderFeature}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadFeatures} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có tính năng nổi bật nào</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingFeature ? 'Chỉnh sửa tính năng' : 'Thêm tính năng mới'}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Tiêu đề *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Nhập tiêu đề tính năng"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Mô tả *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Nhập mô tả tính năng"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Icon</Text>
                <View style={styles.iconOptions}>
                  <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePicker}>
                    <Text style={styles.imagePickerText}>
                      {selectedImage ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                    </Text>
                  </TouchableOpacity>

                  {!selectedImage && (
                    <TextInput
                      style={[styles.input, styles.urlInput]}
                      value={formData.icon_url}
                      onChangeText={(text) => setFormData({ ...formData, icon_url: text })}
                      placeholder="Hoặc nhập URL icon"
                    />
                  )}
                </View>

                {(selectedImage || formData.icon_url) && (
                  <Image
                    source={{
                      uri: selectedImage?.uri || formData.icon_url
                    }}
                    style={styles.previewImage}
                  />
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Thứ tự hiển thị</Text>
                <TextInput
                  style={styles.input}
                  value={formData.order.toString()}
                  onChangeText={(text) => {
                    const order = parseInt(text) || 1;
                    setFormData({ ...formData, order });
                  }}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.switchContainer}>
                  <Text style={styles.label}>Kích hoạt</Text>
                  <Switch
                    value={formData.is_active}
                    onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                    trackColor={{ false: Colors.border.light, true: Colors.primary }}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}
                  disabled={submitting}
                >
                  <Text style={styles.saveButtonText}>
                    {submitting ? 'Đang lưu...' : 'Lưu'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  featureCard: {
    marginBottom: 16,
    padding: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeholderText: {
    fontSize: 24,
    color: Colors.text.tertiary,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  featureMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
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
  featureActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  editButtonText: {
    ...Typography.body2,
    color: Colors.white,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: Colors.danger,
  },
  deleteButtonText: {
    ...Typography.body2,
    color: Colors.white,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    ...Typography.body1,
    color: Colors.text.tertiary,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: Colors.white,
    lineHeight: 32,
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
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 12,
    ...Typography.body1,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  iconOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  imagePickerButton: {
    backgroundColor: Colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  imagePickerText: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
  },
  urlInput: {
    flex: 1,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background.secondary,
  },
  cancelButtonText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    ...Typography.body2,
    color: Colors.white,
    fontWeight: '600',
  },
});