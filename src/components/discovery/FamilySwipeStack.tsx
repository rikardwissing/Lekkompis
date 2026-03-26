import { forwardRef, type ReactNode, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

const MIDDLE_SCALE = 0.985;
const MIDDLE_TRANSLATE_Y = 10;
const MIDDLE_OPACITY = 0.42;
const BACK_SCALE = 0.965;
const BACK_TRANSLATE_Y = 18;
const BACK_OPACITY = 0.26;
const SWIPE_OUT_MULTIPLIER = 1.15;
const IMPERATIVE_SWIPE_Y = 8;
const SPRING_CONFIG = {
  damping: 18,
  mass: 0.9,
  stiffness: 170,
};

type FamilySwipeStackDirection = 'left' | 'right';
type FamilySwipeStackDecision = 'pass' | 'like';

export type FamilySwipeStackHandle = {
  swipeLeft: () => boolean;
  swipeRight: () => boolean;
};

export type FamilySwipeStackItem = {
  id: string;
  node: ReactNode;
};

export type FamilySwipeStackEmptyState = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

type FamilySwipeStackProps = {
  disabled?: boolean;
  emptyState: FamilySwipeStackEmptyState;
  items: FamilySwipeStackItem[];
  onDecision: (familyId: string, decision: FamilySwipeStackDecision) => void;
  onDecisionStart?: () => void;
};

function EmptyStateLayer({ emptyState }: { emptyState: FamilySwipeStackEmptyState }) {
  return (
    <View style={styles.emptySurface}>
      <View style={styles.emptyContent}>
        <EmptyState
          actionLabel={emptyState.actionLabel}
          body={emptyState.body}
          onAction={emptyState.onAction}
          title={emptyState.title}
        />
      </View>
    </View>
  );
}

export const FamilySwipeStack = forwardRef<FamilySwipeStackHandle, FamilySwipeStackProps>(
  function FamilySwipeStack({ disabled = false, emptyState, items, onDecision, onDecisionStart }, ref) {
    const { width } = useWindowDimensions();
    const swipeThreshold = width * 0.24;
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);
    const dragProgress = useSharedValue(0);
    const pendingDirection = useSharedValue(0);
    const isAnimating = useSharedValue(false);
    const pendingDecisionRef = useRef<{ decision: FamilySwipeStackDecision; familyId: string } | null>(null);

    const topItem = items[0] ?? null;
    const middleItem = items[1] ?? null;
    const baseItem = items[2] ?? null;
    const hasOnlyOneCard = items.length === 1;
    const showEmptyStateOnly = items.length === 0;
    const showEmptyStatePreview = hasOnlyOneCard;

    const previousTopIdRef = useRef<string | null>(topItem?.id ?? null);

    useEffect(() => {
      const nextTopId = topItem?.id ?? null;

      if (previousTopIdRef.current !== nextTopId) {
        previousTopIdRef.current = nextTopId;
        pendingDecisionRef.current = null;
        dragX.value = 0;
        dragY.value = 0;
        dragProgress.value = 0;
        pendingDirection.value = 0;
        isAnimating.value = false;
      }
    }, [dragProgress, dragX, dragY, isAnimating, pendingDirection, topItem?.id]);

    const handleDismissFinished = useCallback(
      (familyId: string, decision: FamilySwipeStackDecision) => {
        if (pendingDecisionRef.current?.familyId !== familyId) {
          return;
        }

        onDecision(familyId, decision);
      },
      [onDecision]
    );

    const startDismiss = useCallback(
      (direction: FamilySwipeStackDirection, gestureY = 0) => {
        if (disabled || !topItem || pendingDecisionRef.current) {
          return false;
        }

        const decision: FamilySwipeStackDecision = direction === 'right' ? 'like' : 'pass';
        const targetX = direction === 'right' ? width * SWIPE_OUT_MULTIPLIER : width * -SWIPE_OUT_MULTIPLIER;
        const targetY = gestureY * 0.18;
        const directionSign = direction === 'right' ? 1 : -1;

        pendingDecisionRef.current = { decision, familyId: topItem.id };
        onDecisionStart?.();

        runOnUI(
          (
            dismissX: number,
            dismissY: number,
            dismissDirection: number,
            familyId: string,
            nextDecision: FamilySwipeStackDecision
          ) => {
            'worklet';
            isAnimating.value = true;
            pendingDirection.value = dismissDirection;
            dragProgress.value = withTiming(1, {
              duration: 220,
              easing: Easing.out(Easing.cubic),
            });
            dragY.value = withTiming(dismissY, {
              duration: 220,
              easing: Easing.out(Easing.cubic),
            });
            dragX.value = withTiming(
              dismissX,
              {
                duration: 220,
                easing: Easing.out(Easing.cubic),
              },
              (finished) => {
                if (finished) {
                  runOnJS(handleDismissFinished)(familyId, nextDecision);
                }
              }
            );
          }
        )(targetX, targetY, directionSign, topItem.id, decision);

        return true;
      },
      [disabled, handleDismissFinished, onDecisionStart, pendingDirection, topItem, width, dragProgress, dragX, dragY, isAnimating]
    );

    useImperativeHandle(
      ref,
      () => ({
        swipeLeft: () => startDismiss('left', IMPERATIVE_SWIPE_Y),
        swipeRight: () => startDismiss('right', IMPERATIVE_SWIPE_Y),
      }),
      [startDismiss]
    );

    const panGesture = useMemo(
      () =>
        Gesture.Pan()
          .enabled(Boolean(topItem) && !disabled)
          .activeOffsetX([-12, 12])
          .failOffsetY([-28, 28])
          .onUpdate((event) => {
            if (isAnimating.value) {
              return;
            }

            dragX.value = event.translationX;
            dragY.value = event.translationY;
            dragProgress.value = Math.min(Math.abs(event.translationX) / swipeThreshold, 1);
            pendingDirection.value = event.translationX > 0 ? 1 : event.translationX < 0 ? -1 : 0;
          })
          .onEnd((event) => {
            if (isAnimating.value) {
              return;
            }

            const shouldDismiss =
              Math.abs(event.translationX) > swipeThreshold ||
              (Math.abs(event.velocityX) > 1100 && Math.abs(event.translationX) > 42);

            if (shouldDismiss) {
              runOnJS(startDismiss)(event.translationX > 0 ? 'right' : 'left', event.translationY);
              return;
            }

            pendingDirection.value = 0;
            dragX.value = withSpring(0, SPRING_CONFIG);
            dragY.value = withSpring(0, SPRING_CONFIG);
            dragProgress.value = withSpring(0, SPRING_CONFIG);
          }),
      [disabled, dragProgress, dragX, dragY, isAnimating, pendingDirection, startDismiss, swipeThreshold, topItem]
    );

    const topCardStyle = useAnimatedStyle(() => {
      const rotate = interpolate(dragX.value, [-width, 0, width], [-14, 0, 14], Extrapolation.CLAMP);

      return {
        transform: [
          { translateX: dragX.value },
          { translateY: dragY.value },
          { rotate: `${rotate}deg` },
        ],
      };
    }, [width]);

    const middleCardStyle = useAnimatedStyle(() => ({
      opacity: interpolate(dragProgress.value, [0, 1], [MIDDLE_OPACITY, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            dragProgress.value,
            [0, 1],
            [MIDDLE_TRANSLATE_Y, 0],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(dragProgress.value, [0, 1], [MIDDLE_SCALE, 1], Extrapolation.CLAMP),
        },
      ],
    }));

    const baseCardStyle = useAnimatedStyle(() => ({
      opacity: interpolate(dragProgress.value, [0, 1], [BACK_OPACITY, MIDDLE_OPACITY], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            dragProgress.value,
            [0, 1],
            [BACK_TRANSLATE_Y, MIDDLE_TRANSLATE_Y],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(dragProgress.value, [0, 1], [BACK_SCALE, MIDDLE_SCALE], Extrapolation.CLAMP),
        },
      ],
    }));

    const emptyPreviewStyle = useAnimatedStyle(() => ({
      opacity: interpolate(dragProgress.value, [0, 1], [MIDDLE_OPACITY, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            dragProgress.value,
            [0, 1],
            [MIDDLE_TRANSLATE_Y, 0],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(dragProgress.value, [0, 1], [MIDDLE_SCALE, 1], Extrapolation.CLAMP),
        },
      ],
    }));

    const passBadgeStyle = useAnimatedStyle(() => ({
      opacity: interpolate(dragX.value, [-swipeThreshold, -24, 0], [1, 0.25, 0], Extrapolation.CLAMP),
    }), [swipeThreshold]);

    const likeBadgeStyle = useAnimatedStyle(() => ({
      opacity: interpolate(dragX.value, [0, 24, swipeThreshold], [0, 0.25, 1], Extrapolation.CLAMP),
    }), [swipeThreshold]);

    return (
      <View style={styles.deck}>
        {showEmptyStateOnly ? (
          <View pointerEvents="box-none" style={styles.layer}>
            <EmptyStateLayer emptyState={emptyState} />
          </View>
        ) : null}

        {!showEmptyStateOnly && baseItem ? (
          <Animated.View pointerEvents="none" style={[styles.layer, baseCardStyle]}>
            {baseItem.node}
          </Animated.View>
        ) : null}

        {!showEmptyStateOnly && showEmptyStatePreview ? (
          <Animated.View pointerEvents="none" style={[styles.layer, emptyPreviewStyle]}>
            <EmptyStateLayer emptyState={emptyState} />
          </Animated.View>
        ) : null}

        {middleItem ? (
          <Animated.View pointerEvents="none" style={[styles.layer, middleCardStyle]}>
            {middleItem.node}
          </Animated.View>
        ) : null}

        {topItem ? (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.layer, topCardStyle]}>
              {topItem.node}
              <Animated.View pointerEvents="none" style={[styles.choiceBadge, styles.choiceBadgeCenter, passBadgeStyle]}>
                <Animated.Text style={styles.choiceBadgeText}>NOT NOW</Animated.Text>
              </Animated.View>
              <Animated.View pointerEvents="none" style={[styles.choiceBadge, styles.choiceBadgeCenter, styles.choiceBadgePositive, likeBadgeStyle]}>
                <Animated.Text style={styles.choiceBadgeText}>INTERESTED</Animated.Text>
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        ) : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  deck: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    top: spacing.xs,
    left: spacing.xs,
    right: spacing.xs,
    bottom: spacing.xs,
    overflow: 'hidden',
    borderRadius: radius.lg,
  },
  emptySurface: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyContent: {
    gap: spacing.lg,
  },
  choiceBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 172,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 24, 20, 0.4)',
  },
  choiceBadgeCenter: {
    transform: [{ translateX: -86 }, { translateY: -26 }, { rotate: '-6deg' }],
  },
  choiceBadgePositive: {
    backgroundColor: 'rgba(77, 124, 106, 0.44)',
  },
  choiceBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.surface,
    letterSpacing: 0.6,
  },
});
