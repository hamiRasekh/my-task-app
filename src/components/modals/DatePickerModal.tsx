import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { colors, typography, spacing, shadows } from '../../theme';
import { GlassCard } from '../common/GlassCard';
import { DateService } from '../../services/DateService';
import PersianDate from 'persian-date';

interface DatePickerModalProps {
  visible: boolean;
  initialDate?: string;
  onSelect: (date: string) => void;
  onClose: () => void;
  title?: string;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  initialDate,
  onSelect,
  onClose,
  title = 'انتخاب تاریخ',
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || DateService.getToday()
  );
  const [year, setYear] = useState<number>(1403);
  const [month, setMonth] = useState<number>(1);
  const [day, setDay] = useState<number>(1);

  const getDaysInMonth = (y: number, m: number): number => {
    const persianDate = new PersianDate([y, m - 1, 1]);
    return persianDate.daysInMonth();
  };

  useEffect(() => {
    if (initialDate) {
      const [y, m, d] = initialDate.split('/').map(Number);
      setYear(y);
      setMonth(m);
      const daysInMonth = getDaysInMonth(y, m);
      setDay(Math.min(d, daysInMonth));
      setSelectedDate(initialDate);
    } else {
      const today = new PersianDate();
      setYear(today.year());
      setMonth(today.month());
      setDay(today.date());
      setSelectedDate(DateService.getToday());
    }
  }, [initialDate, visible]);

  useEffect(() => {
    // Update days when year or month changes
    const daysInMonth = getDaysInMonth(year, month);
    if (day > daysInMonth) {
      setDay(daysInMonth);
    }
  }, [year, month]);

  const handleConfirm = () => {
    const dateStr = `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
    setSelectedDate(dateStr);
    onSelect(dateStr);
    onClose();
  };

  const quickDates = [
    { label: 'امروز', date: DateService.getToday() },
    { label: 'فردا', date: DateService.getTomorrow() },
    { label: 'پس‌فردا', date: DateService.addDays(DateService.getToday(), 2) },
  ];

  const handleQuickDate = (date: string) => {
    const [y, m, d] = date.split('/').map(Number);
    setYear(y);
    setMonth(m);
    setDay(d);
    setSelectedDate(date);
  };

  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const daysInMonth = getDaysInMonth(year, month);
  const years = Array.from({ length: 10 }, (_, i) => year - 5 + i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View entering={SlideInDown.duration(300)} style={styles.modalContent}>
          <GlassCard intensity="strong" style={styles.modalGlassCard}>
            <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.quickDatesContainer}>
              {quickDates.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.quickDateButton,
                    selectedDate === item.date && styles.quickDateButtonActive,
                  ]}
                  onPress={() => handleQuickDate(item.date)}
                >
                  <Text
                    style={[
                      styles.quickDateButtonText,
                      selectedDate === item.date && styles.quickDateButtonTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>سال</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {years.map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[
                        styles.pickerItem,
                        year === y && styles.pickerItemActive,
                      ]}
                      onPress={() => setYear(y)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          year === y && styles.pickerItemTextActive,
                        ]}
                      >
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>ماه</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {months.map((m, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pickerItem,
                        month === index + 1 && styles.pickerItemActive,
                      ]}
                      onPress={() => {
                        setMonth(index + 1);
                        const newDaysInMonth = getDaysInMonth(year, index + 1);
                        if (day > newDaysInMonth) {
                          setDay(newDaysInMonth);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          month === index + 1 && styles.pickerItemTextActive,
                        ]}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>روز</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {days.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.pickerItem,
                        day === d && styles.pickerItemActive,
                      ]}
                      onPress={() => setDay(d)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          day === d && styles.pickerItemTextActive,
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.selectedDateContainer}>
              <Text style={styles.selectedDateLabel}>تاریخ انتخاب شده:</Text>
              <Text style={styles.selectedDateText}>
                {DateService.getDateWithDayName(
                  `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`
                )}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>انصراف</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>تأیید</Text>
            </TouchableOpacity>
          </View>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalGlassCard: {
    borderRadius: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  quickDatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  quickDateButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.glass,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  quickDateButtonActive: {
    backgroundColor: colors.primary + '40',
    borderColor: colors.primary,
    ...shadows.glow,
  },
  quickDateButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  quickDateButtonTextActive: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.md,
    height: 200,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pickerScroll: {
    flex: 1,
    width: '100%',
  },
  pickerItem: {
    padding: spacing.sm,
    borderRadius: 8,
    marginVertical: 2,
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  pickerItemActive: {
    backgroundColor: colors.primary + '40',
    borderColor: colors.primary,
    ...shadows.glow,
  },
  pickerItemText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  pickerItemTextActive: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  selectedDateContainer: {
    backgroundColor: colors.glass,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  selectedDateLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  selectedDateText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.glass,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.glow,
  },
  confirmButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
  },
});
