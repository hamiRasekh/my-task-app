import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { ReportService } from '../services/ReportService';
import { DateService } from '../services/DateService';
import { RewardService } from '../services/RewardService';
import { CigaretteBarChart } from '../components/cigarette/CigaretteBarChart';
import { CigaretteLineChart } from '../components/cigarette/CigaretteLineChart';
import { EmptyState } from '../components/common/EmptyState';

export const ReportsScreen: React.FC = () => {
  const [taskStats, setTaskStats] = useState<any>(null);
  const [cigaretteStats, setCigaretteStats] = useState<any>(null);
  const [cigaretteReports, setCigaretteReports] = useState<any[]>([]);
  const [points, setPoints] = useState(0);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const today = DateService.getToday();
      let startDate: string;
      let endDate = today;

      switch (dateRange) {
        case 'week':
          startDate = DateService.addDays(today, -6);
          break;
        case 'month':
          const { start } = DateService.getCurrentMonthRange();
          startDate = start;
          break;
        default:
          startDate = DateService.addDays(today, -30);
      }

      const [taskStatsData, cigaretteStatsData, cigaretteReportsData, pointsData] = await Promise.all([
        ReportService.getTaskStats(startDate, endDate),
        ReportService.getCigaretteStats(startDate, endDate),
        ReportService.getCigaretteReports(startDate, endDate),
        RewardService.getTotalPoints(startDate, endDate),
      ]);

      setTaskStats(taskStatsData);
      setCigaretteStats(cigaretteStatsData);
      setCigaretteReports(cigaretteReportsData);
      setPoints(pointsData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>گزارش‌ها</Text>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, dateRange === 'week' && styles.filterButtonActive]}
            onPress={() => setDateRange('week')}
          >
            <Text style={[styles.filterButtonText, dateRange === 'week' && styles.filterButtonTextActive]}>
              هفته
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, dateRange === 'month' && styles.filterButtonActive]}
            onPress={() => setDateRange('month')}
          >
            <Text style={[styles.filterButtonText, dateRange === 'month' && styles.filterButtonTextActive]}>
              ماه
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task Stats */}
        {taskStats && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>آمار کارها</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{taskStats.total}</Text>
                <Text style={styles.statLabel}>کل کارها</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {taskStats.completed}
                </Text>
                <Text style={styles.statLabel}>انجام شده</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.error }]}>
                  {taskStats.overdue}
                </Text>
                <Text style={styles.statLabel}>گذشته از موعد</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>
                درصد انجام: {taskStats.completionRate}%
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${taskStats.completionRate}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Cigarette Stats */}
        {cigaretteStats && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>آمار سیگار</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{cigaretteStats.today}</Text>
                <Text style={styles.statLabel}>امروز</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{cigaretteStats.weekly}</Text>
                <Text style={styles.statLabel}>هفته</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{cigaretteStats.monthly}</Text>
                <Text style={styles.statLabel}>ماه</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {cigaretteStats.streak}
                </Text>
                <Text style={styles.statLabel}>روز متوالی</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{cigaretteStats.average}</Text>
                <Text style={styles.statLabel}>میانگین</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{cigaretteStats.max}</Text>
                <Text style={styles.statLabel}>حداکثر</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{cigaretteStats.min}</Text>
                <Text style={styles.statLabel}>حداقل</Text>
              </View>
            </View>
          </View>
        )}

        {/* Points */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>امتیازات</Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsValue}>{points}</Text>
            <Text style={styles.pointsLabel}>امتیاز کل</Text>
          </View>
        </View>

        {/* Cigarette Charts */}
        {cigaretteReports.length > 0 && (
          <>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>مصرف هفتگی</Text>
              <CigaretteLineChart data={cigaretteReports} height={200} />
            </View>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>مصرف ماهانه</Text>
              <CigaretteBarChart data={cigaretteReports} height={200} />
            </View>
          </>
        )}

        {!taskStats && !cigaretteStats && (
          <EmptyState
            title="داده‌ای برای نمایش وجود ندارد"
            message="کارها و مصرف سیگار خود را ثبت کنید تا گزارش‌ها نمایش داده شوند"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  pointsContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  pointsValue: {
    fontSize: typography.fontSize.xxxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  pointsLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
