import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { colors, typography, spacing, shadows } from '../../theme';
import { GlassCard } from '../common/GlassCard';

interface TimePickerModalProps {
  visible: boolean;
  initialTime?: string;
  onSelect: (time: string) => void;
  onClose: () => void;
  title?: string;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  initialTime,
  onSelect,
  onClose,
  title = 'انتخاب زمان',
}) => {
  const [hour, setHour] = useState<number>(9);
  const [minute, setMinute] = useState<number>(0);

  useEffect(() => {
    if (initialTime) {
      const [h, m] = initialTime.split(':').map(Number);
      setHour(h);
      setMinute(m);
    } else {
      setHour(9);
      setMinute(0);
    }
  }, [initialTime, visible]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleConfirm = () => {
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onSelect(time);
    onClose();
  };

  const quickTimes = [
    { label: 'صبح (9:00)', hour: 9, minute: 0 },
    { label: 'ظهر (12:00)', hour: 12, minute: 0 },
    { label: 'عصر (15:00)', hour: 15, minute: 0 },
    { label: 'شب (21:00)', hour: 21, minute: 0 },
  ];

  const handleQuickTime = (h: number, m: number) => {
    setHour(h);
    setMinute(m);
  };

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
            <View style={styles.quickTimesContainer}>
              {quickTimes.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quickTimeButton,
                    hour === item.hour && minute === item.minute && styles.quickTimeButtonActive,
                  ]}
                  onPress={() => handleQuickTime(item.hour, item.minute)}
                >
                  <Text
                    style={[
                      styles.quickTimeButtonText,
                      hour === item.hour && minute === item.minute && styles.quickTimeButtonTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>ساعت</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {hours.map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.pickerItem,
                        hour === h && styles.pickerItemActive,
                      ]}
                      onPress={() => setHour(h)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          hour === h && styles.pickerItemTextActive,
                        ]}
                      >
                        {h.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>دقیقه</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {minutes.filter((m) => m % 5 === 0).map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.pickerItem,
                        minute === m && styles.pickerItemActive,
                      ]}
                      onPress={() => setMinute(m)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          minute === m && styles.pickerItemTextActive,
                        ]}
                      >
                        {m.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.selectedTimeContainer}>
              <Text style={styles.selectedTimeLabel}>زمان انتخاب شده:</Text>
              <Text style={styles.selectedTimeText}>
                {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
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
    maxHeight: '70%',
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
  quickTimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  quickTimeButton: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.glass,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  quickTimeButtonActive: {
    backgroundColor: colors.primary + '40',
    borderColor: colors.primary,
    ...shadows.glow,
  },
  quickTimeButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  quickTimeButtonTextActive: {
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
  selectedTimeContainer: {
    backgroundColor: colors.glass,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  selectedTimeLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  selectedTimeText: {
    fontSize: typography.fontSize.xl,
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
