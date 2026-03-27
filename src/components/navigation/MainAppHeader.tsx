import { router } from 'expo-router';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { getActiveParent, useAppStore } from '@/store/app-store';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

type MainAppHeaderProps = {
  showProfileAction?: boolean;
  title?: string;
  titleOpacity?: Animated.AnimatedInterpolation<number> | Animated.Value;
};

export function MainAppHeader({ showProfileAction = false, title, titleOpacity }: MainAppHeaderProps) {
  const draftProfile = useAppStore((state) => state.draftProfile);
  const activeParent = getActiveParent(draftProfile);

  return (
    <View style={styles.container}>
      {title ? (
        <View pointerEvents="none" style={styles.titleWrap}>
          <Animated.Text numberOfLines={1} style={[styles.title, titleOpacity ? { opacity: titleOpacity } : null]}>
            {title}
          </Animated.Text>
        </View>
      ) : null}
      {showProfileAction ? (
        <Pressable
          accessibilityLabel="Open profile"
          accessibilityRole="button"
          onPress={() => router.push('/(tabs)/me')}
          style={({ pressed }) => [styles.avatarAction, pressed ? styles.pressed : null]}
        >
          <Avatar name={activeParent?.firstName ?? 'Parent'} imageUrl={activeParent?.avatarUrl} size={42} />
        </Pressable>
      ) : (
        <View style={styles.sideSpacer} />
      )}
      <View style={styles.sideSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    position: 'absolute',
    left: 64,
    right: 64,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  avatarAction: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    backgroundColor: colors.surface,
  },
  sideSpacer: {
    width: 42,
    height: 42,
  },
  pressed: {
    opacity: 0.84,
  },
});
