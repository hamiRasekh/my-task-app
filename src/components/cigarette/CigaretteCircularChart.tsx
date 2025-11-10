import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VictoryPie } from 'victory-native';
import { colors, typography, spacing } from '../../theme';
import { Cigarette } from '../../database/models/Cigarette';

interface CigaretteCircularChartProps {
  cigarette: Cigarette | null;
  size?: number;
}

export const CigaretteCircularChart: React.FC<CigaretteCircularChartProps> = ({
  cigarette,
  size = 200,
}) => {
  if (!cigarette) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Text style={styles.noDataText}>داده‌ای وجود ندارد</Text>
      </View>
    );
  }

  const percentage = cigarette.dailyLimit > 0
    ? (cigarette.count / cigarette.dailyLimit) * 100
    : 0;

  const remaining = Math.max(0, cigarette.dailyLimit - cigarette.count);
  const used = Math.min(cigarette.count, cigarette.dailyLimit);
  const overLimit = Math.max(0, cigarette.count - cigarette.dailyLimit);

  const data: Array<{ x: string; y: number }> = [];
  const colorScale: string[] = [];

  if (used > 0) {
    data.push({ x: 'used', y: used });
    colorScale.push(percentage > 100 ? colors.error : colors.primary);
  }
  
  if (remaining > 0) {
    data.push({ x: 'remaining', y: remaining });
    colorScale.push(colors.surfaceVariant);
  }
  
  if (overLimit > 0) {
    data.push({ x: 'over', y: overLimit });
    colorScale.push(colors.error);
  }

  // If no data, show empty state
  if (data.length === 0) {
    data.push({ x: 'empty', y: 100 });
    colorScale.push(colors.surfaceVariant);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.chartContainer, { width: size, height: size }]}>
        <VictoryPie
          data={data}
          width={size}
          height={size}
          innerRadius={size * 0.3}
          colorScale={colorScale.length > 0 ? colorScale : [colors.surfaceVariant]}
          padAngle={2}
          style={{
            labels: { fill: 'transparent' },
          }}
        />
        <View style={styles.centerLabel}>
          <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
          <Text style={styles.labelText}>
            {cigarette.count} / {cigarette.dailyLimit}
          </Text>
        </View>
      </View>
      {(used > 0 || remaining > 0 || overLimit > 0) && (
        <View style={styles.legend}>
          {used > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: percentage > 100 ? colors.error : colors.primary }]} />
              <Text style={styles.legendText}>استفاده شده</Text>
            </View>
          )}
          {remaining > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.surfaceVariant }]} />
              <Text style={styles.legendText}>باقیمانده</Text>
            </View>
          )}
          {overLimit > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.error }]} />
              <Text style={styles.legendText}>افزوده</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: typography.fontSize.xxxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  labelText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  noDataText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: spacing.xs,
  },
  legendText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
});

