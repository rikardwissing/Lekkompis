import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MainAppHeader } from '@/components/navigation/MainAppHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore, type ConversationThread } from '@/store/app-store';
import {
  formatConversationActivity,
  getConversationThreads,
  getUnreadConversationThreadCount,
} from '@/store/derived';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

type ConversationFilter = 'unread' | 'direct' | 'groups';

function ConversationAvatarCluster({ thread }: { thread: ConversationThread }) {
  const visibleNames = thread.avatarNames.slice(0, thread.kind === 'direct' ? 1 : 2);
  const visibleUrls = thread.avatarUrls.slice(0, thread.kind === 'direct' ? 1 : 2);
  const overflowCount = Math.max(thread.participantCount - visibleNames.length, 0);

  if (thread.kind === 'direct') {
    return <Avatar name={visibleNames[0] ?? thread.title} imageUrl={visibleUrls[0]} size={54} />;
  }

  return (
    <View style={styles.avatarStack}>
      {visibleNames.map((name, index) => (
        <View key={`${thread.id}-${name}-${index}`} style={[styles.avatarStackItem, index > 0 ? styles.avatarOverlap : null]}>
          <Avatar name={name} imageUrl={visibleUrls[index]} size={42} />
        </View>
      ))}
      {overflowCount > 0 ? (
        <View style={[styles.avatarStackItem, styles.avatarOverflow, visibleNames.length > 0 ? styles.avatarOverlap : null]}>
          <Text style={styles.avatarOverflowText}>+{overflowCount}</Text>
        </View>
      ) : null}
    </View>
  );
}

function ConversationFilterCard({
  active,
  count,
  description,
  label,
  onPress,
}: {
  active: boolean;
  count: number;
  description: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.filterCard, active ? styles.filterCardActive : null, pressed ? styles.pressed : null]}>
      <View style={styles.filterCardTopRow}>
        <Text style={[styles.filterCardCount, active ? styles.filterCardCountActive : null]}>{count}</Text>
        {active ? <Ionicons color={colors.primary} name="checkmark-circle" size={18} /> : null}
      </View>
      <Text style={[styles.filterCardLabel, active ? styles.filterCardLabelActive : null]}>{label}</Text>
      <Text numberOfLines={1} style={styles.filterCardDescription}>
        {description}
      </Text>
    </Pressable>
  );
}

function ConversationListRow({ thread }: { thread: ConversationThread }) {
  const isUnread = thread.unreadCount > 0;
  const badgeContainerStyle =
    thread.badgeTone === 'pending'
      ? styles.pendingBadge
      : thread.badgeTone === 'group'
        ? styles.groupBadge
        : styles.directBadge;
  const badgeTextStyle =
    thread.badgeTone === 'pending'
      ? styles.pendingBadgeText
      : thread.badgeTone === 'group'
        ? styles.groupBadgeText
        : styles.directBadgeText;

  return (
    <Pressable onPress={() => router.push(thread.route as never)} style={({ pressed }) => [styles.threadRow, isUnread ? styles.threadRowUnread : null, pressed ? styles.pressed : null]}>
      <View style={styles.threadPrimaryRow}>
        <ConversationAvatarCluster thread={thread} />
        <View style={styles.threadCopy}>
          <View style={styles.threadHeaderRow}>
            <Text numberOfLines={1} style={[styles.threadTitle, isUnread ? styles.threadTitleUnread : null]}>
              {thread.title}
            </Text>
            <View style={styles.threadHeaderMeta}>
              <Text style={[styles.threadTime, isUnread ? styles.threadTimeUnread : null]}>
                {formatConversationActivity(thread.lastActivityAt)}
              </Text>
              {isUnread ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{thread.unreadCount > 9 ? '9+' : thread.unreadCount}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.threadMetaRow}>
            <View style={[styles.threadBadge, badgeContainerStyle]}>
              <Text style={[styles.threadBadgeText, badgeTextStyle]}>{thread.badgeLabel}</Text>
            </View>
            <View style={styles.threadSubtitleWrap}>
              <Text ellipsizeMode="tail" numberOfLines={1} style={styles.threadSubtitle}>
                {thread.subtitle}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <Text numberOfLines={2} style={[styles.threadPreview, isUnread ? styles.threadPreviewUnread : null]}>
        {thread.lastMessagePreview}
      </Text>
    </Pressable>
  );
}

export default function InboxScreen() {
  const [activeFilter, setActiveFilter] = useState<ConversationFilter | null>(null);
  const scrollY = useState(() => new Animated.Value(0))[0];
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const directConversationLastSeenAtByParent = useAppStore((state) => state.directConversationLastSeenAtByParent);
  const matchedParentIdsByParent = useAppStore((state) => state.matchedParentIdsByParent);
  const groupConversationLastSeenAtByParent = useAppStore((state) => state.groupConversationLastSeenAtByParent);
  const families = useAppStore((state) => state.families);
  const messagesByMatch = useAppStore((state) => state.messagesByMatch);
  const groupMessagesByPlayDate = useAppStore((state) => state.groupMessagesByPlayDate);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);

  const threads = useMemo(
    () =>
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
      }),
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

  const unreadThreadCount = getUnreadConversationThreadCount(threads);
  const directThreadCount = threads.filter((thread) => thread.kind === 'direct').length;
  const groupThreadCount = threads.length - directThreadCount;

  const filteredThreads = useMemo(() => {
    if (activeFilter === 'unread') {
      return threads.filter((thread) => thread.unreadCount > 0);
    }

    if (activeFilter === 'direct') {
      return threads.filter((thread) => thread.kind === 'direct');
    }

    if (activeFilter === 'groups') {
      return threads.filter((thread) => thread.kind === 'group');
    }

    return threads;
  }, [activeFilter, threads]);

  const toggleFilter = (nextFilter: ConversationFilter) => {
    setActiveFilter((currentFilter) => (currentFilter === nextFilter ? null : nextFilter));
  };
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [24, 92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const filterSummary =
    activeFilter === 'unread'
      ? 'Unread conversations'
      : activeFilter === 'direct'
        ? 'Direct chats'
        : activeFilter === 'groups'
          ? 'Group plans'
          : 'Latest activity';
  const filterCaption =
    activeFilter === 'unread'
      ? 'Threads that still need your attention.'
      : activeFilter === 'direct'
        ? 'One-to-one chats with matched parents.'
        : activeFilter === 'groups'
          ? 'Group plans and invitations in one stream.'
          : 'One running list, newest message first. Unread threads stay highlighted.';

  return (
    <Screen
      header={<MainAppHeader showProfileAction title="Inbox" titleOpacity={headerTitleOpacity} />}
      scroll
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
        <Text style={styles.subtitle}>Your direct parent chats and shared family group threads stay together here once plans start moving.</Text>
      </View>

      {threads.length > 0 ? (
        <View style={styles.sectionBlock}>
          <View style={styles.filterGrid}>
            <ConversationFilterCard
              active={activeFilter === 'unread'}
              count={unreadThreadCount}
              description="Needs attention"
              label="Unread"
              onPress={() => toggleFilter('unread')}
            />
            <ConversationFilterCard
              active={activeFilter === 'direct'}
              count={directThreadCount}
              description="1:1 chats"
              label="Direct"
              onPress={() => toggleFilter('direct')}
            />
            <ConversationFilterCard
              active={activeFilter === 'groups'}
              count={groupThreadCount}
              description="Plans and invites"
              label="Groups"
              onPress={() => toggleFilter('groups')}
            />
          </View>
          <View style={styles.listIntro}>
            <View style={styles.listIntroCopy}>
              <Text style={styles.sectionTitle}>{filterSummary}</Text>
              <Text style={styles.sectionCaption}>{filterCaption}</Text>
            </View>
            {activeFilter !== 'unread' && unreadThreadCount > 0 ? (
              <View style={styles.unreadPill}>
                <Text style={styles.unreadPillText}>
                  {unreadThreadCount} unread
                </Text>
              </View>
            ) : null}
          </View>
          {filteredThreads.length > 0 ? (
            <View style={styles.listStack}>
              {filteredThreads.map((thread) => (
                <ConversationListRow key={thread.id} thread={thread} />
              ))}
            </View>
          ) : (
            <View style={styles.filteredEmptyState}>
              <Text style={styles.filteredEmptyTitle}>Nothing in this filter right now</Text>
              <Text style={styles.filteredEmptyBody}>Tap the active summary box again to return to your full conversation list.</Text>
            </View>
          )}
        </View>
      ) : (
        <EmptyState
          title="No conversations yet"
          body="Start a direct chat from a mutual match or open a group invite and your inbox will begin filling up here."
          actionLabel="Open groups"
          onAction={() => router.push('/(tabs)/groups')}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.84,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  sectionBlock: {
    gap: spacing.md,
  },
  filterGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  filterCard: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterCardActive: {
    borderColor: colors.primarySoft,
    backgroundColor: '#FCFEFC',
  },
  filterCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterCardCount: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  filterCardCountActive: {
    color: colors.primary,
  },
  filterCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  filterCardLabelActive: {
    color: colors.primary,
  },
  filterCardDescription: {
    fontSize: 11,
    lineHeight: 14,
    color: colors.textMuted,
  },
  listIntro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  listIntroCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionCaption: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  unreadPill: {
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  unreadPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  listStack: {
    gap: spacing.sm,
  },
  filteredEmptyState: {
    gap: spacing.xs,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filteredEmptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  filteredEmptyBody: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStackItem: {
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.surface,
    overflow: 'hidden',
  },
  avatarOverlap: {
    marginLeft: -spacing.sm,
  },
  threadRow: {
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  threadPrimaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  threadRowUnread: {
    borderColor: colors.primarySoft,
    backgroundColor: '#FCFEFC',
  },
  avatarOverflow: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  avatarOverflowText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  threadCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  threadHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  threadHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  threadMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
    overflow: 'hidden',
  },
  threadTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  threadTitleUnread: {
    fontWeight: '700',
  },
  threadBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  directBadge: {
    backgroundColor: colors.surfaceMuted,
  },
  groupBadge: {
    backgroundColor: colors.primarySoft,
  },
  pendingBadge: {
    backgroundColor: colors.accentSoft,
  },
  threadBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  directBadgeText: {
    color: colors.secondary,
  },
  groupBadgeText: {
    color: colors.primary,
  },
  pendingBadgeText: {
    color: colors.accent,
  },
  threadSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    flexShrink: 1,
  },
  threadSubtitleWrap: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  threadPreview: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    paddingTop: spacing.xs,
  },
  threadPreviewUnread: {
    color: colors.text,
  },
  threadTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  threadTimeUnread: {
    color: colors.text,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.surface,
  },
});
