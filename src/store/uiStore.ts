import { create } from 'zustand';

interface UIState {
  // Bottom Sheet states
  taskModalVisible: boolean;
  categoryModalVisible: boolean;
  datePickerModalVisible: boolean;
  timePickerModalVisible: boolean;
  settingsModalVisible: boolean;
  
  // Selected items
  selectedTaskId: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  
  // Actions
  openTaskModal: (taskId?: string) => void;
  closeTaskModal: () => void;
  openCategoryModal: () => void;
  closeCategoryModal: () => void;
  openDatePickerModal: (initialDate?: string) => void;
  closeDatePickerModal: () => void;
  openTimePickerModal: (initialTime?: string) => void;
  closeTimePickerModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (time: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  taskModalVisible: false,
  categoryModalVisible: false,
  datePickerModalVisible: false,
  timePickerModalVisible: false,
  settingsModalVisible: false,
  selectedTaskId: null,
  selectedDate: null,
  selectedTime: null,

  openTaskModal: (taskId?: string) => {
    set({ taskModalVisible: true, selectedTaskId: taskId || null });
  },

  closeTaskModal: () => {
    set({ taskModalVisible: false, selectedTaskId: null });
  },

  openCategoryModal: () => {
    set({ categoryModalVisible: true });
  },

  closeCategoryModal: () => {
    set({ categoryModalVisible: false });
  },

  openDatePickerModal: (initialDate?: string) => {
    set({ datePickerModalVisible: true, selectedDate: initialDate || null });
  },

  closeDatePickerModal: () => {
    set({ datePickerModalVisible: false, selectedDate: null });
  },

  openTimePickerModal: (initialTime?: string) => {
    set({ timePickerModalVisible: true, selectedTime: initialTime || null });
  },

  closeTimePickerModal: () => {
    set({ timePickerModalVisible: false, selectedTime: null });
  },

  openSettingsModal: () => {
    set({ settingsModalVisible: true });
  },

  closeSettingsModal: () => {
    set({ settingsModalVisible: false });
  },

  setSelectedDate: (date: string | null) => {
    set({ selectedDate: date });
  },

  setSelectedTime: (time: string | null) => {
    set({ selectedTime: time });
  },
}));

