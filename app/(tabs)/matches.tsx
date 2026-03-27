import { useMemo, useRef } from 'react';
import { router } from 'expo-router';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { MainAppHeader } from '@/components/navigation/MainAppHeader';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  buildDirectMatchId,
  getActiveLikedParentIds,
  getActiveMatchedParentIds,
  getActiveParent,
  getFamilyByParentId,
  getLinkedParentMatchedParentIds,
  useAppStore,
} from '@/store/app-store';
import {
  getConversationThreads,
  getFamilyDistanceLabel,
  getUpcomingBirthdayEventsForFamily,
} from '@/store/derived';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatDueMonthLabel } from '@/utils/birthdays';

export default function MatchesScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const directConversationLastSeenAtByParent = useAppStore((state) => state.directConversationLastSeenAtByParent);
  const groupConversationLastSeenAtByParent = useAppStore((state) => state.groupConversationLastSeenAtByParent);
  const matchedParentIdsByParent = useAppStore((state) => state.matchedParentIdsByParent);
  const likedParentIdsByParent = useAppStore((state) => state.likedParentIdsByParent);
  const families = useAppStore((state) => state.families);
  const messagesByMatch = useAppStore((state) => state.messagesByMatch);
  const groupMessagesByPlayDate = useAppStore((state) => state.groupMessagesByPlayDate);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);
  const likeParent = useAppStore((state) => state.likeParent);
  const activeParent = getActiveParent(draftProfile);
  const matchedParentIds = getActiveMatchedParentIds(draftProfile, matchedParentIdsByParent);
  const likedParentIds = getActiveLikedParentIds(draftProfile, likedParentIdsByParent);
  const linkedParentMatchedParentIds = getLinkedParentMatchedParentIds(draftProfile, matchedParentIdsByParent);

  const resolveParentEntry = useMemo(
    () => (parentId: string) => {
      const family = getFamilyByParentId(families, parentId);
      const parent = family?.parents.find((entry) => entry.id === parentId) ?? null;

      if (!family || !parent) {
        return null;
      }

      return { family, parent };
    },
    [families]
  );
  const matchedParents = useMemo(
    () => matchedParentIds.map(resolveParentEntry).filter((entry): entry is NonNullable<ReturnType<typeof resolveParentEntry>> => Boolean(entry)),
    [matchedParentIds, resolveParentEntry]
  );
  const pendingParents = useMemo(
    () =>
      likedParentIds
        .filter((parentId) => !matchedParentIds.includes(parentId))
        .map(resolveParentEntry)
        .filter((entry): entry is NonNullable<ReturnType<typeof resolveParentEntry>> => Boolean(entry)),
    [likedParentIds, matchedParentIds, resolveParentEntry]
  );
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
  const linkedConnectionParents = useMemo(
    () =>
      linkedParentMatchedParentIds
        .filter((parentId) => !matchedParentIds.includes(parentId))
        .map(resolveParentEntry)
        .filter((entry): entry is NonNullable<ReturnType<typeof resolveParentEntry>> => Boolean(entry)),
    [linkedParentMatchedParentIds, matchedParentIds, resolveParentEntry]
  );
  const linkedOwnerNamesByParentId = useMemo(
    () =>
      Object.fromEntries(
        linkedConnectionParents.map(({ parent }) => {
          const ownerNames = draftProfile.parents
            .filter((parent) => parent.status === 'active' && parent.id !== activeParent?.id)
            .filter((entry) => (matchedParentIdsByParent[entry.id] ?? []).includes(parent.id))
            .map((parent) => parent.firstName);

          return [parent.id, ownerNames];
        })
      ),
    [activeParent?.id, draftProfile.parents, linkedConnectionParents, matchedParentIdsByParent]
  );
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [24, 92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Screen
      header={<MainAppHeader showProfileAction title="Matches" titleOpacity={headerTitleOpacity} />}
      scroll
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.subtitle}>
          Mutual matches and pending interest stay separate from active chats. Each parent match stays distinct, even when two matches belong to the same family.
        </Text>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Mutual matches</Text>
        {matchedParents.length > 0 ? (
          <View style={styles.stack}>
            {matchedParents.map(({ family, parent }) => {
              const matchId = buildDirectMatchId(activeParent?.id ?? draftProfile.primaryParentId, parent.id);
              const hasThread = threads.some((thread) => thread.route === `/chat/${matchId}`);
              const familyBirthdayNote = getUpcomingBirthdayEventsForFamily(family)[0]?.label;
              const expectingNote = family.expecting ? formatDueMonthLabel(family.expecting.dueMonth) : null;
              const distanceLabel = getFamilyDistanceLabel(draftProfile, family);

              return (
                <Card key={parent.id}>
                  <View style={styles.identity}>
                    <Avatar name={parent.firstName} imageUrl={parent.avatarUrl} />
                    <View style={styles.identityText}>
                      <Text style={styles.cardTitle}>{parent.firstName}</Text>
                      <Text style={styles.body}>
                        Mutual match nearby. {parent.intro}
                      </Text>
                      <Text style={styles.birthdayNote}>{family.familySummary}</Text>
                      {distanceLabel ? <Text style={styles.birthdayNote}>{distanceLabel}</Text> : null}
                      {expectingNote ? <Text style={styles.birthdayNote}>{expectingNote}</Text> : null}
                      {familyBirthdayNote ? <Text style={styles.birthdayNote}>{familyBirthdayNote}</Text> : null}
                    </View>
                  </View>
                  <Button
                    label={hasThread ? 'Open chat' : 'Start chat'}
                    onPress={() => router.push(`/chat/${matchId}`)}
                  />
                </Card>
              );
            })}
          </View>
        ) : (
          <EmptyState
            title="No mutual matches yet"
            body="Like a few nearby parents and your mutual connections will show up here once they match back."
            actionLabel="Browse discover"
            onAction={() => router.push('/(tabs)/discover')}
          />
        )}
      </View>

      {linkedConnectionParents.length > 0 ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Linked parent matches</Text>
          <View style={styles.stack}>
            {linkedConnectionParents.map(({ family, parent }) => {
              const ownerNames = linkedOwnerNamesByParentId[parent.id] ?? [];
              const ownerLabel =
                ownerNames.length === 1
                  ? ownerNames[0]
                  : ownerNames.length > 1
                    ? `${ownerNames.slice(0, -1).join(', ')} and ${ownerNames[ownerNames.length - 1]}`
                    : 'another parent';

              return (
                <Card key={`linked-${parent.id}`}>
                  <View style={styles.identity}>
                    <Avatar name={parent.firstName} imageUrl={parent.avatarUrl} />
                    <View style={styles.identityText}>
                      <Text style={styles.cardTitle}>{parent.firstName}</Text>
                      <Text style={styles.body}>
                        Already matched by {ownerLabel}. Add this parent to your own account to join the direct thread as {activeParent?.firstName ?? 'yourself'}.
                      </Text>
                      <Text style={styles.birthdayNote}>{family.familySummary}</Text>
                    </View>
                  </View>
                  <Button label="Add to my account" onPress={() => likeParent(parent.id)} />
                </Card>
              );
            })}
          </View>
        </View>
      ) : null}

      {pendingParents.length > 0 ? (
        <Card>
          <Text style={styles.sectionTitle}>Pending interest</Text>
          <View style={styles.pendingList}>
            {pendingParents.map(({ family, parent }) => {
              return (
                <View key={parent.id} style={styles.pendingRow}>
                  <Avatar name={parent.firstName} imageUrl={parent.avatarUrl} size={40} />
                  <Text style={styles.pendingItem}>
                    {parent.firstName} nearby · {family.familySummary}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  sectionBlock: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  stack: {
    gap: spacing.md,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  identityText: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  pendingList: {
    gap: spacing.md,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pendingItem: {
    fontSize: 15,
    color: colors.text,
  },
  birthdayNote: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.primary,
  },
});
