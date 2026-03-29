import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useAppStore } from '@/store/app-store';
import { getConversationThreads, getInboxAttentionCount, getPlansAttentionCount } from '@/store/derived';
import { colors } from '@/theme/colors';

type TabIconName = ComponentProps<typeof Ionicons>['name'];

const formatBadgeCount = (count: number) => (count > 9 ? '9+' : `${count}`);

function renderTabIcon(outlineIcon: TabIconName, filledIcon: TabIconName) {
  return ({ color, focused, size }: { color: string; focused: boolean; size: number }) => (
    <Ionicons color={color} name={focused ? filledIcon : outlineIcon} size={size} />
  );
}

export default function TabsLayout() {
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
  const inboxAttentionCount = useMemo(() => {
    const threads = getConversationThreads({
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
    });

    return getInboxAttentionCount(threads);
  }, [
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
  ]);
  const plansAttentionCount = useMemo(
    () =>
      getPlansAttentionCount({
        currentFamilyId,
        draftProfile,
        groupPlayDates,
      }),
    [
      currentFamilyId,
      draftProfile,
      families,
      groupPlayDates,
    ]
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: renderTabIcon('compass-outline', 'compass'),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: renderTabIcon('chatbubble-ellipses-outline', 'chatbubble-ellipses'),
          tabBarBadge: inboxAttentionCount > 0 ? formatBadgeCount(inboxAttentionCount) : undefined,
          tabBarBadgeStyle: inboxAttentionCount > 0 ? styles.tabBadge : undefined,
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Plans',
          tabBarIcon: renderTabIcon('calendar-clear-outline', 'calendar-clear'),
          tabBarBadge: plansAttentionCount > 0 ? formatBadgeCount(plansAttentionCount) : undefined,
          tabBarBadgeStyle: plansAttentionCount > 0 ? styles.tabBadge : undefined,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="connections"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: colors.primary,
    color: colors.surface,
    fontSize: 11,
    fontWeight: '700',
  },
});
