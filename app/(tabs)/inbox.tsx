import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MainAppHeader } from '@/components/navigation/MainAppHeader';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
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
  const matchedAtByMatchId = useAppStore((state) => state.matchedAtByMatchId);
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
        matchedAtByMatchId,
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
      matchedAtByMatchId,
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
          ? 'Group threads'
          : 'Latest activity';
  const filterCaption =
    activeFilter === 'unread'
      ? 'Threads that still need your attention.'
      : activeFilter === 'direct'
        ? 'One-to-one chats and fresh mutual matches.'
        : activeFilter === 'groups'
          ? 'Group chats and pending invitations.'
          : 'All fresh matches, direct chats, and group conversations, newest activity first.';

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
        <Text style={styles.subtitle}>Mutual matches, direct chats, and group threads stay together here once things start moving.</Text>
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
              description="Direct chats"
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
                <Text style={styles.unreadPillText}>{unreadThreadCount} unread</Text>
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
      ) : null}

      {threads.length === 0 ? (
        <EmptyState
          title="Nothing in inbox yet"
          body="Browse nearby parents or public events, and this is where new mutual matches and conversations will start to show up."
          actionLabel="Open discover"
          onAction={() => router.push('/(tabs)/discover')}
        />
      ) : null}
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
    alignItems: 'center',
    gap: spacing.md,
  },
  listIntroCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionCaption: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  unreadPill: {
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  unreadPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  listStack: {
    gap: spacing.md,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStackItem: {
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarOverlap: {
    marginLeft: -12,
  },
  avatarOverflow: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  avatarOverflowText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  threadRow: {
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  threadRowUnread: {
    borderColor: colors.primarySoft,
    backgroundColor: '#FCFEFC',
  },
  threadPrimaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  threadCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  threadHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  threadHeaderMeta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  threadTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  threadTitleUnread: {
    color: colors.primary,
  },
  threadTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  threadTimeUnread: {
    color: colors.primary,
    fontWeight: '700',
  },
  unreadBadge: {
    minWidth: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.surface,
  },
  threadMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  threadBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  directBadge: {
    backgroundColor: '#E7F4EA',
  },
  groupBadge: {
    backgroundColor: '#F2ECFF',
  },
  pendingBadge: {
    backgroundColor: colors.primarySoft,
  },
  threadBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  directBadgeText: {
    color: colors.primary,
  },
  groupBadgeText: {
    color: '#6A4FBF',
  },
  pendingBadgeText: {
    color: colors.primary,
  },
  threadSubtitleWrap: {
    flex: 1,
  },
  threadSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  threadPreview: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  threadPreviewUnread: {
    color: colors.text,
  },
  filteredEmptyState: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  filteredEmptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  filteredEmptyBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
