import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MainAppHeader } from '@/components/navigation/MainAppHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { useAppStore } from '@/store/app-store';
import { getPlansItems, type PlansItem } from '@/store/derived';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

type PlansFilter = 'attention' | 'upcoming' | 'hosting';

function PlansSummaryCard({
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
    <Pressable onPress={onPress} style={({ pressed }) => [styles.summaryCard, active ? styles.summaryCardActive : null, pressed ? styles.pressed : null]}>
      <Text style={[styles.summaryValue, active ? styles.summaryValueActive : null]}>{count}</Text>
      <Text style={[styles.summaryLabel, active ? styles.summaryLabelActive : null]}>{label}</Text>
      <Text numberOfLines={1} style={styles.summaryDescription}>
        {description}
      </Text>
    </Pressable>
  );
}

function PlanListRow({ item }: { item: PlansItem }) {
  return (
    <Pressable onPress={() => router.push(item.route as never)} style={({ pressed }) => [styles.planRow, pressed ? styles.pressed : null]}>
      <View style={styles.planHeader}>
        <View style={styles.planTitleBlock}>
          <Text numberOfLines={1} style={styles.planTitle}>
            {item.title}
          </Text>
          <Text numberOfLines={2} style={styles.planSubtitle}>
            {item.subtitle}
          </Text>
        </View>
        <View style={[styles.kindBadge, item.kind === 'private' ? styles.privateBadge : styles.publicBadge]}>
          <Text style={[styles.kindBadgeText, item.kind === 'private' ? styles.privateBadgeText : styles.publicBadgeText]}>
            {item.kind === 'private' ? 'Private' : 'Public'}
          </Text>
        </View>
      </View>
      <View style={styles.planMetaRow}>
        <View style={[styles.statusBadge, item.attention ? styles.attentionBadge : null]}>
          <Text style={[styles.statusBadgeText, item.attention ? styles.attentionBadgeText : null]}>{item.statusLabel}</Text>
        </View>
        {item.hosting ? (
          <View style={styles.hostingBadge}>
            <Text style={styles.hostingBadgeText}>Hosting</Text>
          </View>
        ) : null}
      </View>
      <Text numberOfLines={2} style={styles.planNote}>
        {item.note}
      </Text>
    </Pressable>
  );
}

export default function PlansScreen() {
  const [activeFilter, setActiveFilter] = useState<PlansFilter | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);

  const planItems = useMemo(
    () =>
      getPlansItems({
        currentFamilyId,
        draftProfile,
        groupPlayDates,
      }),
    [currentFamilyId, draftProfile, groupPlayDates]
  );

  const attentionCount = planItems.filter((item) => item.attention).length;
  const upcomingCount = planItems.filter((item) => item.upcoming).length;
  const hostingCount = planItems.filter((item) => item.hosting).length;
  const filteredItems = useMemo(() => {
    if (activeFilter === 'attention') {
      return planItems.filter((item) => item.attention);
    }

    if (activeFilter === 'upcoming') {
      return planItems.filter((item) => item.upcoming);
    }

    if (activeFilter === 'hosting') {
      return planItems.filter((item) => item.hosting);
    }

    return planItems;
  }, [activeFilter, planItems]);
  const filterSummary =
    activeFilter === 'attention'
      ? 'Needs attention'
      : activeFilter === 'upcoming'
        ? 'Upcoming plans'
        : activeFilter === 'hosting'
          ? 'Hosting'
          : 'All plans';
  const filterCaption =
    activeFilter === 'attention'
      ? 'Items waiting on your response or review.'
      : activeFilter === 'upcoming'
        ? 'Confirmed plans already on the calendar.'
        : activeFilter === 'hosting'
          ? 'Plans you created or currently host.'
          : 'Every private and public plan available to this parent session.';
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [24, 92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const toggleFilter = (nextFilter: PlansFilter) => {
    setActiveFilter((current) => (current === nextFilter ? null : nextFilter));
  };

  return (
    <View style={styles.root}>
      <Screen
        contentStyle={styles.screenContent}
        header={<MainAppHeader showProfileAction title="Plans" titleOpacity={headerTitleOpacity} />}
        scroll
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Plans</Text>
          <Text style={styles.subtitle}>Create private meetups, host public plans, and keep every active plan in one place.</Text>
        </View>

        <View style={styles.summaryGrid}>
          <PlansSummaryCard
            active={activeFilter === 'attention'}
            count={attentionCount}
            description="Needs response"
            label="Attention"
            onPress={() => toggleFilter('attention')}
          />
          <PlansSummaryCard
            active={activeFilter === 'upcoming'}
            count={upcomingCount}
            description="Already confirmed"
            label="Upcoming"
            onPress={() => toggleFilter('upcoming')}
          />
          <PlansSummaryCard
            active={activeFilter === 'hosting'}
            count={hostingCount}
            description="You are leading"
            label="Hosting"
            onPress={() => toggleFilter('hosting')}
          />
        </View>

        {planItems.length > 0 ? (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <View style={styles.flex}>
                <Text style={styles.sectionTitle}>{filterSummary}</Text>
                <Text style={styles.sectionCaption}>{filterCaption}</Text>
              </View>
            </View>
            {filteredItems.length > 0 ? (
              <View style={styles.stack}>
                {filteredItems.map((item) => (
                  <PlanListRow key={`${item.kind}-${item.id}`} item={item} />
                ))}
              </View>
            ) : (
              <Card>
                <Text style={styles.emptyFilterTitle}>Nothing in this filter right now</Text>
                <Text style={styles.emptyFilterBody}>Tap the active summary card again to return to the full list.</Text>
              </Card>
            )}
          </View>
        ) : (
          <EmptyState
            title="No plans yet"
            body="Use the + button to create a private meetup or host a public plan."
          />
        )}
      </Screen>

      <Pressable
        accessibilityLabel="Create a new plan"
        accessibilityRole="button"
        onPress={() => router.push('/plan/create')}
        style={({ pressed }) => [styles.fab, pressed ? styles.fabPressed : null]}
      >
        <Ionicons color={colors.surface} name="add" size={28} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  pressed: {
    opacity: 0.84,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  header: {
    gap: spacing.xs,
  },
  screenContent: {
    paddingBottom: spacing.xxxl * 3,
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
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  flex: {
    flex: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  summaryCardActive: {
    borderColor: colors.primarySoft,
    backgroundColor: '#FCFEFC',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  summaryValueActive: {
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabelActive: {
    color: colors.primary,
  },
  summaryDescription: {
    fontSize: 11,
    lineHeight: 14,
    color: colors.textMuted,
  },
  sectionBlock: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionCaption: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  stack: {
    gap: spacing.md,
  },
  planRow: {
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  planTitleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  planSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  kindBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  privateBadge: {
    backgroundColor: '#E7F4EA',
  },
  publicBadge: {
    backgroundColor: colors.surfaceMuted,
  },
  kindBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  privateBadgeText: {
    color: colors.primary,
  },
  publicBadgeText: {
    color: colors.textMuted,
  },
  planMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusBadge: {
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  attentionBadge: {
    backgroundColor: colors.primarySoft,
  },
  attentionBadgeText: {
    color: colors.primary,
  },
  hostingBadge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  hostingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  planNote: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  emptyFilterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptyFilterBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xxl,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 10,
  },
});
