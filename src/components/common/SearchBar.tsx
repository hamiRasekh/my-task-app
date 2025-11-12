import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, shadows } from '../../theme';

interface SearchBarProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchText,
  onSearchTextChange,
  placeholder = 'جستجو...',
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={searchText}
        onChangeText={onSearchTextChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {searchText.length > 0 && (
        <TouchableOpacity
          onPress={() => onSearchTextChange('')}
          style={styles.clearIcon}
        >
          <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: spacing.sm,
    ...shadows.glass,
  },
  icon: {
    marginLeft: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  clearIcon: {
    marginLeft: spacing.sm,
  },
});

