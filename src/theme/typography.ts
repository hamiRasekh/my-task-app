// Typography configuration
import { Platform } from 'react-native';

export const typography = {
  // Font families
  fontFamily: {
    regular: 'Vazir',
    medium: 'Vazir-Medium',
    bold: 'Vazir-Bold',
    // English fonts for app name - using system fonts with fallback
    english: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      default: 'System',
    }) || 'System',
    englishBold: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      default: 'System',
    }) || 'System',
    englishMedium: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      default: 'System',
    }) || 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Line heights
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },
  
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
};

export type Typography = typeof typography;
