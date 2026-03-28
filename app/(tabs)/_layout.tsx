import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/app-store';
import { getConversationThreads, getGroupAttentionCount, getUnreadConversationThreadCount } from '@/store/derived';
import { colors } from '@/theme/colors';

type TabIcon = {
  active: keyof typeof Ionicons.glyphMap;
  inactive: keyof typeof Ionicons.glyphMap;
};

const TAB_ICONS: Record<string, TabIcon> = {
  discover: { active: 'compass', inactive: 'compass-outline' },
  matches: { active: 'heart', inactive: 'heart-outline' },
  inbox: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  groups: { active: 'calendar-clear', inactive: 'calendar-clear-outline' },
};

const formatBadgeCount = (count: number) => (count > 9 ? '9+' : `${count}`);

function LiquidTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const supportsLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

  const visibleRoutes = state.routes.filter((route) => TAB_ICONS[route.name]);

  const content = (
    <View style={[styles.barShell, { marginBottom: Math.max(insets.bottom, 12) }]}> 
      {visibleRoutes.map((route) => {
        const descriptor = descriptors[route.key];
        const options = descriptor.options;
        const focused = state.index === state.routes.findIndex((candidate) => candidate.key === route.key);
        const title = typeof options.title === 'string' ? options.title : route.name;
        const tabIcon = TAB_ICONS[route.name];
        const iconName = tabIcon ? (focused ? tabIcon.active : tabIcon.inactive) : 'ellipse-outline';

        const badge = typeof options.tabBarBadge === 'string' ? options.tabBarBadge : undefined;

        const onPress = () => {
          const event = navigation.emit({
            canPreventDefault: true,
            target: route.key,
            type: 'tabPress',
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            target: route.key,
            type: 'tabLongPress',
          });
        };

        return (
          <Pressable
            accessibilityLabel={options.tabBarAccessibilityLabel}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            key={route.key}
            onLongPress={onLongPress}
            onPress={onPress}
            style={({ pressed }) => [styles.tabButton, focused ? styles.tabButtonFocused : null, pressed ? styles.pressed : null]}
          >
            <Ionicons color={focused ? '#60a5fa' : 'rgba(226, 232, 240, 0.78)'} name={iconName} size={20} />
            <Text style={[styles.tabLabel, focused ? styles.tabLabelFocused : null]}>{title}</Text>
            {badge ? (
              <View style={styles.badgeBubble}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );

  if (supportsLiquidGlass) {
    return (
      <View pointerEvents="box-none" style={styles.outerWrap}>
        <GlassView colorScheme="dark" glassEffectStyle="regular" isInteractive style={styles.glassWrap} tintColor="rgba(17, 24, 39, 0.42)">
          {content}
        </GlassView>
      </View>
    );
  }

  return (
    <View pointerEvents="box-none" style={styles.outerWrap}>
      <View style={styles.fallbackWrap}>{content}</View>
    </View>
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
        sceneStyle: { backgroundColor: colors.background },
      }}
      tabBar={(props) => <LiquidTabBar {...props} />}
    >
      <Tabs.Screen name="discover" options={{ title: 'Home' }} />
      <Tabs.Screen name="matches" options={{ title: 'Inbox' }} />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Explore',
          tabBarBadge: unreadConversationCount > 0 ? formatBadgeCount(unreadConversationCount) : undefined,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Profile',
          tabBarBadge: groupAttentionCount > 0 ? formatBadgeCount(groupAttentionCount) : undefined,
        }}
      />
      <Tabs.Screen name="me" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="connections" options={{ tabBarButton: () => null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
  },
  glassWrap: {
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 36,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fallbackWrap: {
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    borderColor: 'rgba(148, 163, 184, 0.35)',
    borderRadius: 36,
    borderWidth: 1,
    overflow: 'hidden',
  },
  barShell: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 28,
    flex: 1,
    gap: 4,
    paddingVertical: 10,
    position: 'relative',
  },
  tabButtonFocused: {
    backgroundColor: 'rgba(148, 163, 184, 0.24)',
  },
  tabLabel: {
    color: 'rgba(226, 232, 240, 0.78)',
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelFocused: {
    color: '#60a5fa',
    fontWeight: '700',
  },
  badgeBubble: {
    backgroundColor: colors.primary,
    borderRadius: 9,
    minWidth: 18,
    paddingHorizontal: 5,
    position: 'absolute',
    right: 12,
    top: 6,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
});
