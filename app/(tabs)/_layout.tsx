import { useMemo } from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useAppStore } from '@/store/app-store';
import { getConversationThreads, getGroupAttentionCount, getUnreadConversationThreadCount } from '@/store/derived';
import { colors } from '@/theme/colors';

const formatBadgeCount = (count: number) => (count > 9 ? '9+' : `${count}`);

function TabBadge({ count }: { count: number }) {
  return <NativeTabs.Trigger.Badge hidden={count <= 0}>{count > 0 ? formatBadgeCount(count) : undefined}</NativeTabs.Trigger.Badge>;
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
      badgeBackgroundColor={colors.primary}
      badgeTextColor={colors.surface}
      backgroundColor="rgba(17, 24, 39, 0.66)"
      blurEffect="systemUltraThinMaterialDark"
      disableTransparentOnScrollEdge
      iconColor={{ default: 'rgba(226, 232, 240, 0.72)', selected: '#60a5fa' }}
      labelStyle={{
        default: { color: 'rgba(226, 232, 240, 0.72)', fontSize: 12, fontWeight: '600' },
        selected: { color: '#60a5fa', fontSize: 12, fontWeight: '700' },
      }}
      minimizeBehavior="onScrollDown"
      shadowColor="rgba(15, 23, 42, 0.35)"
      tintColor="#60a5fa"
    >
      <NativeTabs.Trigger name="discover">
        <NativeTabs.Trigger.Icon md="home" sf="house.fill" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="matches">
        <NativeTabs.Trigger.Icon md="favorite" sf="heart.fill" />
        <NativeTabs.Trigger.Label>Matches</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="inbox">
        <NativeTabs.Trigger.Icon md="chat" sf="bubble.left.and.bubble.right.fill" />
        <NativeTabs.Trigger.Label>Inbox</NativeTabs.Trigger.Label>
        <TabBadge count={unreadConversationCount} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="groups">
        <NativeTabs.Trigger.Icon md="group" sf="person.3.fill" />
        <NativeTabs.Trigger.Label>Groups</NativeTabs.Trigger.Label>
        <TabBadge count={groupAttentionCount} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger hidden name="me" />
      <NativeTabs.Trigger hidden name="connections" />
    </NativeTabs>
  );
}
