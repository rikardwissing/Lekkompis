import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useAppStore } from '@/store/app-store';
import { getGroupAttentionCount } from '@/store/derived';
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
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);
  const groupAttentionCount = useMemo(
    () => getGroupAttentionCount(groupPlayDates, currentFamilyId, draftProfile),
    [currentFamilyId, draftProfile, groupPlayDates]
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
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
        name="connections"
        options={{
          title: 'Connections',
          tabBarIcon: renderTabIcon('chatbubbles-outline', 'chatbubbles'),
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
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBadge: {
    backgroundColor: colors.primary,
    color: colors.surface,
    fontSize: 11,
    fontWeight: '700',
  },
});
