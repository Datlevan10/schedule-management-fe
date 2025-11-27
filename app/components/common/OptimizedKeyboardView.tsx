import React, { memo, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface OptimizedKeyboardViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  enableScrollView?: boolean;
  extraScrollHeight?: number;
  keyboardVerticalOffset?: number;
}

/**
 * Optimized KeyboardAvoidingView component that prevents performance issues
 * with input lag and excessive re-renders on iOS devices.
 */
export const OptimizedKeyboardView: React.FC<OptimizedKeyboardViewProps> = memo(({
  children,
  style,
  contentContainerStyle,
  enableScrollView = true,
  extraScrollHeight = 20,
  keyboardVerticalOffset,
}) => {
  // Memoize styles to prevent recreation
  const containerStyle = useMemo(() => [
    styles.container,
    style,
  ], [style]);

  const scrollContentStyle = useMemo(() => [
    styles.scrollContent,
    contentContainerStyle,
  ], [contentContainerStyle]);

  // Calculate keyboard offset based on platform
  const calculatedOffset = useMemo(() => {
    if (keyboardVerticalOffset !== undefined) {
      return keyboardVerticalOffset;
    }
    return Platform.OS === 'ios' ? 0 : extraScrollHeight;
  }, [keyboardVerticalOffset, extraScrollHeight]);

  // Optimized scroll view props
  const scrollViewProps = useMemo(() => ({
    contentContainerStyle: scrollContentStyle,
    keyboardShouldPersistTaps: 'handled' as const,
    showsVerticalScrollIndicator: false,
    bounces: false,
    overScrollMode: 'never' as const,
    nestedScrollEnabled: false,
    // Optimize for performance
    removeClippedSubviews: Platform.OS === 'android',
    scrollEventThrottle: 16,
  }), [scrollContentStyle]);

  const content = enableScrollView ? (
    <ScrollView {...scrollViewProps}>
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <KeyboardAvoidingView
      style={containerStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={calculatedOffset}
    >
      {content}
    </KeyboardAvoidingView>
  );
});

OptimizedKeyboardView.displayName = 'OptimizedKeyboardView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default OptimizedKeyboardView;