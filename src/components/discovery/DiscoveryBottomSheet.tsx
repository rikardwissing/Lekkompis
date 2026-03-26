import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

type DiscoveryBottomSheetProps = {
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  title?: string;
  visible: boolean;
};

export function DiscoveryBottomSheet({
  children,
  footer,
  onClose,
  title,
  visible,
}: DiscoveryBottomSheetProps) {
  const { height: screenHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const isClosingRef = useRef(false);
  const translateY = useSharedValue(screenHeight);
  const dragStartY = useSharedValue(0);

  const finishClose = useCallback(() => {
    isClosingRef.current = false;
    setMounted(false);
  }, []);

  const closeSheet = useCallback(
    (notifyParent: boolean) => {
      if (!mounted || isClosingRef.current) {
        return;
      }

      isClosingRef.current = true;

      if (notifyParent) {
        onClose();
      }

      cancelAnimation(translateY);
      translateY.value = withTiming(
        screenHeight,
        {
          duration: 220,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(finishClose)();
          }
        }
      );
    },
    [finishClose, mounted, onClose, screenHeight, translateY]
  );

  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }

    if (!mounted) {
      return;
    }

    closeSheet(false);
  }, [closeSheet, mounted, visible]);

  useEffect(() => {
    if (!mounted || !visible) {
      return;
    }

    isClosingRef.current = false;
    cancelAnimation(translateY);
    translateY.value = screenHeight;

    requestAnimationFrame(() => {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 190,
        mass: 0.95,
      });
    });
  }, [mounted, screenHeight, translateY, visible]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([12, 12])
        .failOffsetX([-18, 18])
        .onStart(() => {
          dragStartY.value = translateY.value;
          cancelAnimation(translateY);
        })
        .onUpdate((event) => {
          translateY.value = Math.max(dragStartY.value + event.translationY, 0);
        })
        .onEnd((event) => {
          const dismissThreshold = Math.min(screenHeight * 0.18, 140);
          const shouldDismiss = translateY.value > dismissThreshold || event.velocityY > 1200;

          if (shouldDismiss) {
            runOnJS(closeSheet)(true);
            return;
          }

          translateY.value = withSpring(0, {
            damping: 20,
            stiffness: 190,
            mass: 0.95,
          });
        }),
    [closeSheet, dragStartY, screenHeight, translateY]
  );

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, screenHeight], [1, 0], Extrapolation.CLAMP),
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={mounted}
    >
      <View style={styles.root}>
        <Animated.View pointerEvents="none" style={[styles.backdrop, backdropStyle]} />
        <Pressable accessibilityRole="button" onPress={() => closeSheet(true)} style={StyleSheet.absoluteFillObject} />
        <Animated.View style={[styles.sheetShell, sheetStyle]}>
          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <GestureDetector gesture={panGesture}>
              <View style={styles.headerDragZone}>
                <View style={styles.handle} />
                {title ? <Text style={styles.title}>{title}</Text> : null}
              </View>
            </GestureDetector>
            <View style={styles.content}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 20, 18, 0.46)',
  },
  sheetShell: {
    maxHeight: '88%',
    minHeight: 0,
  },
  sheet: {
    maxHeight: '100%',
    minHeight: 0,
    flexShrink: 1,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  headerDragZone: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    gap: spacing.md,
    minHeight: 0,
    flexShrink: 1,
  },
  footer: {
    paddingTop: spacing.sm,
    flexShrink: 0,
  },
});
