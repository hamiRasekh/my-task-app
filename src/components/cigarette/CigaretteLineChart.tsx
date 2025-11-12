import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { colors, typography, spacing } from '../../theme';
import { CigaretteReport } from '../../types/cigarette.types';

interface CigaretteLineChartProps {
  data: CigaretteReport[];
  height?: number;
}

const screenWidth = Dimensions.get('window').width;

export const CigaretteLineChart: React.FC<CigaretteLineChartProps> = ({
  data,
  height = 200,
}) => {
  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noDataText}>داده‌ای برای نمایش وجود ندارد</Text>
      </View>
    );
  }

  const chartData = data.map((item, index) => ({
    value: item.count || 0,
    label: `${index + 1}`,
  }));

  const maxValue = Math.max(...data.map(d => d.count || 0), 10);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>روند مصرف روزانه</Text>
      <LineChart
        data={chartData}
        width={screenWidth - spacing.xl * 2}
        height={height}
        spacing={(screenWidth - spacing.xl * 2) / (data.length + 1)}
        thickness={2}
        color={colors.primary}
        hideRules
        hideYAxisText={false}
        yAxisColor={colors.glassBorder}
        xAxisColor={colors.glassBorder}
        yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
        maxValue={maxValue + 2}
        noOfSections={5}
        yAxisLabelWidth={40}
        showYAxisIndices
        yAxisIndicesColor={colors.glassBorder}
        curved
        areaChart
        startFillColor={colors.primary + '40'}
        endFillColor={colors.primary + '10'}
        startOpacity={0.4}
        endOpacity={0.1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
