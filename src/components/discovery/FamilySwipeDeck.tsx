import { ReactNode } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type GestureResponderHandlers,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

type DeckCard = {
  key: string;
  node: ReactNode;
};

type FamilySwipeDeckProps = {
  cards: DeckCard[];
  leadingPreviewStyle?: StyleProp<ViewStyle>;
  overlayCard?: ReactNode | null;
  overlayCardStyle?: StyleProp<ViewStyle>;
  panHandlers?: GestureResponderHandlers;
  topCardStyle?: StyleProp<ViewStyle>;
};

export function FamilySwipeDeck({
  cards,
  leadingPreviewStyle,
  overlayCard,
  overlayCardStyle,
  panHandlers,
  topCardStyle,
}: FamilySwipeDeckProps) {
  const visibleCards = cards.slice(0, 3);

  return (
    <View style={styles.deck}>
      {visibleCards
        .map((card, index) => ({ card, index }))
        .reverse()
        .map(({ card, index }) => {
        const isTopCard = index === 0;
        const isLeadingPreview = index === 1;
        const scale = isLeadingPreview ? 0.985 : 0.965;
        const translateY = isLeadingPreview ? 10 : 18;
        const opacity = isLeadingPreview ? 0.42 : 0.26;

        return (
          <Animated.View
            key={card.key}
            pointerEvents={isTopCard ? 'auto' : 'none'}
            {...(isTopCard ? panHandlers : undefined)}
            style={[
              isTopCard ? styles.topCard : styles.previewCard,
              !isTopCard
                ? {
                    transform: [{ scale }, { translateY }],
                    opacity,
                  }
                : null,
              isTopCard ? topCardStyle : null,
              isLeadingPreview ? leadingPreviewStyle : null,
            ]}
          >
            {card.node}
          </Animated.View>
        );
      })}
      {overlayCard ? (
        <Animated.View pointerEvents="none" style={[styles.overlayCard, overlayCardStyle]}>
          {overlayCard}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  deck: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  previewCard: {
    ...StyleSheet.absoluteFillObject,
    top: spacing.sm,
    left: spacing.xs,
    right: spacing.xs,
    bottom: spacing.xs,
    overflow: 'hidden',
    borderRadius: radius.lg,
  },
  topCard: {
    flex: 1,
  },
  overlayCard: {
    ...StyleSheet.absoluteFillObject,
    top: spacing.xs,
    left: spacing.xs,
    right: spacing.xs,
    bottom: spacing.xs,
  },
});
