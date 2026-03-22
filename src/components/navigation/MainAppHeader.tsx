import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { useAppStore } from '@/store/app-store';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

type MainAppHeaderProps = {
  title?: string;
  titleOpacity?: Animated.AnimatedInterpolation<number> | Animated.Value;
};

export function MainAppHeader({ title, titleOpacity }: MainAppHeaderProps) {
  const draftProfile = useAppStore((state) => state.draftProfile);

  return (
    <View style={styles.container}>
      {title ? (
        <View pointerEvents="none" style={styles.titleWrap}>
          <Animated.Text numberOfLines={1} style={[styles.title, titleOpacity ? { opacity: titleOpacity } : null]}>
            {title}
          </Animated.Text>
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/profile')}
        style={({ pressed }) => [styles.avatarAction, pressed ? styles.pressed : null]}
      >
        <Avatar name={draftProfile.parentName} imageUrl={draftProfile.avatarUrl} size={42} />
      </Pressable>
      <View style={styles.spacer} />
      <Pressable
        accessibilityLabel="Open conversations"
        accessibilityRole="button"
        onPress={() => router.push('/conversations')}
        style={({ pressed }) => [styles.inboxAction, pressed ? styles.pressed : null]}
      >
        <Ionicons color={colors.primary} name="chatbubble-ellipses-outline" size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
  pressed: {
    opacity: 0.84,
  },
  spacer: {
    flex: 1,
  },
  inboxAction: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
