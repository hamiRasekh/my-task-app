import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme } from 'victory-native';
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
    x: index + 1,
    y: item.count,
    label: item.date,
  }));

  const maxValue = Math.max(...data.map(d => d.count), 10);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>مصرف ماهانه</Text>
      <VictoryChart
        theme={VictoryTheme.material}
        width={screenWidth - spacing.xl * 2}
        height={height}
        padding={{ left: 50, right: 20, top: 20, bottom: 50 }}
        domain={{ y: [0, maxValue + 2] }}
      >
        <VictoryAxis
          style={{
            axis: { stroke: colors.border },
            tickLabels: { fill: colors.textSecondary, fontSize: 10 },
            grid: { stroke: colors.border, strokeDasharray: '4 4' },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: colors.border },
            tickLabels: { fill: colors.textSecondary, fontSize: 10 },
            grid: { stroke: colors.border, strokeDasharray: '4 4' },
          }}
        />
        <VictoryBar
          data={chartData}
          style={{
            data: {
              fill: colors.primary,
              width: 20,
            },
          }}
          cornerRadius={{ top: 4 }}
        />
      </VictoryChart>
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
});

