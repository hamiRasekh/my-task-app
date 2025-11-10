import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import { TaskFormData } from '../../types/task.types';
import { DateService } from '../../services/DateService';
import { DEFAULT_TASK_PRIORITY } from '../../utils/constants';
import { formatPriority } from '../../utils/formatters';
import { Priority } from '../../types/common.types';
import { DatePickerModal } from './DatePickerModal';
import { TimePickerModal } from './TimePickerModal';
import { notificationService } from '../../services/NotificationService';

export const TaskModal: React.FC = () => {
  const { taskModalVisible, selectedTaskId, closeTaskModal } = useUIStore();
  const { tasks, categories, createTask, updateTask, loadCategories } = useTaskStore();
  
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    scheduledDate: DateService.getToday(),
    isContinuous: false,
    priority: DEFAULT_TASK_PRIORITY,
    rewardPoints: 10,
    penaltyPoints: 5,
    notificationEnabled: false,
  });

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [deadlinePickerVisible, setDeadlinePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [notificationTimePickerVisible, setNotificationTimePickerVisible] = useState(false);

  useEffect(() => {
    if (taskModalVisible) {
      loadCategories();
    }
  }, [taskModalVisible]);

  useEffect(() => {
    if (selectedTask) {
      setFormData({
        title: selectedTask.title,
        description: selectedTask.description || '',
        categoryId: selectedTask.categoryId,
        scheduledDate: selectedTask.scheduledDate,
        deadline: selectedTask.deadline,
        time: selectedTask.time,
        startTime: selectedTask.startTime,
        endTime: selectedTask.endTime,
        isContinuous: selectedTask.isContinuous,
        priority: selectedTask.priority as Priority,
        rewardPoints: selectedTask.rewardPoints,
        penaltyPoints: selectedTask.penaltyPoints,
        notificationEnabled: selectedTask.notificationEnabled,
        notificationTime: selectedTask.notificationTime,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        scheduledDate: DateService.getToday(),
        isContinuous: false,
        priority: DEFAULT_TASK_PRIORITY,
        rewardPoints: 10,
        penaltyPoints: 5,
        notificationEnabled: false,
      });
    }
  }, [selectedTask, taskModalVisible]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      return;
    }

    try {
      let taskId: string;
      if (selectedTaskId) {
        await updateTask(selectedTaskId, formData);
        taskId = selectedTaskId;
        // Cancel old notifications
        await notificationService.cancelTaskNotifications(taskId);
      } else {
        const newTask = await createTask(formData);
        taskId = newTask.id;
      }

      // Schedule notification if enabled
      if (formData.notificationEnabled) {
        if (formData.notificationTime) {
          // Use Persian date and time
          await notificationService.scheduleTaskReminderPersian(
            taskId,
            formData.title,
            formData.description || 'یادآوری انجام کار',
            formData.scheduledDate,
            formData.notificationTime
          );
        } else if (formData.time) {
          // Use scheduled time as notification time
          await notificationService.scheduleTaskReminderPersian(
            taskId,
            formData.title,
            formData.description || 'یادآوری انجام کار',
            formData.scheduledDate,
            formData.time
          );
        }
      }

      // Schedule deadline reminder if deadline is set
      if (formData.deadline) {
        await notificationService.scheduleDeadlineReminder(
          taskId,
          formData.title,
          formData.deadline
        );
      }

      closeTaskModal();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const setPriority = (priority: Priority) => {
    setFormData({ ...formData, priority });
  };

  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  if (!taskModalVisible) {
    return null;
  }

  return (
    <>
      <Modal
        visible={taskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeTaskModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {selectedTaskId ? 'ویرایش کار' : 'کار جدید'}
              </Text>
              <TouchableOpacity onPress={closeTaskModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>عنوان *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="عنوان کار را وارد کنید"
                placeholderTextColor={colors.textDisabled}
              />

              <Text style={styles.label}>توضیحات</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="توضیحات کار را وارد کنید"
                placeholderTextColor={colors.textDisabled}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>تاریخ انجام</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setDatePickerVisible(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={styles.dateTimeButtonText}>
                  {DateService.getDateWithDayName(formData.scheduledDate)}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <Text style={styles.label}>مهلت انجام (اختیاری)</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setDeadlinePickerVisible(true)}
              >
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={styles.dateTimeButtonText}>
                  {formData.deadline ? DateService.getDateWithDayName(formData.deadline) : 'انتخاب مهلت'}
                </Text>
                {formData.deadline && (
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, deadline: undefined })}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              <Text style={styles.label}>زمان انجام (اختیاری)</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setTimePickerVisible(true)}
              >
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={styles.dateTimeButtonText}>
                  {formData.time || 'انتخاب زمان'}
                </Text>
                {formData.time && (
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, time: undefined })}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {categories.length > 0 && (
                <>
                  <Text style={styles.label}>دسته‌بندی (اختیاری)</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                    contentContainerStyle={styles.categoryContainer}
                  >
                    <TouchableOpacity
                      style={[
                        styles.categoryChip,
                        !formData.categoryId && styles.categoryChipActive,
                      ]}
                      onPress={() => setFormData({ ...formData, categoryId: undefined })}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          !formData.categoryId && styles.categoryChipTextActive,
                        ]}
                      >
                        بدون دسته
                      </Text>
                    </TouchableOpacity>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryChip,
                          formData.categoryId === category.id && styles.categoryChipActive,
                          formData.categoryId === category.id && { borderColor: category.color },
                        ]}
                        onPress={() => setFormData({ ...formData, categoryId: category.id })}
                      >
                        <View
                          style={[styles.categoryColor, { backgroundColor: category.color }]}
                        />
                        <Text
                          style={[
                            styles.categoryChipText,
                            formData.categoryId === category.id && styles.categoryChipTextActive,
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <Text style={styles.label}>اولویت</Text>
              <View style={styles.priorityContainer}>
                {(['low', 'medium', 'high'] as Priority[]).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      formData.priority === priority && styles.priorityButtonActive,
                    ]}
                    onPress={() => setPriority(priority)}
                  >
                    <Ionicons
                      name={
                        priority === 'high'
                          ? 'flag'
                          : priority === 'medium'
                          ? 'flag-outline'
                          : 'remove'
                      }
                      size={16}
                      color={formData.priority === priority ? colors.text : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.priorityButtonText,
                        formData.priority === priority && styles.priorityButtonTextActive,
                      ]}
                    >
                      {formatPriority(priority)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchLabelContainer}>
                  <Ionicons name="repeat-outline" size={20} color={colors.text} />
                  <Text style={styles.switchLabel}>فعالیت مستمر</Text>
                </View>
                <Switch
                  value={formData.isContinuous}
                  onValueChange={(value) => setFormData({ ...formData, isContinuous: value })}
                  trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                  thumbColor={colors.text}
                />
              </View>

              <View style={styles.pointsContainer}>
                <View style={styles.pointsRow}>
                  <View style={styles.pointInputContainer}>
                    <Ionicons name="star" size={20} color={colors.warning} />
                    <Text style={styles.pointLabel}>امتیاز پاداش</Text>
                    <TextInput
                      style={[styles.input, styles.pointInput]}
                      value={formData.rewardPoints.toString()}
                      onChangeText={(text) => {
                        const num = parseInt(text) || 0;
                        setFormData({ ...formData, rewardPoints: num });
                      }}
                      keyboardType="numeric"
                      placeholderTextColor={colors.textDisabled}
                    />
                  </View>

                  <View style={styles.pointInputContainer}>
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                    <Text style={styles.pointLabel}>امتیاز مجازات</Text>
                    <TextInput
                      style={[styles.input, styles.pointInput]}
                      value={formData.penaltyPoints.toString()}
                      onChangeText={(text) => {
                        const num = parseInt(text) || 0;
                        setFormData({ ...formData, penaltyPoints: num });
                      }}
                      keyboardType="numeric"
                      placeholderTextColor={colors.textDisabled}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchLabelContainer}>
                  <Ionicons name="notifications-outline" size={20} color={colors.text} />
                  <Text style={styles.switchLabel}>یادآوری</Text>
                </View>
                <Switch
                  value={formData.notificationEnabled}
                  onValueChange={(value) => setFormData({ ...formData, notificationEnabled: value })}
                  trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                  thumbColor={colors.text}
                />
              </View>

              {formData.notificationEnabled && (
                <>
                  <Text style={styles.label}>زمان یادآوری</Text>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setNotificationTimePickerVisible(true)}
                  >
                    <Ionicons name="alarm-outline" size={20} color={colors.primary} />
                    <Text style={styles.dateTimeButtonText}>
                      {formData.notificationTime || 'انتخاب زمان یادآوری'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeTaskModal}>
                  <Text style={styles.cancelButtonText}>انصراف</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, !formData.title.trim() && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={!formData.title.trim()}
                >
                  <Text style={styles.saveButtonText}>ذخیره</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DatePickerModal
        visible={datePickerVisible}
        initialDate={formData.scheduledDate}
        onSelect={(date) => {
          setFormData({ ...formData, scheduledDate: date });
          setDatePickerVisible(false);
        }}
        onClose={() => setDatePickerVisible(false)}
        title="انتخاب تاریخ انجام"
      />

      <DatePickerModal
        visible={deadlinePickerVisible}
        initialDate={formData.deadline}
        onSelect={(date) => {
          setFormData({ ...formData, deadline: date });
          setDeadlinePickerVisible(false);
        }}
        onClose={() => setDeadlinePickerVisible(false)}
        title="انتخاب مهلت انجام"
      />

      <TimePickerModal
        visible={timePickerVisible}
        initialTime={formData.time}
        onSelect={(time) => {
          setFormData({ ...formData, time });
          setTimePickerVisible(false);
        }}
        onClose={() => setTimePickerVisible(false)}
        title="انتخاب زمان انجام"
      />

      <TimePickerModal
        visible={notificationTimePickerVisible}
        initialTime={formData.notificationTime}
        onSelect={(time) => {
          setFormData({ ...formData, notificationTime: time });
          setNotificationTimePickerVisible(false);
        }}
        onClose={() => setNotificationTimePickerVisible(false)}
        title="انتخاب زمان یادآوری"
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '95%',
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  dateTimeButtonText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
  },
  removeButton: {
    padding: spacing.xs,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.xs,
  },
  priorityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priorityButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  priorityButtonTextActive: {
    color: colors.text,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  switchLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
  },
  pointsContainer: {
    marginTop: spacing.md,
  },
  pointsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pointInputContainer: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  pointInput: {
    textAlign: 'center',
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
  },
  categoryScroll: {
    marginBottom: spacing.md,
  },
  categoryContainer: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
