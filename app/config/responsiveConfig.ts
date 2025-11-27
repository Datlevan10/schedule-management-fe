/**
 * Global responsive configuration for the entire app
 * This configuration ensures consistent responsive behavior across all screens
 */

import { Dimensions, Platform } from 'react-native';
import {
  responsiveStyles,
  scale,
  verticalScale,
  moderateScale,
  responsiveFontSize,
  spacing,
  isSmallDevice,
  isLargeDevice,
} from '../utils/responsive';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Apply responsive design to any screen component
 * Usage: const styles = applyResponsiveDesign(yourStyles);
 */
export const applyResponsiveDesign = (styles: any) => {
  const responsiveStyles: any = {};
  
  for (const key in styles) {
    const style = styles[key];
    const newStyle: any = {};
    
    for (const prop in style) {
      const value = style[prop];
      
      // Handle numeric values for common properties
      if (typeof value === 'number') {
        switch (prop) {
          // Font sizes
          case 'fontSize':
            newStyle[prop] = moderateScale(value);
            break;
          
          // Line heights
          case 'lineHeight':
            newStyle[prop] = moderateScale(value);
            break;
            
          // Horizontal dimensions
          case 'width':
          case 'minWidth':
          case 'maxWidth':
          case 'paddingHorizontal':
          case 'paddingLeft':
          case 'paddingRight':
          case 'marginHorizontal':
          case 'marginLeft':
          case 'marginRight':
          case 'borderRadius':
          case 'borderTopLeftRadius':
          case 'borderTopRightRadius':
          case 'borderBottomLeftRadius':
          case 'borderBottomRightRadius':
            newStyle[prop] = scale(value);
            break;
            
          // Vertical dimensions
          case 'height':
          case 'minHeight':
          case 'maxHeight':
          case 'paddingVertical':
          case 'paddingTop':
          case 'paddingBottom':
          case 'marginVertical':
          case 'marginTop':
          case 'marginBottom':
            newStyle[prop] = verticalScale(value);
            break;
            
          // General padding/margin
          case 'padding':
          case 'margin':
            newStyle[prop] = scale(value);
            break;
            
          // Gap for flexbox
          case 'gap':
          case 'rowGap':
          case 'columnGap':
            newStyle[prop] = scale(value);
            break;
            
          // Keep original value for other numeric properties
          default:
            newStyle[prop] = value;
            break;
        }
      } else {
        // Keep non-numeric values as is
        newStyle[prop] = value;
      }
    }
    
    responsiveStyles[key] = newStyle;
  }
  
  return responsiveStyles;
};

/**
 * Screen configuration based on device size
 */
export const screenConfig = {
  // Padding configurations
  padding: {
    screen: isSmallDevice() ? spacing.md : spacing.lg,
    card: isSmallDevice() ? spacing.sm : spacing.md,
    section: isSmallDevice() ? spacing.md : spacing.lg,
    button: isSmallDevice() ? spacing.sm : spacing.md,
  },
  
  // Font size configurations
  fontSize: {
    title: responsiveFontSize['3xl'],
    subtitle: responsiveFontSize['xl'],
    body: responsiveFontSize.base,
    caption: responsiveFontSize.sm,
    button: responsiveFontSize.lg,
  },
  
  // Component size configurations
  componentSizes: {
    buttonHeight: scale(48),
    inputHeight: scale(44),
    avatarSmall: scale(32),
    avatarMedium: scale(48),
    avatarLarge: scale(64),
    iconSmall: scale(16),
    iconMedium: scale(24),
    iconLarge: scale(32),
  },
  
  // Layout configurations
  layout: {
    maxContentWidth: scale(600),
    gridColumns: isSmallDevice() ? 2 : 3,
    cardColumns: isLargeDevice() ? 2 : 1,
  },
  
  // Border radius configurations
  borderRadius: {
    small: scale(4),
    medium: scale(8),
    large: scale(12),
    xlarge: scale(16),
    round: scale(999),
  },
  
  // Shadow configurations
  shadows: {
    small: {
      shadowOffset: { width: 0, height: scale(1) },
      shadowRadius: scale(2),
      shadowOpacity: 0.1,
      elevation: 2,
    },
    medium: {
      shadowOffset: { width: 0, height: scale(2) },
      shadowRadius: scale(4),
      shadowOpacity: 0.15,
      elevation: 4,
    },
    large: {
      shadowOffset: { width: 0, height: scale(4) },
      shadowRadius: scale(8),
      shadowOpacity: 0.2,
      elevation: 6,
    },
  },
};

/**
 * Responsive breakpoints for conditional rendering
 */
export const breakpoints = {
  small: screenWidth < 375,
  medium: screenWidth >= 375 && screenWidth < 414,
  large: screenWidth >= 414 && screenWidth < 768,
  xlarge: screenWidth >= 768,
};

/**
 * Platform-specific configurations
 */
export const platformConfig = {
  ios: Platform.OS === 'ios',
  android: Platform.OS === 'android',
  isTablet: screenWidth >= 768,
  isPhone: screenWidth < 768,
  
  // Status bar height
  statusBarHeight: Platform.select({
    ios: screenHeight >= 812 ? 44 : 20, // iPhone X and newer have 44px
    android: 0, // Android handles this differently
    default: 0,
  }),
  
  // Bottom tab bar height
  tabBarHeight: Platform.select({
    ios: screenHeight >= 812 ? 84 : 50, // iPhone X and newer have taller tab bar
    android: 56,
    default: 50,
  }),
};

/**
 * Export all responsive utilities
 */
export {
  responsiveStyles,
  scale,
  verticalScale,
  moderateScale,
  responsiveFontSize,
  spacing,
  isSmallDevice,
  isLargeDevice,
};

export default {
  applyResponsiveDesign,
  screenConfig,
  breakpoints,
  platformConfig,
};