import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography, spacing, shadows } from '../theme';
import { useTaskStore } from '../store/taskStore';
import { useUIStore } from '../store/uiStore';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton, TaskCardSkeleton } from '../components/common/LoadingSkeleton';
import { TaskModal } from '../components/modals/TaskModal';
import { TaskCard } from '../components/task/TaskCard';
import { TaskFilters } from '../components/task/TaskFilters';
import { SearchBar } from '../components/common/SearchBar';
import { AppLogo } from '../components/common/AppLogo';
import { GradientBackground } from '../components/common/GradientBackground';
import { GlassCard } from '../components/common/GlassCard';
import Task from '../database/models/Task';
import { SortOption } from '../types/common.types';

export const TasksScreen: React.FC = () => {
  const { tasks, categories, loading, loadTasks, loadCategories, completeTask, deleteTask, setFilters, setSortBy, sortBy, filters } = useTaskStore();
  const { openTaskModal } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  useEffect(() => {
    loadTasks();
    loadCategories();
  }, []);

  const handleAddTask = () => {
    openTaskModal();
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    return result;
  }, [tasks, searchQuery]);

  const renderTask = ({ item, index }: { item: Task; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400)}
      style={styles.taskWrapper}
    >
      <TaskCard
        task={item}
        onPress={() => openTaskModal(item.id)}
        onComplete={() => handleCompleteTask(item.id)}
        onDelete={() => handleDeleteTask(item.id)}
      />
    </Animated.View>
  );

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setSortModalVisible(false);
  };

  if (loading && tasks.length === 0) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.content}>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Animated.View style={styles.header} entering={FadeInDown.duration(500)}>
          <View style={styles.headerLeft}>
            <AppLogo size="small" />
            <Text style={styles.subtitle}>کارها</Text>
          </View>
          <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={styles.toolbar} entering={FadeInDown.delay(100).duration(500)}>
          <View style={styles.searchContainer}>
            <SearchBar
              searchText={searchQuery}
              onSearchTextChange={setSearchQuery}
              placeholder="جستجوی کارها..."
            />
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, filters && styles.actionButtonActive]}
              onPress={() => setFiltersVisible(true)}
            >
              <Ionicons
                name="filter"
                size={20}
                color={filters ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setSortModalVisible(true)}
            >
              <Ionicons name="swap-vertical" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {filteredTasks.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'نتیجه‌ای یافت نشد' : 'هیچ کاری وجود ندارد'}
            message={searchQuery ? 'لطفاً عبارت جستجو را تغییر دهید' : 'برای افزودن کار جدید، دکمه + را بزنید'}
          />
        ) : (
          <FlatList
            data={filteredTasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <TaskModal />

        <Modal
          visible={filtersVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setFiltersVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View
              entering={SlideInDown.duration(300)}
              style={styles.modalContent}
            >
              <GlassCard intensity="strong" style={styles.modalGlassCard}>
                <TaskFilters
                  filters={filters}
                  categories={categories}
                  onFilterChange={async (newFilters) => {
                    await setFilters(newFilters);
                  }}
                  onClose={() => setFiltersVisible(false)}
                />
              </GlassCard>
            </Animated.View>
          </View>
        </Modal>

        <Modal
          visible={sortModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setSortModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View
              entering={FadeIn.duration(300)}
              style={styles.sortModalContent}
            >
              <GlassCard intensity="strong" style={styles.sortModalGlassCard}>
                <Text style={styles.sortModalTitle}>مرتب‌سازی</Text>
                {(['date', 'priority', 'name', 'created'] as SortOption[]).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.sortOption,
                      sortBy === option && styles.sortOptionActive,
                    ]}
                    onPress={() => handleSortChange(option)}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        sortBy === option && styles.sortOptionTextActive,
                      ]}
                    >
                      {option === 'date' && 'تاریخ'}
                      {option === 'priority' && 'اولویت'}
                      {option === 'name' && 'نام'}
                      {option === 'created' && 'تاریخ ایجاد'}
                    </Text>
                    {sortBy === option && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.sortModalCloseButton}
                  onPress={() => setSortModalVisible(false)}
                >
                  <Text style={styles.sortModalCloseButtonText}>بستن</Text>
                </TouchableOpacity>
              </GlassCard>
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  addButton: {
    padding: spacing.xs,
  },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.glass,
  },
  actionButtonActive: {
    backgroundColor: colors.primary + '30',
    borderColor: colors.primary,
    ...shadows.glow,
  },
  content: {
    padding: spacing.md,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
  taskWrapper: {
    marginBottom: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalGlassCard: {
    borderRadius: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sortModalContent: {
    borderRadius: 24,
    margin: spacing.md,
    maxWidth: 300,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  sortModalGlassCard: {
    padding: spacing.md,
  },
  sortModalTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.glass,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  sortOptionActive: {
    backgroundColor: colors.primary + '30',
    borderColor: colors.primary,
    ...shadows.glow,
  },
  sortOptionText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
  },
  sortOptionTextActive: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  sortModalCloseButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.glass,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  sortModalCloseButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
  },
});
