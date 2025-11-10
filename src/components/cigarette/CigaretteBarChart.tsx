import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { colors, typography, spacing } from '../../theme';
import { CigaretteReport } from '../../types/cigarette.types';

interface CigaretteBarChartProps {
  data: CigaretteReport[];
  height?: number;
}

const screenWidth = Dimensions.get('window').width;

export const CigaretteBarChart: React.FC<CigaretteBarChartProps> = ({
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
    value: item.count,
    label: `${index + 1}`,
    frontColor: item.count > item.limit ? colors.error : colors.primary,
    topLabelComponent: () => (
      <Text style={styles.topLabel}>{item.count}</Text>
    ),
  }));

  const maxValue = Math.max(...data.map(d => d.count), 10);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>مصرف ماهانه</Text>
      <BarChart
        data={chartData}
        width={screenWidth - spacing.xl * 2}
        height={height}
        barWidth={20}
        spacing={8}
        roundedTop
        roundedBottom
        hideRules
        xAxisThickness={1}
        xAxisColor={colors.border}
        yAxisThickness={1}
        yAxisColor={colors.border}
        yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
        maxValue={maxValue + 2}
        noOfSections={5}
        yAxisLabelWidth={40}
        showYAxisIndices
        yAxisIndicesColor={colors.border}
        yAxisIndicesHeight={4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
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
  topLabel: {
    fontSize: 10,
    color: colors.text,
    fontFamily: typography.fontFamily.medium,
  },
});
