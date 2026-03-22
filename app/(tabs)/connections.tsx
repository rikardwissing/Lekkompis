import { useMemo, useRef } from 'react';
import { router } from 'expo-router';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { MainAppHeader } from '@/components/navigation/MainAppHeader';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore } from '@/store/app-store';
import { getConversationThreads, getMatchedFamilies, getPendingFamilies } from '@/store/derived';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function ConnectionsScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const conversationLastSeenAt = useAppStore((state) => state.conversationLastSeenAt);
  const matchedFamilyIds = useAppStore((state) => state.matchedFamilyIds);
  const likedFamilyIds = useAppStore((state) => state.likedFamilyIds);
  const families = useAppStore((state) => state.families);
  const messagesByMatch = useAppStore((state) => state.messagesByMatch);
  const groupMessagesByPlayDate = useAppStore((state) => state.groupMessagesByPlayDate);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);

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
        conversationLastSeenAt,
        families,
        messagesByMatch,
        groupMessagesByPlayDate,
        groupPlayDates,
      }),
    [conversationLastSeenAt, currentFamilyId, draftProfile, families, groupMessagesByPlayDate, groupPlayDates, messagesByMatch]
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
        <Text style={styles.subtitle}>Mutual matches and pending interest stay separate from active conversations.</Text>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Mutual matches</Text>
        {matchedFamilies.length > 0 ? (
          <View style={styles.stack}>
            {matchedFamilies.map((family) => {
              const hasThread = threads.some((thread) => thread.route === `/chat/${family.id}-match`);

              return (
                <Card key={family.id}>
                  <View style={styles.identity}>
                    <Avatar name={family.parentName} imageUrl={family.avatarUrl} />
                    <View style={styles.identityText}>
                      <Text style={styles.cardTitle}>{family.parentName}</Text>
                      <Text style={styles.body}>
                        Mutual match in {family.area}. {family.meetupNote}
                      </Text>
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

      {pendingFamilies.length > 0 ? (
        <Card>
          <Text style={styles.sectionTitle}>Pending interest</Text>
          <View style={styles.pendingList}>
            {pendingFamilies.map((family) => (
              <View key={family.id} style={styles.pendingRow}>
                <Avatar name={family.parentName} imageUrl={family.avatarUrl} size={40} />
                <Text style={styles.pendingItem}>
                  {family.parentName} in {family.area}
                </Text>
              </View>
            ))}
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
});
