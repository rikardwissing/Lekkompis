import { useMemo } from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useAppStore } from '@/store/app-store';
import { getConversationThreads, getGroupAttentionCount, getUnreadConversationThreadCount } from '@/store/derived';
import { colors } from '@/theme/colors';

const formatBadgeCount = (count: number) => (count > 9 ? '9+' : `${count}`);

function InboxBadge({ count }: { count: number }) {
  return (
    <NativeTabs.Trigger.Badge hidden={count <= 0}>{count > 0 ? formatBadgeCount(count) : undefined}</NativeTabs.Trigger.Badge>
  );
}

function GroupsBadge({ count }: { count: number }) {
  return (
    <NativeTabs.Trigger.Badge hidden={count <= 0}>{count > 0 ? formatBadgeCount(count) : undefined}</NativeTabs.Trigger.Badge>
  );
}

export default function TabsLayout() {
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const directConversationLastSeenAtByParent = useAppStore((state) => state.directConversationLastSeenAtByParent);
  const matchedParentIdsByParent = useAppStore((state) => state.matchedParentIdsByParent);
  const groupConversationLastSeenAtByParent = useAppStore((state) => state.groupConversationLastSeenAtByParent);
  const families = useAppStore((state) => state.families);
  const messagesByMatch = useAppStore((state) => state.messagesByMatch);
  const groupMessagesByPlayDate = useAppStore((state) => state.groupMessagesByPlayDate);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);

  const groupAttentionCount = useMemo(
    () => getGroupAttentionCount(groupPlayDates, currentFamilyId, draftProfile),
    [currentFamilyId, draftProfile, groupPlayDates]
  );

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

  return (
    <NativeTabs
      backgroundColor="rgba(17, 24, 39, 0.70)"
      badgeBackgroundColor={colors.primary}
      badgeTextColor={colors.surface}
      blurEffect="systemUltraThinMaterialDark"
      disableTransparentOnScrollEdge
      iconColor={{ default: 'rgba(226, 232, 240, 0.72)', selected: '#60a5fa' }}
      labelStyle={{
        default: { color: 'rgba(226, 232, 240, 0.72)', fontSize: 12, fontWeight: '600' },
        selected: { color: '#60a5fa', fontSize: 12, fontWeight: '700' },
      }}
      shadowColor="rgba(15, 23, 42, 0.35)"
      tintColor="#60a5fa"
    >
      <NativeTabs.Trigger name="discover">
        <NativeTabs.Trigger.Icon md="travel_explore" sf={{ default: 'sparkles', selected: 'sparkles' }} />
        <NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="matches">
        <NativeTabs.Trigger.Icon md="favorite" sf={{ default: 'heart', selected: 'heart.fill' }} />
        <NativeTabs.Trigger.Label>Matches</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="inbox">
        <NativeTabs.Trigger.Icon md="chat" sf={{ default: 'bubble.left', selected: 'bubble.left.fill' }} />
        <NativeTabs.Trigger.Label>Inbox</NativeTabs.Trigger.Label>
        <InboxBadge count={unreadConversationCount} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="groups">
        <NativeTabs.Trigger.Icon md="event" sf={{ default: 'calendar', selected: 'calendar' }} />
        <NativeTabs.Trigger.Label>Groups</NativeTabs.Trigger.Label>
        <GroupsBadge count={groupAttentionCount} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger hidden name="me" />
      <NativeTabs.Trigger hidden name="connections" />
    </NativeTabs>
  );
}
