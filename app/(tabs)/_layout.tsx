import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useAppStore } from '@/store/app-store';
import { getConversationThreads, getGroupAttentionCount, getUnreadConversationThreadCount } from '@/store/derived';
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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          backgroundColor: 'rgba(12, 24, 42, 0.72)',
          borderTopColor: 'rgba(255, 255, 255, 0.12)',
          position: 'absolute',
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
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: renderTabIcon('heart-outline', 'heart'),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: renderTabIcon('chatbubble-ellipses-outline', 'chatbubble-ellipses'),
          tabBarBadge: unreadConversationCount > 0 ? formatBadgeCount(unreadConversationCount) : undefined,
          tabBarBadgeStyle: unreadConversationCount > 0 ? styles.tabBadge : undefined,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: renderTabIcon('calendar-clear-outline', 'calendar-clear'),
          tabBarBadge: groupAttentionCount > 0 ? formatBadgeCount(groupAttentionCount) : undefined,
          tabBarBadgeStyle: groupAttentionCount > 0 ? styles.tabBadge : undefined,
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
    color: '#062742',
    fontSize: 11,
    fontWeight: '700',
  },
});
