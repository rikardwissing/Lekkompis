import { PropsWithChildren, ReactNode, useMemo } from 'react';
import { useSegments } from 'expo-router';
import { SafeAreaView, type Edge, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Animated, KeyboardAvoidingView, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  header?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  onScroll?: ((event: any) => void) | undefined;
}>;

const TAB_BAR_PADDING = 64;

export function Screen({ children, scroll = false, header, contentStyle, edges, onScroll }: ScreenProps) {
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const isInTabs = segments.includes('(tabs)');

  const safeAreaEdges: Edge[] = edges ?? (header ? ['top', 'right', 'bottom', 'left'] : ['top', 'right', 'bottom', 'left']);

  const bottomPadding = useMemo(() => {
    if (!scroll) {
      return undefined;
    }

    if (!isInTabs) {
      return spacing.xxxl;
    }

    return TAB_BAR_PADDING + Math.max(insets.bottom, spacing.md);
  }, [insets.bottom, isInTabs, scroll]);

  const content = (
    <View
      style={[
        styles.content,
        scroll ? styles.scrollContent : styles.fill,
        scroll && header ? styles.scrollContentWithHeader : null,
        bottomPadding !== undefined ? { paddingBottom: bottomPadding } : null,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        {header ? <View style={styles.headerSlot}>{header}</View> : null}
        {scroll ? (
          <Animated.ScrollView
            contentContainerStyle={styles.scroll}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </Animated.ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  headerSlot: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  scroll: {
    flexGrow: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  scrollContentWithHeader: {
    paddingBottom: spacing.lg,
  },
});
