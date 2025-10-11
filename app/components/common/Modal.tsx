import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from './Button';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  actions?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    loading?: boolean;
  }[];
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdropPress = true,
  actions,
}) => {
  const modalStyles = getModalStyles(size);

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modal, modalStyles]}>
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  {title && <Text style={styles.title}>{title}</Text>}
                  {showCloseButton && (
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={onClose}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>

              {actions && actions.length > 0 && (
                <View style={styles.actions}>
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      title={action.title}
                      onPress={action.onPress}
                      variant={action.variant || 'primary'}
                      loading={action.loading}
                      style={styles.actionButton}
                    />
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </RNModal>
  );
};

const getModalStyles = (size: string) => {
  switch (size) {
    case 'small':
      return {
        width: Math.min(screenWidth * 0.8, 300),
        maxHeight: screenHeight * 0.4,
      };
    case 'medium':
      return {
        width: Math.min(screenWidth * 0.9, 400),
        maxHeight: screenHeight * 0.7,
      };
    case 'large':
      return {
        width: Math.min(screenWidth * 0.95, 600),
        maxHeight: screenHeight * 0.8,
      };
    case 'fullscreen':
      return {
        width: screenWidth,
        height: screenHeight,
        borderRadius: 0,
      };
    default:
      return {
        width: Math.min(screenWidth * 0.9, 400),
        maxHeight: screenHeight * 0.7,
      };
  }
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '600',
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});