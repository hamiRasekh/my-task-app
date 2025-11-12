import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
  animated = true,
}) => {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      progress.value = withRepeat(
        withTiming(1, { duration: 10000 }),
        -1,
        true
      );
    }
  }, [animated]);

  const getGradientColors = () => {
    if (animated) {
      return [
        colors.backgroundGradient[0],
        colors.backgroundGradient[1],
        colors.backgroundGradient[2],
        colors.backgroundGradient[1],
        colors.backgroundGradient[0],
      ];
    }
    return colors.backgroundGradient;
  };

  if (animated) {
    return (
      <View style={[styles.container, style]}>
        <AnimatedLinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={colors.backgroundGradient}
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
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

