import { useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SubscreenHeader } from '@/components/navigation/SubscreenHeader';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore } from '@/store/app-store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function generateStaticParams() {
  return [{ id: 'animal-zoo-sunday' }, { id: 'vasaparken-saturday' }];
}

export default function GroupDetailScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const families = useAppStore((state) => state.families);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);
  const respondToGroupPlayDateInvite = useAppStore((state) => state.respondToGroupPlayDateInvite);

  const groupPlayDate = groupPlayDates.find((entry) => entry.id === id);
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [24, 92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (!groupPlayDate) {
    return (
      <Screen header={<SubscreenHeader fallbackHref="/(tabs)/groups" title="Group" />}>
        <EmptyState
          title="Group not found"
          body="This group is no longer part of the demo state, so we could not open its detail view."
          actionLabel="Back to groups"
          onAction={() => router.replace('/(tabs)/groups')}
        />
      </Screen>
    );
  }

  const familyById = Object.fromEntries([
    [
      currentFamilyId,
      {
        parentName: draftProfile.parentName,
        avatarUrl: draftProfile.avatarUrl,
      },
    ],
    ...families.map((family) => [
      family.id,
      {
        parentName: family.parentName,
        avatarUrl: family.avatarUrl,
      },
    ]),
  ]);

  const attendees = groupPlayDate.attendeeFamilyIds
    .map((familyId) => ({
      id: familyId,
      ...familyById[familyId],
    }))
    .filter((family): family is { id: string; parentName: string; avatarUrl?: string } => Boolean(family?.parentName));

  const pendingInvitees = groupPlayDate.invitedFamilyIds
    .filter((familyId) => familyId !== currentFamilyId)
    .map((familyId) => ({
      id: familyId,
      ...familyById[familyId],
    }))
    .filter((family): family is { id: string; parentName: string; avatarUrl?: string } => Boolean(family?.parentName));

  const host = familyById[groupPlayDate.hostFamilyId];
  const isPendingInvite =
    groupPlayDate.status === 'invited' && groupPlayDate.invitedFamilyIds.includes(currentFamilyId);
  const statusLabel = isPendingInvite ? 'Invitation pending' : groupPlayDate.status === 'hosting' ? 'Hosting' : 'Going';

  return (
    <Screen
      header={<SubscreenHeader fallbackHref="/(tabs)/groups" title={groupPlayDate.title} titleOpacity={headerTitleOpacity} />}
      scroll
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{groupPlayDate.title}</Text>
        <Text style={styles.subtitle}>
          {groupPlayDate.locationName} · {groupPlayDate.dateLabel} · {groupPlayDate.timeLabel}
        </Text>
      </View>

      <Card>
        <View style={styles.identity}>
          <Avatar name={host?.parentName ?? 'Host'} imageUrl={host?.avatarUrl} />
          <View style={styles.identityText}>
            <Text style={styles.sectionTitle}>Hosted by {host?.parentName ?? 'a nearby parent'}</Text>
            <Text style={styles.body}>
              {groupPlayDate.area} · {groupPlayDate.ageRange}
            </Text>
          </View>
        </View>
        <View style={styles.filters}>
          <Chip label={statusLabel} />
          <Chip label={`${groupPlayDate.attendeeFamilyIds.length}/${groupPlayDate.capacity} families`} />
          {groupPlayDate.activityTags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
          {groupPlayDate.vibeTags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </View>
        {isPendingInvite ? (
          <Text style={styles.pendingCopy}>
            You can see who is confirmed and read the group chat before you decide. If you send a message now, the group
            will still see you as pending.
          </Text>
        ) : null}
        <Text style={styles.body}>{groupPlayDate.note}</Text>
        <View style={styles.actionStack}>
          <Button
            label="Open group chat"
            onPress={() => router.push({ pathname: '/group-chat/[groupId]', params: { groupId: groupPlayDate.id } })}
          />
          {isPendingInvite ? (
            <View style={styles.inlineActions}>
              <View style={styles.flex}>
                <Button
                  label="Decline"
                  variant="secondary"
                  onPress={() => {
                    router.replace('/(tabs)/groups');
                    respondToGroupPlayDateInvite(groupPlayDate.id, 'not-going');
                  }}
                />
              </View>
              <View style={styles.flex}>
                <Button label="Accept invite" onPress={() => respondToGroupPlayDateInvite(groupPlayDate.id, 'going')} />
              </View>
            </View>
          ) : null}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Who is coming</Text>
        <View style={styles.attendeeList}>
          {attendees.map((attendee) => (
            <View key={attendee.id} style={styles.attendeeRow}>
              <Avatar name={attendee.parentName} imageUrl={attendee.avatarUrl} size={40} />
              <View style={styles.attendeeText}>
                <Text style={styles.attendeeName}>{attendee.parentName}</Text>
                <Text style={styles.attendeeMeta}>{attendee.id === groupPlayDate.hostFamilyId ? 'Host' : 'Attending'}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {pendingInvitees.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Waiting on replies</Text>
          <View style={styles.attendeeList}>
            {pendingInvitees.map((invitee) => (
              <View key={invitee.id} style={styles.attendeeRow}>
                <Avatar name={invitee.parentName} imageUrl={invitee.avatarUrl} size={40} />
                <View style={styles.attendeeText}>
                  <Text style={styles.attendeeName}>{invitee.parentName}</Text>
                  <Text style={styles.attendeeMeta}>Invited</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  identityText: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  pendingCopy: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionStack: {
    gap: spacing.md,
  },
  inlineActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  attendeeList: {
    gap: spacing.md,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  attendeeText: {
    gap: spacing.xs,
  },
  attendeeName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  attendeeMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
