import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { colors } from '@/theme/colors';

type TabIconName = ComponentProps<typeof Ionicons>['name'];

function renderTabIcon(outlineIcon: TabIconName, filledIcon: TabIconName) {
  return ({ color, focused, size }: { color: string; focused: boolean; size: number }) => (
    <Ionicons color={color} name={focused ? filledIcon : outlineIcon} size={size} />
  );
}

export default function TabsLayout() {
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
        }}
      />
    </Tabs>
  );
}
