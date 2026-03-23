import { useMemo, useRef } from 'react';
import { router } from 'expo-router';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MainAppHeader } from '@/components/navigation/MainAppHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { getActiveParent, getPrimaryParent, useAppStore } from '@/store/app-store';
import {
  getGroupAttentionCount,
  getHostedRequestGroups,
  getPendingGroupJoinRequestCount,
  getPrivateInvitations,
  getUpcomingGroups,
} from '@/store/derived';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

export default function GroupsScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const families = useAppStore((state) => state.families);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);
  const respondToGroupPlayDateInvite = useAppStore((state) => state.respondToGroupPlayDateInvite);
  const approveGroupJoinRequest = useAppStore((state) => state.approveGroupJoinRequest);
  const declineGroupJoinRequest = useAppStore((state) => state.declineGroupJoinRequest);
  const activeParent = getActiveParent(draftProfile);
  const primaryParent = getPrimaryParent(draftProfile);

  const familyById = useMemo(
    () =>
      Object.fromEntries([
        [
          currentFamilyId,
          {
            id: currentFamilyId,
            parentName: primaryParent?.firstName ?? 'Parent',
            avatarUrl: primaryParent?.avatarUrl,
          },
        ],
        ...families.map((family) => {
          const publicParent = getPrimaryParent(family);
          return [
            family.id,
            {
              id: family.id,
              parentName: publicParent?.firstName ?? 'Parent',
              avatarUrl: publicParent?.avatarUrl,
            },
          ] as const;
        }),
      ]),
    [currentFamilyId, families, primaryParent]
  );

  const privateInvitations = useMemo(
    () => getPrivateInvitations(groupPlayDates, currentFamilyId, draftProfile),
    [currentFamilyId, draftProfile, groupPlayDates]
  );
  const requestGroups = useMemo(
    () => getHostedRequestGroups(groupPlayDates, currentFamilyId, draftProfile),
    [currentFamilyId, draftProfile, groupPlayDates]
  );
  const upcomingGroupPlayDates = useMemo(
    () => getUpcomingGroups(groupPlayDates, draftProfile),
    [draftProfile, groupPlayDates]
  );
  const pendingRequestCount = useMemo(
    () => getPendingGroupJoinRequestCount(groupPlayDates, currentFamilyId, draftProfile),
    [currentFamilyId, draftProfile, groupPlayDates]
  );
  const attentionCount = useMemo(
    () => getGroupAttentionCount(groupPlayDates, currentFamilyId, draftProfile),
    [currentFamilyId, draftProfile, groupPlayDates]
  );

  const summaryCards = [
    { label: 'Invitations', value: privateInvitations.length },
    { label: 'Requests', value: pendingRequestCount },
    { label: 'Upcoming', value: upcomingGroupPlayDates.length },
  ];
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [24, 92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Screen
      header={<MainAppHeader title="Groups" titleOpacity={headerTitleOpacity} />}
      scroll
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <Text style={styles.subtitle}>
          Host invite-only plans, review public join requests, and keep upcoming events together in one calm place.
          {activeParent ? ` Coordinating as ${activeParent.firstName}.` : ''}
        </Text>
        {attentionCount > 0 ? (
          <Text style={styles.pendingNote}>
            {attentionCount} pending item{attentionCount === 1 ? '' : 's'} waiting for your response.
          </Text>
        ) : null}
      </View>

      <Card>
        <Text style={styles.sectionTitle}>At a glance</Text>
        <View style={styles.summaryRow}>
          {summaryCards.map((item) => (
            <View key={item.label} style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{item.value}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Host something new</Text>
        <Text style={styles.body}>
          Create an invite-only plan for your matches or publish a public event that nearby parents can discover and request to join.
        </Text>
        <Button label="Host an event" onPress={() => router.push('/group/create')} />
      </Card>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Invitations</Text>
        {privateInvitations.length > 0 ? (
          <View style={styles.stack}>
            {privateInvitations.map((groupPlayDate) => {
              const hostFamily = familyById[groupPlayDate.hostFamilyId];
              const attendeeNames = groupPlayDate.attendeeFamilyIds
                .map((familyId) => familyById[familyId]?.parentName)
                .filter((name): name is string => Boolean(name));

              return (
                <View key={groupPlayDate.id} style={styles.invitationCard}>
                  <Pressable
                    onPress={() => router.push({ pathname: '/group/[id]', params: { id: groupPlayDate.id } })}
                    style={({ pressed }) => [styles.invitationSurface, pressed ? styles.pressed : null]}
                  >
                    <View style={[styles.accentLine, styles.invitationAccentLine]} />
                    <View style={styles.metaRow}>
                      <Text style={styles.eventMeta}>
                        {groupPlayDate.dateLabel} · {groupPlayDate.timeLabel}
                      </Text>
                      <Chip label="Invite-only" />
                    </View>
                    <Text style={styles.cardTitle}>{groupPlayDate.title}</Text>
                    <Text style={styles.body}>
                      Hosted by {hostFamily?.parentName ?? 'a nearby parent'} · {groupPlayDate.locationName} · {groupPlayDate.area}
                    </Text>
                    <Text numberOfLines={2} style={styles.supportingCopy}>
                      {groupPlayDate.note}
                    </Text>
                    <View style={styles.chips}>
                      <Chip label={groupPlayDate.ageRange} />
                      <Chip label={`${groupPlayDate.attendeeFamilyIds.length}/${groupPlayDate.capacity} families`} />
                    </View>
                    {attendeeNames.length > 0 ? (
                      <Text style={styles.attendeeCopy}>Already in: {attendeeNames.join(', ')}</Text>
                    ) : null}
                  </Pressable>
                  <View style={styles.actionStack}>
                    <View style={styles.formActions}>
                      <View style={styles.flex}>
                        <Button
                          label="Open chat"
                          variant="secondary"
                          onPress={() =>
                            router.push({ pathname: '/group-chat/[groupId]', params: { groupId: groupPlayDate.id } })
                          }
                        />
                      </View>
                      <View style={styles.flex}>
                        <Button label="Accept invite" onPress={() => respondToGroupPlayDateInvite(groupPlayDate.id, 'going')} />
                      </View>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => respondToGroupPlayDateInvite(groupPlayDate.id, 'not-going')}
                      style={({ pressed }) => [styles.linkAction, pressed ? styles.pressed : null]}
                    >
                      <Text style={styles.linkActionText}>Decline invite</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState title="No invitations right now" body="Private invites from other families will land here before they move into your upcoming list." />
        )}
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Requests</Text>
        {requestGroups.length > 0 ? (
          <View style={styles.stack}>
            {requestGroups.map((groupPlayDate) => (
              <Card key={groupPlayDate.id}>
                <View style={styles.requestHeader}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{groupPlayDate.title}</Text>
                    <Text style={styles.requestMeta}>
                      {groupPlayDate.dateLabel} · {groupPlayDate.timeLabel} · {groupPlayDate.locationName}
                    </Text>
                  </View>
                  <Chip label={`${groupPlayDate.pendingRequestFamilyIds.length} waiting`} />
                </View>
                <View style={styles.requestList}>
                  {groupPlayDate.pendingRequestFamilyIds.map((familyId) => {
                    const requester = familyById[familyId];

                    if (!requester) {
                      return null;
                    }

                    return (
                      <View key={`${groupPlayDate.id}-${familyId}`} style={styles.requestRow}>
                        <View style={styles.requestIdentity}>
                          <Avatar imageUrl={requester.avatarUrl} name={requester.parentName} size={40} />
                          <View style={styles.requestCopy}>
                            <Text style={styles.requestName}>{requester.parentName}</Text>
                            <Text style={styles.requestMeta}>Requested to join this public event</Text>
                          </View>
                        </View>
                        <View style={styles.requestActions}>
                          <View style={styles.flex}>
                            <Button
                              label="Decline"
                              onPress={() => declineGroupJoinRequest(groupPlayDate.id, familyId)}
                              variant="secondary"
                            />
                          </View>
                          <View style={styles.flex}>
                            <Button label="Approve" onPress={() => approveGroupJoinRequest(groupPlayDate.id, familyId)} />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
                <Button
                  label="Open details"
                  onPress={() => router.push({ pathname: '/group/[id]', params: { id: groupPlayDate.id } })}
                  variant="secondary"
                />
              </Card>
            ))}
          </View>
        ) : (
          <EmptyState title="No join requests yet" body="When parents request to join one of your public events, you’ll review them here." />
        )}
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        {upcomingGroupPlayDates.length > 0 ? (
          <View style={styles.stack}>
            {upcomingGroupPlayDates.map((groupPlayDate) => {
              const hostFamily = familyById[groupPlayDate.hostFamilyId];
              const statusLabel = groupPlayDate.membership === 'hosting' ? 'Hosting' : 'Going';

              return (
                <Pressable
                  key={groupPlayDate.id}
                  onPress={() => router.push({ pathname: '/group/[id]', params: { id: groupPlayDate.id } })}
                  style={({ pressed }) => [styles.upcomingCard, pressed ? styles.pressed : null]}
                >
                  <View style={styles.accentLine} />
                  <View style={styles.metaRow}>
                    <Text style={styles.eventMeta}>
                      {groupPlayDate.dateLabel} · {groupPlayDate.timeLabel}
                    </Text>
                    <Chip label={statusLabel} />
                  </View>
                  <Text style={styles.cardTitle}>{groupPlayDate.title}</Text>
                  <Text style={styles.body}>
                    {groupPlayDate.locationName} · {groupPlayDate.area}
                  </Text>
                  <View style={styles.chips}>
                    <Chip label={groupPlayDate.visibility === 'public' ? 'Public' : 'Invite-only'} />
                    <Chip label={groupPlayDate.ageRange} />
                    <Chip label={`Hosted by ${hostFamily?.parentName ?? 'a nearby parent'}`} />
                  </View>
                  <Text numberOfLines={2} style={styles.supportingCopy}>
                    {groupPlayDate.note}
                  </Text>
                  <View style={styles.footerRow}>
                    <Text style={styles.attendeeCopy}>
                      {groupPlayDate.attendeeFamilyIds.length}/{groupPlayDate.capacity} families confirmed
                    </Text>
                    {groupPlayDate.visibility === 'public' && groupPlayDate.pendingRequestFamilyIds.length > 0 ? (
                      <Text style={styles.pendingMeta}>
                        {groupPlayDate.pendingRequestFamilyIds.length} request{groupPlayDate.pendingRequestFamilyIds.length === 1 ? '' : 's'} waiting
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <EmptyState title="No upcoming events" body="Accept an invitation or host something new and it will show up here." />
        )}
      </View>
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
  pendingNote: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  supportingCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  sectionBlock: {
    gap: spacing.md,
  },
  stack: {
    gap: spacing.lg,
  },
  invitationCard: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 2,
  },
  invitationSurface: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionStack: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  linkAction: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  linkActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  accentLine: {
    width: 48,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  invitationAccentLine: {
    backgroundColor: colors.accent,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  eventMeta: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  attendeeCopy: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  requestList: {
    gap: spacing.md,
  },
  requestRow: {
    gap: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  requestIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  requestCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  requestName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  requestMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  upcomingCard: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pendingMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  pressed: {
    opacity: 0.88,
  },
});
