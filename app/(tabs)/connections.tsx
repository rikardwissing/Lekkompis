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
  getActiveLikedFamilyIds,
  getActiveMatchedFamilyIds,
  getActiveParent,
  getLinkedParentMatchedFamilyIds,
  getPrimaryParent,
  useAppStore,
} from '@/store/app-store';
import {
  getConversationThreads,
  getMatchedFamilies,
  getPendingFamilies,
  getUpcomingBirthdayEventsForFamily,
} from '@/store/derived';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function ConnectionsScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const directConversationLastSeenAtByParent = useAppStore((state) => state.directConversationLastSeenAtByParent);
  const groupConversationLastSeenAtByParent = useAppStore((state) => state.groupConversationLastSeenAtByParent);
  const matchedFamilyIdsByParent = useAppStore((state) => state.matchedFamilyIdsByParent);
  const likedFamilyIdsByParent = useAppStore((state) => state.likedFamilyIdsByParent);
  const families = useAppStore((state) => state.families);
  const messagesByMatch = useAppStore((state) => state.messagesByMatch);
  const groupMessagesByPlayDate = useAppStore((state) => state.groupMessagesByPlayDate);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);
  const likeFamily = useAppStore((state) => state.likeFamily);
  const activeParent = getActiveParent(draftProfile);
  const matchedFamilyIds = getActiveMatchedFamilyIds(draftProfile, matchedFamilyIdsByParent);
  const likedFamilyIds = getActiveLikedFamilyIds(draftProfile, likedFamilyIdsByParent);
  const linkedParentMatchedFamilyIds = getLinkedParentMatchedFamilyIds(draftProfile, matchedFamilyIdsByParent);

  const matchedFamilies = useMemo(
    () => getMatchedFamilies(families, matchedFamilyIds),
    [families, matchedFamilyIds]
  );
  const pendingFamilies = useMemo(
    () => getPendingFamilies(families, likedFamilyIds, matchedFamilyIds),
    [families, likedFamilyIds, matchedFamilyIds]
  );
  const threads = useMemo(
    () =>
      getConversationThreads({
        currentFamilyId,
        draftProfile,
        directConversationLastSeenAtByParent,
        matchedFamilyIdsByParent,
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
      matchedFamilyIdsByParent,
      messagesByMatch,
    ]
  );
  const linkedConnectionFamilies = useMemo(
    () =>
      getMatchedFamilies(families, linkedParentMatchedFamilyIds).filter(
        (family) => !matchedFamilyIds.includes(family.id)
      ),
    [families, linkedParentMatchedFamilyIds, matchedFamilyIds]
  );
  const linkedOwnerNamesByFamilyId = useMemo(
    () =>
      Object.fromEntries(
        linkedConnectionFamilies.map((family) => {
          const ownerNames = draftProfile.parents
            .filter((parent) => parent.status === 'active' && parent.id !== activeParent?.id)
            .filter((parent) => (matchedFamilyIdsByParent[parent.id] ?? []).includes(family.id))
            .map((parent) => parent.firstName);

          return [family.id, ownerNames];
        })
      ),
    [activeParent?.id, draftProfile.parents, linkedConnectionFamilies, matchedFamilyIdsByParent]
  );
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [24, 92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Screen
      header={<MainAppHeader title="Connections" titleOpacity={headerTitleOpacity} />}
      scroll
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Connections</Text>
        <Text style={styles.subtitle}>
          Mutual matches and pending interest stay separate from active conversations. You can also pull another linked parent’s connections into your own account.
        </Text>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Mutual matches</Text>
        {matchedFamilies.length > 0 ? (
          <View style={styles.stack}>
            {matchedFamilies.map((family) => {
              const publicParent = getPrimaryParent(family);
              const hasThread = threads.some((thread) => thread.route === `/chat/${family.id}-match`);
              const familyBirthdayNote = getUpcomingBirthdayEventsForFamily(family)[0]?.label;

              return (
                <Card key={family.id}>
                  <View style={styles.identity}>
                    <Avatar name={publicParent?.firstName ?? 'Parent'} imageUrl={publicParent?.avatarUrl} />
                    <View style={styles.identityText}>
                      <Text style={styles.cardTitle}>{publicParent?.firstName ?? 'Parent'}</Text>
                      <Text style={styles.body}>
                        Mutual match in {family.area}. {family.meetupNote}
                      </Text>
                      {familyBirthdayNote ? <Text style={styles.birthdayNote}>{familyBirthdayNote}</Text> : null}
                    </View>
                  </View>
                  <Button
                    label={hasThread ? 'Open chat' : 'Start chat'}
                    onPress={() => router.push(`/chat/${family.id}-match`)}
                  />
                </Card>
              );
            })}
          </View>
        ) : (
          <EmptyState
            title="No mutual matches yet"
            body="Like a few nearby families and your mutual connections will show up here once they match back."
            actionLabel="Browse discover"
            onAction={() => router.push('/(tabs)/discover')}
          />
        )}
      </View>

      {linkedConnectionFamilies.length > 0 ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Linked parent connections</Text>
          <View style={styles.stack}>
            {linkedConnectionFamilies.map((family) => {
              const publicParent = getPrimaryParent(family);
              const ownerNames = linkedOwnerNamesByFamilyId[family.id] ?? [];
              const ownerLabel =
                ownerNames.length === 1
                  ? ownerNames[0]
                  : ownerNames.length > 1
                    ? `${ownerNames.slice(0, -1).join(', ')} and ${ownerNames[ownerNames.length - 1]}`
                    : 'another parent';

              return (
                <Card key={`linked-${family.id}`}>
                  <View style={styles.identity}>
                    <Avatar name={publicParent?.firstName ?? 'Parent'} imageUrl={publicParent?.avatarUrl} />
                    <View style={styles.identityText}>
                      <Text style={styles.cardTitle}>{publicParent?.firstName ?? 'Parent'}</Text>
                      <Text style={styles.body}>
                        Already connected by {ownerLabel}. Add this parent to your own account to join the direct thread as {activeParent?.firstName ?? 'yourself'}.
                      </Text>
                    </View>
                  </View>
                  <Button label="Add to my account" onPress={() => likeFamily(family.id)} />
                </Card>
              );
            })}
          </View>
        </View>
      ) : null}

      {pendingFamilies.length > 0 ? (
        <Card>
          <Text style={styles.sectionTitle}>Pending interest</Text>
          <View style={styles.pendingList}>
            {pendingFamilies.map((family) => {
              const publicParent = getPrimaryParent(family);
              return (
                <View key={family.id} style={styles.pendingRow}>
                  <Avatar name={publicParent?.firstName ?? 'Parent'} imageUrl={publicParent?.avatarUrl} size={40} />
                <Text style={styles.pendingItem}>
                    {publicParent?.firstName ?? 'Parent'} in {family.area}
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
