import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { FilterOption, TaskStatus, Priority } from '../../types/common.types';
import { formatPriority, formatTaskStatus } from '../../utils/formatters';
import Category from '../../database/models/Category';

interface TaskFiltersProps {
  filters: FilterOption | null;
  categories: Category[];
  onFilterChange: (filters: FilterOption | null) => void;
  onClose: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  categories,
  onFilterChange,
  onClose,
}) => {
  const handleStatusFilter = (status: TaskStatus | null) => {
    if (status === null) {
      const newFilters = { ...filters };
      delete newFilters.status;
      onFilterChange(Object.keys(newFilters).length > 0 ? newFilters : null);
    } else {
      onFilterChange({ ...filters, status });
    }
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    if (categoryId === null) {
      const newFilters = { ...filters };
      delete newFilters.categoryId;
      onFilterChange(Object.keys(newFilters).length > 0 ? newFilters : null);
    } else {
      onFilterChange({ ...filters, categoryId });
    }
  };

  const handlePriorityFilter = (priority: Priority | null) => {
    if (priority === null) {
      const newFilters = { ...filters };
      delete newFilters.priority;
      onFilterChange(Object.keys(newFilters).length > 0 ? newFilters : null);
    } else {
      onFilterChange({ ...filters, priority });
    }
  };

  const clearFilters = () => {
    onFilterChange(null);
  };

  const hasActiveFilters = filters && Object.keys(filters).length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>فیلترها</Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>پاک کردن</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>وضعیت</Text>
          <View style={styles.filterRow}>
            {[null, 'pending', 'completed', 'overdue'].map((status) => (
              <TouchableOpacity
                key={status || 'all'}
                style={[
                  styles.filterChip,
                  filters?.status === status && styles.filterChipActive,
                ]}
                onPress={() => handleStatusFilter(status as TaskStatus | null)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters?.status === status && styles.filterChipTextActive,
                  ]}
                >
                  {status ? formatTaskStatus(status) : 'همه'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اولویت</Text>
          <View style={styles.filterRow}>
            {[null, 'low', 'medium', 'high'].map((priority) => (
              <TouchableOpacity
                key={priority || 'all'}
                style={[
                  styles.filterChip,
                  filters?.priority === priority && styles.filterChipActive,
                ]}
                onPress={() => handlePriorityFilter(priority as Priority | null)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters?.priority === priority && styles.filterChipTextActive,
                  ]}
                >
                  {priority ? formatPriority(priority) : 'همه'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>دسته‌بندی</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !filters?.categoryId && styles.filterChipActive,
                ]}
                onPress={() => handleCategoryFilter(null)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !filters?.categoryId && styles.filterChipTextActive,
                  ]}
                >
                  همه
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterChip,
                    filters?.categoryId === category.id && styles.filterChipActive,
                    { borderColor: category.color },
                  ]}
                  onPress={() => handleCategoryFilter(category.id)}
                >
                  <View
                    style={[styles.categoryColor, { backgroundColor: category.color }]}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      filters?.categoryId === category.id && styles.filterChipTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={onClose}>
          <Text style={styles.applyButtonText}>اعمال</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.text,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
  },
});

