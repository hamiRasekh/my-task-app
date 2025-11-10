import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing } from '../../theme';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceVariant,
  },
});

export const TaskCardSkeleton: React.FC = () => {
  return (
    <View style={cardStyles.container}>
      <LoadingSkeleton width="60%" height={16} borderRadius={4} />
      <View style={cardStyles.spacer} />
      <LoadingSkeleton width="40%" height={14} borderRadius={4} />
    </View>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  spacer: {
    height: spacing.xs,
  },
});

