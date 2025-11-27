import { Dimensions, PixelRatio, Platform } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Base dimensions for responsive scaling (iPhone 8 - 375x667)
const baseWidth = 375;
const baseHeight = 667;

// iPhone 7 Plus dimensions: 414x736
export const DEVICE_SIZES = {
  // Small phones (iPhone SE, iPhone 5s)
  SMALL_PHONE: {
    width: 320,
    height: 568,
  },
  // Medium phones (iPhone 6/7/8)
  MEDIUM_PHONE: {
    width: 375,
    height: 667,
  },
  // Large phones (iPhone 6+/7+/8+)
  LARGE_PHONE: {
    width: 414,
    height: 736,
  },
  // Extra large phones (iPhone X and newer)
  XLARGE_PHONE: {
    width: 390,
    height: 844,
  },
};

// Device type detection
export const isSmallDevice = () =>
  screenWidth <= DEVICE_SIZES.SMALL_PHONE.width;
export const isMediumDevice = () =>
  screenWidth > DEVICE_SIZES.SMALL_PHONE.width &&
  screenWidth <= DEVICE_SIZES.MEDIUM_PHONE.width;
export const isLargeDevice = () =>
  screenWidth > DEVICE_SIZES.MEDIUM_PHONE.width &&
  screenWidth <= DEVICE_SIZES.LARGE_PHONE.width;
export const isXLargeDevice = () =>
  screenWidth > DEVICE_SIZES.LARGE_PHONE.width;

// iPhone 7 Plus specific detection
export const isIPhone7Plus = () =>
  screenWidth === DEVICE_SIZES.LARGE_PHONE.width &&
  screenHeight === DEVICE_SIZES.LARGE_PHONE.height;

// Responsive scaling functions
export const scale = (size: number): number => {
  const ratio = screenWidth / baseWidth;
  return Math.round(PixelRatio.roundToNearestPixel(size * ratio));
};

export const verticalScale = (size: number): number => {
  const ratio = screenHeight / baseHeight;
  return Math.round(PixelRatio.roundToNearestPixel(size * ratio));
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
  return Math.round(size + (scale(size) - size) * factor);
};

// Responsive dimension helpers
export const wp = (percentage: number): number => {
  return Math.round((screenWidth * percentage) / 100);
};

export const hp = (percentage: number): number => {
  return Math.round((screenHeight * percentage) / 100);
};

// Responsive spacing
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(40),
};

// Responsive font sizes specifically optimized for mobile
export const responsiveFontSize = {
  xs: moderateScale(10),
  sm: moderateScale(12),
  base: moderateScale(14),
  lg: moderateScale(16),
  xl: moderateScale(18),
  "2xl": moderateScale(20),
  "3xl": moderateScale(24),
  "4xl": moderateScale(28), // Reduced from 32 for mobile
  "5xl": moderateScale(32), // Reduced from 40 for mobile
  "6xl": moderateScale(36), // Reduced from 48 for mobile
};

// Device-specific adjustments
export const deviceSpecific = {
  paddingHorizontal: () => {
    if (isSmallDevice()) return spacing.sm;
    if (isMediumDevice()) return spacing.md;
    if (isLargeDevice()) return spacing.lg;
    return spacing.xl;
  },

  cardMargin: () => {
    if (isSmallDevice()) return spacing.sm;
    if (isLargeDevice() || isXLargeDevice()) return spacing.lg;
    return spacing.md;
  },

  headerPadding: () => {
    if (isSmallDevice()) return spacing.md;
    if (isLargeDevice() || isXLargeDevice()) return spacing.xxl;
    return spacing.lg;
  },

  avatarSize: () => {
    if (isSmallDevice()) return scale(60);
    if (isLargeDevice() || isXLargeDevice()) return scale(90);
    return scale(80);
  },

  buttonHeight: () => {
    if (isSmallDevice()) return scale(40);
    if (isLargeDevice() || isXLargeDevice()) return scale(48);
    return scale(44);
  },

  // iPhone 7 Plus specific adjustments
  iPhone7PlusAdjustments: () => ({
    profileCardPadding: spacing.lg,
    infoRowSpacing: scale(14),
    sectionSpacing: spacing.lg,
    menuItemHeight: scale(50),
  }),
};

// Responsive breakpoints for specific layouts
export const breakpoints = {
  isCompact: () => screenWidth < 414, // Smaller than iPhone 7 Plus
  isRegular: () => screenWidth >= 414, // iPhone 7 Plus and larger
};

// Safe area helpers
export const getSafeAreaInsets = () => {
  // Basic safe area calculation for older devices
  const topInset = Platform.OS === "ios" && screenHeight >= 812 ? 44 : 20;
  const bottomInset = Platform.OS === "ios" && screenHeight >= 812 ? 34 : 0;

  return {
    top: topInset,
    bottom: bottomInset,
    left: 0,
    right: 0,
  };
};

// Layout helpers for responsive design
export const layoutHelpers = {
  getProfileLayoutProps: () => {
    const isLarge = isLargeDevice() || isXLargeDevice();

    return {
      containerPadding: deviceSpecific.paddingHorizontal(),
      cardMargin: deviceSpecific.cardMargin(),
      headerSpacing: deviceSpecific.headerPadding(),
      avatarSize: deviceSpecific.avatarSize(),
      profileInfoWidth: isLarge ? wp(60) : wp(65),
      menuItemPadding: isLarge ? spacing.lg : spacing.md,
      sectionSpacing: isLarge ? spacing.xl : spacing.lg,
    };
  },

  getCardLayoutProps: () => ({
    borderRadius: scale(12),
    padding: deviceSpecific.cardMargin(),
    marginHorizontal: deviceSpecific.cardMargin(),
    shadowRadius: scale(3),
    elevation: Platform.OS === "android" ? scale(2) : 2,
  }),

  getButtonLayoutProps: () => ({
    borderRadius: scale(8),
    height: deviceSpecific.buttonHeight(),
    paddingHorizontal: spacing.md,
  }),
};

export default {
  scale,
  verticalScale,
  moderateScale,
  wp,
  hp,
  spacing,
  responsiveFontSize,
  deviceSpecific,
  layoutHelpers,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isXLargeDevice,
  isIPhone7Plus,
  breakpoints,
  getSafeAreaInsets,
  DEVICE_SIZES,
};
