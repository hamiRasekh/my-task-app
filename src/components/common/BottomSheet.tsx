import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheetComponent, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { colors, spacing } from '../../theme';

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  index?: number;
  onChange?: (index: number) => void;
  onClose?: () => void;
  enablePanDownToClose?: boolean;
}

export interface BottomSheetRef {
  snapToIndex: (index: number) => void;
  close: () => void;
  expand: () => void;
  collapse: () => void;
}

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(({
  children,
  snapPoints = ['50%', '90%'],
  index = -1,
  onChange,
  onClose,
  enablePanDownToClose = true,
}, ref) => {
  const bottomSheetRef = useRef<BottomSheetComponent>(null);

  useImperativeHandle(ref, () => ({
    snapToIndex: (index: number) => {
      bottomSheetRef.current?.snapToIndex(index);
    },
    close: () => {
      bottomSheetRef.current?.close();
    },
    expand: () => {
      bottomSheetRef.current?.expand();
    },
    collapse: () => {
      bottomSheetRef.current?.collapse();
    },
  }));

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1 && onClose) {
      onClose();
    }
    if (onChange) {
      onChange(index);
    }
  }, [onChange, onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

  return (
    <BottomSheetComponent
      ref={bottomSheetRef}
      index={index}
      snapPoints={memoizedSnapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={enablePanDownToClose}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.content}>
        {children}
      </BottomSheetView>
    </BottomSheetComponent>
  );
});

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.surface,
  },
  indicator: {
    backgroundColor: colors.border,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
});

