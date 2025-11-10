import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { useCigaretteStore } from '../store/cigaretteStore';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { CigaretteCircularChart } from '../components/cigarette/CigaretteCircularChart';
import { DateService } from '../services/DateService';
import { ReportService } from '../services/ReportService';
import { CigaretteLineChart } from '../components/cigarette/CigaretteLineChart';
import { AppLogo } from '../components/common/AppLogo';

export const CigaretteTrackerScreen: React.FC = () => {
  const { todayCigarette, loading, loadTodayCigarette, addCigarette, removeCigarette, setDailyLimit } = useCigaretteStore();
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [newLimit, setNewLimit] = useState('10');
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    loadTodayCigarette();
    loadWeeklyData();
  }, []);

  useEffect(() => {
    if (todayCigarette) {
      setNewLimit(todayCigarette.dailyLimit.toString());
    }
  }, [todayCigarette]);

  const loadWeeklyData = async () => {
    try {
      const today = DateService.getToday();
      const weekStart = DateService.addDays(today, -6);
      const reports = await ReportService.getCigaretteReports(weekStart, today);
      setWeeklyData(reports);
    } catch (error) {
      console.error('Error loading weekly data:', error);
    }
  };

  const handleAdd = async () => {
    await addCigarette();
    await loadWeeklyData();
  };

  const handleRemove = async () => {
    await removeCigarette();
    await loadWeeklyData();
  };

  const handleSetLimit = async () => {
    const limit = parseInt(newLimit);
    if (limit > 0 && limit <= 100) {
      await setDailyLimit(limit);
      setLimitModalVisible(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSkeleton width="100%" height={200} />
      </SafeAreaView>
    );
  }

  if (!todayCigarette) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <EmptyState title="خطا در بارگذاری داده‌ها" />
      </SafeAreaView>
    );
  }

  const percentage = todayCigarette.dailyLimit > 0
    ? (todayCigarette.count / todayCigarette.dailyLimit) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppLogo size="medium" />
          <Text style={styles.subtitle}>ردیابی سیگار</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>امروز</Text>
            <TouchableOpacity
              onPress={() => setLimitModalVisible(true)}
              style={styles.limitButton}
            >
              <Ionicons name="settings-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.counter}>
            <TouchableOpacity
              style={[styles.button, styles.removeButton, todayCigarette.count === 0 && styles.buttonDisabled]}
              onPress={handleRemove}
              disabled={todayCigarette.count === 0}
            >
              <Ionicons name="remove" size={32} color={todayCigarette.count === 0 ? colors.textDisabled : colors.text} />
            </TouchableOpacity>
            
            <View style={styles.countContainer}>
              <Text style={styles.count}>{todayCigarette.count}</Text>
              <Text style={styles.limit}>/{todayCigarette.dailyLimit}</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAdd}
            >
              <Ionicons name="add" size={32} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartContainer}>
            <CigaretteCircularChart cigarette={todayCigarette} size={180} />
          </View>
        </View>

        {weeklyData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>روند هفتگی</Text>
            <CigaretteLineChart data={weeklyData} height={200} />
          </View>
        )}
      </ScrollView>

      <Modal
        visible={limitModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLimitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تعیین حد مجاز روزانه</Text>
            <Text style={styles.modalLabel}>حد مجاز:</Text>
            <TextInput
              style={styles.modalInput}
              value={newLimit}
              onChangeText={setNewLimit}
              keyboardType="numeric"
              placeholder="10"
              placeholderTextColor={colors.textDisabled}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setLimitModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSetLimit}
              >
                <Text style={styles.modalButtonText}>ذخیره</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
  },
  limitButton: {
    padding: spacing.xs,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  addButton: {
    marginLeft: spacing.lg,
  },
  removeButton: {
    marginRight: spacing.lg,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  count: {
    fontSize: typography.fontSize.xxxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  limit: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalInput: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
  },
});

