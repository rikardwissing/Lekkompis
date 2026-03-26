import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { router } from 'expo-router';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { getActiveParent, useAppStore } from '@/store/app-store';
import { getConversationThreads, getUnreadConversationThreadCount } from '@/store/derived';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

type MainAppHeaderProps = {
  title?: string;
  titleOpacity?: Animated.AnimatedInterpolation<number> | Animated.Value;
};

const formatBadgeCount = (count: number) => (count > 9 ? '9+' : `${count}`);

export function MainAppHeader({ title, titleOpacity }: MainAppHeaderProps) {
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const directConversationLastSeenAtByParent = useAppStore((state) => state.directConversationLastSeenAtByParent);
  const matchedParentIdsByParent = useAppStore((state) => state.matchedParentIdsByParent);
  const groupConversationLastSeenAtByParent = useAppStore((state) => state.groupConversationLastSeenAtByParent);
  const families = useAppStore((state) => state.families);
  const messagesByMatch = useAppStore((state) => state.messagesByMatch);
  const groupMessagesByPlayDate = useAppStore((state) => state.groupMessagesByPlayDate);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);
  const activeParent = getActiveParent(draftProfile);
  const unreadConversationCount = useMemo(
    () =>
      getUnreadConversationThreadCount(
        getConversationThreads({
          currentFamilyId,
          draftProfile,
          directConversationLastSeenAtByParent,
          matchedParentIdsByParent,
          groupConversationLastSeenAtByParent,
          families,
          messagesByMatch,
          groupMessagesByPlayDate,
          groupPlayDates,
        })
      ),
    [
      currentFamilyId,
      directConversationLastSeenAtByParent,
      draftProfile,
      families,
      groupConversationLastSeenAtByParent,
      groupMessagesByPlayDate,
      groupPlayDates,
      matchedParentIdsByParent,
      messagesByMatch,
    ]
  );
  const conversationAccessibilityLabel =
    unreadConversationCount > 0
      ? `Open conversations. ${unreadConversationCount} thread${unreadConversationCount === 1 ? '' : 's'} need attention.`
      : 'Open conversations';

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
        <Avatar name={activeParent?.firstName ?? 'Parent'} imageUrl={activeParent?.avatarUrl} size={42} />
      </Pressable>
      <View style={styles.spacer} />
      <Pressable
        accessibilityLabel={conversationAccessibilityLabel}
        accessibilityRole="button"
        onPress={() => router.push('/conversations')}
        style={({ pressed }) => [styles.inboxAction, pressed ? styles.pressed : null]}
      >
        <View style={styles.inboxIconWrap}>
          <Ionicons color={colors.primary} name="chatbubble-ellipses-outline" size={22} />
          {unreadConversationCount > 0 ? (
            <View style={styles.inboxBadge}>
              <Text style={styles.inboxBadgeText}>{formatBadgeCount(unreadConversationCount)}</Text>
            </View>
          ) : null}
        </View>
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
  inboxIconWrap: {
    position: 'relative',
  },
  inboxBadge: {
    position: 'absolute',
    top: -8,
    right: -10,
    minWidth: 20,
    height: 20,
    borderRadius: radius.pill,
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inboxBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.surface,
  },
});
