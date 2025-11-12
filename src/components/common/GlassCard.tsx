import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: 'light' | 'medium' | 'strong';
  borderGlow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 'medium',
  borderGlow = true,
}) => {
  const getOpacity = () => {
    switch (intensity) {
      case 'light':
        return 0.05;
      case 'medium':
        return 0.1;
      case 'strong':
        return 0.15;
      default:
        return 0.1;
    }
  };

  const getBorderOpacity = () => {
    switch (intensity) {
      case 'light':
        return 0.15;
      case 'medium':
        return 0.3;
      case 'strong':
        return 0.5;
      default:
        return 0.3;
    }
  };

  return (
    <View
      style={[
        styles.container,
        borderGlow && {
          borderColor: `rgba(139, 92, 246, ${getBorderOpacity()})`,
          borderWidth: 1,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[
          `rgba(255, 255, 255, ${getOpacity()})`,
          `rgba(255, 255, 255, ${getOpacity() * 0.5})`,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.glass,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

