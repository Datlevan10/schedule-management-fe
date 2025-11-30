import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminAPI, WelcomeScreen } from '../api/admin.api';
import { API_CONFIG } from '../config/api';
import { Colors, Typography } from '../constants';

export default function WelcomeScreensScreen() {
  const [welcomeScreens, setWelcomeScreens] = useState<WelcomeScreen[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingScreen, setEditingScreen] = useState<WelcomeScreen | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    background_type: 'image' as 'image' | 'color' | 'gradient',
    background_value: '',
    duration: 5,
    is_active: true,
  });

  useEffect(() => {
    loadWelcomeScreens();
  }, []);

  const loadWelcomeScreens = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getWelcomeScreens();
      if (response.status === 'success') {
        // Convert single screen response to array for consistency
        const screens = Array.isArray(response.data) ? response.data : [response.data];
        setWelcomeScreens(screens);
      }
    } catch (error) {
      console.error('Error loading welcome screens:', error);
      Alert.alert('Error', 'Failed to load welcome screens');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWelcomeScreens();
    setRefreshing(false);
  }, [loadWelcomeScreens]);

  const openCreateModal = () => {
    setEditingScreen(null);
    setFormData({
      title: '',
      subtitle: '',
      background_type: 'image',
      background_value: '',
      duration: 5,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (screen: WelcomeScreen) => {
    setEditingScreen(screen);
    setFormData({
      title: screen.title,
      subtitle: screen.subtitle,
      background_type: screen.background_type,
      background_value: screen.background_value,
      duration: screen.duration,
      is_active: screen.is_active,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingScreen(null);
  };

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Access to photo library is required');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      setFormData({ ...formData, background_value: pickerResult.assets[0].uri });
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.title.trim() || !formData.subtitle.trim()) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      let response;
      if (editingScreen) {
        response = await AdminAPI.updateWelcomeScreen(editingScreen.id, formData);
      } else {
        response = await AdminAPI.createWelcomeScreen(formData);
      }

      if (response.status === 'success') {
        Alert.alert('Success', `Welcome screen ${editingScreen ? 'updated' : 'created'} successfully`);
        closeModal();
        loadWelcomeScreens();
      }
    } catch (error: any) {
      console.error('Error saving welcome screen:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save welcome screen');
    }
  };

  const handleToggleActive = async (screen: WelcomeScreen) => {
    try {
      const response = await AdminAPI.updateWelcomeScreen(screen.id, {
        is_active: !screen.is_active,
      });

      if (response.status === 'success') {
        loadWelcomeScreens();
      }
    } catch (error) {
      console.error('Error updating screen status:', error);
      Alert.alert('Error', 'Failed to update screen status');
    }
  };

  const handleDelete = (screen: WelcomeScreen) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete welcome screen "${screen.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await AdminAPI.deleteWelcomeScreen(screen.id);
              if (response.status === 'success') {
                Alert.alert('Success', 'Welcome screen deleted successfully');
                loadWelcomeScreens();
              }
            } catch (error) {
              console.error('Error deleting welcome screen:', error);
              Alert.alert('Error', 'Failed to delete welcome screen');
            }
          },
        },
      ]
    );
  };

  const renderScreenItem = ({ item }: { item: WelcomeScreen }) => (
    <View style={styles.screenCard}>
      <View style={styles.screenContent}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, item.is_active ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={[styles.statusText, item.is_active ? styles.activeText : styles.inactiveText]}>
              {item.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
            </Text>
          </View>
        </View>

        <Text style={styles.screenSubtitle}>{item.subtitle}</Text>

        <View style={styles.screenMeta}>
          <Text style={styles.metaText}>Kiểu: {item.background_type}</Text>
          <Text style={styles.metaText}>Khoảng thời gian: {item.duration}s</Text>
        </View>

        {item.background_type === 'image' && item.background_value && (
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: (() => {
                  const imageUrl = API_CONFIG.getImageUrl(item.background_value);
                  console.log('🖼️ Loading welcome screen image:', {
                    originalPath: item.background_value,
                    fullUrl: imageUrl,
                    baseUrl: API_CONFIG.BASE_URL,
                    storageUrl: API_CONFIG.STORAGE_URL
                  });
                  return imageUrl;
                })()
              }}
              style={styles.previewImage}
              resizeMode="cover"
              onError={(error) => {
                console.error('❌ Failed to load welcome screen image:', {
                  originalPath: item.background_value,
                  fullUrl: API_CONFIG.getImageUrl(item.background_value),
                  error
                });
              }}
              onLoad={() => {
                console.log('✅ Welcome screen image loaded successfully:', item.background_value);
              }}
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageLabel}>Xem trước</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.screenActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="create-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={[styles.actionButton, item.is_active ? styles.deactivateButton : styles.activateButton]}
          onPress={() => handleToggleActive(item)}
        >
          <Ionicons name={item.is_active ? 'pause-outline' : 'play-outline'} size={20} color={Colors.white} />
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Quản lý màn hình chào mừng</Text>
          <Text style={styles.subtitle}>{welcomeScreens.length} màn hình đã được cấu hình</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={welcomeScreens}
        renderItem={renderScreenItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingScreen ? 'Chỉnh sửa màn hình chào mừng' : 'Tạo màn hình chào mừng'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tiêu đề *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Nhập tiêu đề màn hình chào mừng"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phụ đề *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.subtitle}
                  onChangeText={(text) => setFormData({ ...formData, subtitle: text })}
                  placeholder="Nhập phụ đề"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Loại nền</Text>
                <View style={styles.radioGroup}>
                  {(['image', 'color', 'gradient'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={styles.radioOption}
                      onPress={() => setFormData({ ...formData, background_type: type })}
                    >
                      <Ionicons
                        name={formData.background_type === type ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={formData.background_type === type ? Colors.primary : Colors.text.secondary}
                      />
                      <Text style={styles.radioLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {formData.background_type === 'image' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Hình nền</Text>
                  <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
                    <Ionicons name="image-outline" size={24} color={Colors.primary} />
                    <Text style={styles.imageButtonText}>Chọn hình ảnh</Text>
                  </TouchableOpacity>
                  {formData.background_value && (
                    <View style={styles.modalImageContainer}>
                      <Image
                        source={{
                          uri: formData.background_value.startsWith('http')
                            ? formData.background_value
                            : API_CONFIG.getImageUrl(formData.background_value)
                        }}
                        style={styles.modalPreviewImage}
                        resizeMode="cover"
                        onError={(error) => {
                          console.warn('Failed to load preview image:', formData.background_value, error);
                        }}
                      />
                      <View style={styles.modalImageOverlay}>
                        <Text style={styles.imageLabel}>Xem trước</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Thời lượng (giây)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.duration.toString()}
                  onChangeText={(text) => setFormData({ ...formData, duration: parseInt(text) || 5 })}
                  keyboardType="numeric"
                  placeholder="5"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Màn hình hoạt động</Text>
                  <Switch
                    value={formData.is_active}
                    onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                    trackColor={{ false: Colors.border.medium, true: Colors.primary + '40' }}
                    thumbColor={formData.is_active ? Colors.primary : Colors.white}
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingScreen ? 'Cập nhật' : 'Tạo'}
                </Text>
              </TouchableOpacity>
            </View>
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
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  screenCard: {
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
  screenContent: {
    marginBottom: 12,
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  screenTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    flex: 1,
  },
  screenSubtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  screenMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  imageContainer: {
    position: 'relative',
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  imageLabel: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  modalImageContainer: {
    position: 'relative',
    marginTop: 12,
  },
  modalPreviewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  modalImageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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
  screenActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: Colors.primary,
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
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    ...Typography.body1,
    color: Colors.text.primary,
    marginBottom: 8,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.background.secondary,
    ...Typography.body1,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioLabel: {
    ...Typography.body2,
    color: Colors.text.primary,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  imageButtonText: {
    ...Typography.body1,
    color: Colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    ...Typography.body1,
    color: Colors.text.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  cancelButtonText: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    ...Typography.body1,
    color: Colors.white,
    fontWeight: '600',
  },
});