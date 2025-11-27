import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../constants';
import {
  scale,
  verticalScale,
  moderateScale,
  responsiveFontSize,
  spacing,
  getSafeAreaInsets,
  isSmallDevice,
  isLargeDevice,
  wp,
  hp,
} from './responsive';

const safeAreaInsets = getSafeAreaInsets();

/**
 * Common responsive styles that can be reused across all screens
 */
export const responsiveStyles = {
  // Container styles
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  scrollContent: {
    flexGrow: 1,
  },
  
  contentPadding: {
    paddingHorizontal: isSmallDevice() ? spacing.md : spacing.lg,
  },
  
  // Header styles  
  header: {
    paddingHorizontal: isSmallDevice() ? spacing.md : spacing.lg,
    paddingTop: safeAreaInsets.top + verticalScale(20),
    paddingBottom: verticalScale(20),
  },
  
  // Typography responsive styles
  h1: {
    fontSize: responsiveFontSize['4xl'],
    fontWeight: Typography.h1.fontWeight,
    lineHeight: moderateScale(40),
    letterSpacing: -0.5,
    color: Colors.text.primary,
  },
  
  h2: {
    fontSize: responsiveFontSize['3xl'],
    fontWeight: Typography.h2.fontWeight,
    lineHeight: moderateScale(32),
    letterSpacing: -0.3,
    color: Colors.text.primary,
  },
  
  h3: {
    fontSize: responsiveFontSize['2xl'],
    fontWeight: Typography.h3.fontWeight,
    lineHeight: moderateScale(28),
    letterSpacing: -0.2,
    color: Colors.text.primary,
  },
  
  h4: {
    fontSize: responsiveFontSize.xl,
    fontWeight: Typography.h4.fontWeight,
    lineHeight: moderateScale(24),
    letterSpacing: -0.1,
    color: Colors.text.primary,
  },
  
  body1: {
    fontSize: responsiveFontSize.lg,
    fontWeight: Typography.body1.fontWeight,
    lineHeight: moderateScale(24),
    color: Colors.text.primary,
  },
  
  body2: {
    fontSize: responsiveFontSize.base,
    fontWeight: Typography.body2.fontWeight,
    lineHeight: moderateScale(20),
    color: Colors.text.secondary,
  },
  
  caption: {
    fontSize: responsiveFontSize.sm,
    fontWeight: Typography.caption.fontWeight,
    lineHeight: moderateScale(16),
    color: Colors.text.tertiary,
  },
  
  // Button styles
  button: {
    height: scale(48),
    borderRadius: scale(8),
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  buttonSmall: {
    height: scale(36),
    paddingHorizontal: spacing.sm,
  },
  
  buttonLarge: {
    height: scale(56),
    paddingHorizontal: spacing.lg,
  },
  
  buttonText: {
    fontSize: responsiveFontSize.lg,
    fontWeight: '600',
  },
  
  // Card styles
  card: {
    borderRadius: scale(12),
    padding: spacing.md,
    backgroundColor: Colors.background.primary,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 2,
  },
  
  cardCompact: {
    padding: spacing.sm,
  },
  
  cardLarge: {
    padding: spacing.lg,
  },
  
  // Input styles
  input: {
    height: scale(44),
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    fontSize: responsiveFontSize.base,
  },
  
  inputMultiline: {
    minHeight: verticalScale(80),
    paddingVertical: scale(12),
    textAlignVertical: 'top',
  },
  
  // Spacing
  marginBottomXS: {
    marginBottom: verticalScale(4),
  },
  
  marginBottomSM: {
    marginBottom: verticalScale(8),
  },
  
  marginBottomMD: {
    marginBottom: verticalScale(16),
  },
  
  marginBottomLG: {
    marginBottom: verticalScale(24),
  },
  
  marginBottomXL: {
    marginBottom: verticalScale(32),
  },
  
  marginBottomXXL: {
    marginBottom: verticalScale(40),
  },
  
  paddingHorizontal: {
    paddingHorizontal: isSmallDevice() ? spacing.md : spacing.lg,
  },
  
  paddingVertical: {
    paddingVertical: isSmallDevice() ? spacing.sm : spacing.md,
  },
  
  // Grid layouts
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  grid2: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  grid3: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  
  gridItem2: {
    flex: 1,
    maxWidth: wp(48),
  },
  
  gridItem3: {
    flex: 1,
    maxWidth: wp(31),
  },
  
  // Common screen sections
  section: {
    paddingHorizontal: isSmallDevice() ? spacing.md : spacing.lg,
    paddingVertical: spacing.md,
  },
  
  sectionTitle: {
    fontSize: responsiveFontSize.xl,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: verticalScale(12),
  },
  
  // Loading and error states
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  
  loadingText: {
    fontSize: responsiveFontSize.base,
    color: Colors.text.secondary,
    marginTop: verticalScale(12),
  },
  
  errorText: {
    fontSize: responsiveFontSize.base,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  
  modalContent: {
    width: '100%',
    maxWidth: scale(400),
    backgroundColor: Colors.background.primary,
    borderRadius: scale(16),
    padding: spacing.lg,
  },
  
  // List styles
  listItem: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  
  listItemCompact: {
    paddingVertical: verticalScale(8),
  },
  
  // Icon sizes
  iconSmall: {
    width: scale(16),
    height: scale(16),
    fontSize: moderateScale(16),
  },
  
  iconMedium: {
    width: scale(24),
    height: scale(24),
    fontSize: moderateScale(24),
  },
  
  iconLarge: {
    width: scale(32),
    height: scale(32),
    fontSize: moderateScale(32),
  },
  
  iconXLarge: {
    width: scale(40),
    height: scale(40),
    fontSize: moderateScale(40),
  },
  
  // Avatar sizes
  avatarSmall: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
  },
  
  avatarMedium: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
  },
  
  avatarLarge: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
  },
  
  avatarXLarge: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
  },
  
  // Safe area padding
  safeAreaTop: {
    paddingTop: safeAreaInsets.top,
  },
  
  safeAreaBottom: {
    paddingBottom: safeAreaInsets.bottom,
  },
  
  // Shadows
  shadow: {
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 2,
  },
  
  shadowMedium: {
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.15,
    shadowRadius: scale(8),
    elevation: 4,
  },
  
  shadowLarge: {
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.2,
    shadowRadius: scale(12),
    elevation: 6,
  },
};

/**
 * Helper function to create responsive StyleSheet
 */
export const createResponsiveStyleSheet = <T extends StyleSheet.NamedStyles<T>>(
  styles: T | StyleSheet.NamedStyles<T>
): T => {
  return StyleSheet.create(styles) as T;
};

/**
 * Helper to apply responsive font size to any text style
 */
export const responsiveText = (size: keyof typeof responsiveFontSize) => ({
  fontSize: responsiveFontSize[size],
  lineHeight: moderateScale(responsiveFontSize[size] * 1.4),
});

/**
 * Helper to create responsive padding/margin
 */
export const responsiveSpacing = {
  padding: (size: keyof typeof spacing) => ({
    padding: spacing[size],
  }),
  
  paddingHorizontal: (size: keyof typeof spacing) => ({
    paddingHorizontal: spacing[size],
  }),
  
  paddingVertical: (size: keyof typeof spacing) => ({
    paddingVertical: spacing[size],
  }),
  
  margin: (size: keyof typeof spacing) => ({
    margin: spacing[size],
  }),
  
  marginHorizontal: (size: keyof typeof spacing) => ({
    marginHorizontal: spacing[size],
  }),
  
  marginVertical: (size: keyof typeof spacing) => ({
    marginVertical: spacing[size],
  }),
};

export default responsiveStyles;