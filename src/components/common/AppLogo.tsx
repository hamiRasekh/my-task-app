import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showSubtitle?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'medium',
  showSubtitle = false,
}) => {
  const sizeStyles = {
    small: {
      fontSize: typography.fontSize.xl,
      letterSpacing: 3,
    },
    medium: {
      fontSize: typography.fontSize.xxl,
      letterSpacing: 5,
    },
    large: {
      fontSize: typography.fontSize.xxxl,
      letterSpacing: 8,
    },
  };

  const currentSize = sizeStyles[size];

  // Get appropriate font family based on platform
  const getEnglishFont = () => {
    if (Platform.OS === 'web') {
      return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    }
    return 'System';
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.appName,
          {
            fontSize: currentSize.fontSize,
            letterSpacing: currentSize.letterSpacing,
            fontFamily: getEnglishFont(),
          },
        ]}
      >
        Aveno
      </Text>
      {showSubtitle && (
        <Text style={[styles.subtitle, { fontFamily: getEnglishFont() }]}>
          Task & Habit Tracker
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    // Enhanced shadow for better visibility
    ...Platform.select({
      ios: {
        textShadowColor: colors.primary + '50',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
      },
      android: {
        elevation: 2,
        textShadowColor: colors.primary + '50',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
      },
      web: {
        textShadow: `0 2px 8px ${colors.primary}50`,
      },
    }),
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: spacing.xs,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
