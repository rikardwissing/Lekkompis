import { PropsWithChildren, ReactNode } from 'react';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { Animated, KeyboardAvoidingView, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { spacing } from '@/theme/spacing';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  header?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  onScroll?: ((event: any) => void) | undefined;
}>;

export function Screen({ children, scroll = false, header, contentStyle, edges, onScroll }: ScreenProps) {
  const safeAreaEdges: Edge[] = edges ?? (header
    ? scroll
      ? ['top', 'left', 'right']
      : ['top', 'right', 'bottom', 'left']
    : ['top', 'right', 'bottom', 'left']);
  const content = (
    <View
      style={[
        styles.content,
        scroll ? styles.scrollContent : styles.fill,
        scroll && header ? styles.scrollContentWithHeader : null,
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
    backgroundColor: 'transparent',
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
