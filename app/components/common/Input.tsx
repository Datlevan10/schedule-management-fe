import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { scale, moderateScale, verticalScale } from '../../utils/responsive';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoComplete?: 'email' | 'password' | 'name' | 'off';
  textContentType?: 'emailAddress' | 'password' | 'name' | 'username';
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = memo(({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  autoComplete = 'off',
  textContentType,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Memoize handlers to prevent recreation on every render
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleRightIconPress = useCallback(() => {
    if (onRightIconPress) {
      onRightIconPress();
    }
  }, [onRightIconPress]);

  const containerStyle = [
    styles.container,
    isFocused && styles.focused,
    error && styles.error,
    disabled && styles.disabled,
    style,
  ];

  const textInputStyle = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    multiline && styles.multilineInput,
    inputStyle,
  ];

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={containerStyle}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={textInputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          textContentType={textContentType}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          clearButtonMode="while-editing"
          returnKeyType="next"
          blurOnSubmit={false}
          accessible={true}
          accessibilityLabel={label || placeholder}
          importantForAutofill="yes"
          spellCheck={false}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={handleRightIconPress}
            disabled={!onRightIconPress}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

// Display name for debugging
Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: '#000000',
    marginBottom: verticalScale(8),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: scale(8),
    backgroundColor: '#FFFFFF',
    minHeight: scale(44),
  },
  focused: {
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: scale(4),
    elevation: 2,
  },
  error: {
    borderColor: '#FF3B30',
  },
  disabled: {
    backgroundColor: '#F2F2F7',
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    color: '#000000',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    zIndex: 1,
  },
  inputWithLeftIcon: {
    paddingLeft: scale(8),
  },
  inputWithRightIcon: {
    paddingRight: scale(8),
  },
  multilineInput: {
    minHeight: verticalScale(80),
    textAlignVertical: 'top',
  },
  leftIcon: {
    paddingLeft: scale(12),
    paddingRight: scale(8),
  },
  rightIcon: {
    paddingRight: scale(12),
    paddingLeft: scale(8),
  },
  errorText: {
    fontSize: moderateScale(14),
    color: '#FF3B30',
    marginTop: verticalScale(4),
  },
});