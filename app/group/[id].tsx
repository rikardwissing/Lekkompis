import { useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SubscreenHeader } from '@/components/navigation/SubscreenHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { getActiveParent, getPrimaryParent, useAppStore } from '@/store/app-store';
import { canActiveParentViewGroup, getGroupAudienceLabel, getGroupDistanceLabel, isGroupFull } from '@/store/derived';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function generateStaticParams() {
  return [
    { id: 'animal-zoo-sunday' },
    { id: 'vasaparken-saturday' },
    { id: 'story-garden-sunday' },
    { id: 'museum-crafts-saturday' },
    { id: 'due-date-coffee-circle' },
    { id: 'expecting-brunch-sunday' },
  ];
}

export default function GroupDetailScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const families = useAppStore((state) => state.families);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);
  const respondToGroupPlayDateInvite = useAppStore((state) => state.respondToGroupPlayDateInvite);
  const addLinkedParentToGroup = useAppStore((state) => state.addLinkedParentToGroup);
  const requestToJoinGroupPlayDate = useAppStore((state) => state.requestToJoinGroupPlayDate);
  const approveGroupJoinRequest = useAppStore((state) => state.approveGroupJoinRequest);
  const declineGroupJoinRequest = useAppStore((state) => state.declineGroupJoinRequest);
  const activeParent = getActiveParent(draftProfile);
  const primaryParent = getPrimaryParent(draftProfile);

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

  if (!canActiveParentViewGroup(groupPlayDate, draftProfile)) {
    return (
      <Screen header={<SubscreenHeader fallbackHref="/(tabs)/groups" title="Group" />}>
        <EmptyState
          title="This group has not been shared with this parent yet"
          body="Another parent in your family needs to add this parent before the event and chat show up here."
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
        parentName: primaryParent?.firstName ?? 'Parent',
        avatarUrl: primaryParent?.avatarUrl,
      },
    ],
    ...families.map((family) => {
      const publicParent = getPrimaryParent(family);
      return [
        family.id,
        {
          parentName: publicParent?.firstName ?? 'Parent',
          avatarUrl: publicParent?.avatarUrl,
        },
      ] as const;
    }),
  ]);
  const toFamilyList = (familyIds: string[]) =>
    familyIds.flatMap((familyId) => {
      const family = familyById[familyId];

      return family?.parentName
        ? [
            {
              id: familyId,
              parentName: family.parentName,
              avatarUrl: family.avatarUrl,
            },
          ]
        : [];
    });

  const attendees = toFamilyList(groupPlayDate.attendeeFamilyIds);
  const pendingInvitees = toFamilyList(groupPlayDate.invitedFamilyIds.filter((familyId) => familyId !== currentFamilyId));
  const requesters = toFamilyList(groupPlayDate.pendingRequestFamilyIds);

  const host = familyById[groupPlayDate.hostFamilyId];
  const activeParentId = activeParent?.id ?? draftProfile.primaryParentId;
  const activeLinkedParents = draftProfile.parents.filter((parent) => parent.status === 'active');
  const includedParents = activeLinkedParents.filter((parent) => groupPlayDate.includedParentIds.includes(parent.id));
  const isHost = groupPlayDate.membership === 'hosting';
  const isPrivateInvite = groupPlayDate.visibility === 'private' && groupPlayDate.membership === 'invited';
  const isRequestedPublic = groupPlayDate.visibility === 'public' && groupPlayDate.membership === 'requested';
  const isPublicNonMember = groupPlayDate.visibility === 'public' && groupPlayDate.membership === 'none';
  const canAccessChat =
    groupPlayDate.membership === 'hosting' ||
    groupPlayDate.membership === 'going' ||
    (groupPlayDate.visibility === 'private' && groupPlayDate.membership === 'invited');
  const shareableParents = activeLinkedParents.filter(
    (parent) => parent.id !== activeParentId && !groupPlayDate.includedParentIds.includes(parent.id)
  );
  const statusLabel =
    groupPlayDate.membership === 'hosting'
      ? 'Hosting'
      : groupPlayDate.membership === 'going'
        ? 'Going'
        : isPrivateInvite
          ? 'Invitation pending'
          : isRequestedPublic
            ? 'Request sent'
            : groupPlayDate.visibility === 'public'
              ? 'Public event'
              : 'Invite-only';
  const full = isGroupFull(groupPlayDate);
  const distanceLabel = getGroupDistanceLabel(draftProfile, groupPlayDate);

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
            <Text style={styles.body}>{getGroupAudienceLabel(groupPlayDate)}</Text>
            {activeParent ? <Text style={styles.body}>Coordinating as {activeParent.firstName}</Text> : null}
          </View>
        </View>
        <View style={styles.filters}>
          <Chip label={statusLabel} />
          <Chip label={groupPlayDate.visibility === 'public' ? 'Public' : 'Invite-only'} />
          <Chip label={getGroupAudienceLabel(groupPlayDate)} />
          {distanceLabel ? <Chip label={distanceLabel} /> : null}
          <Chip label={`${groupPlayDate.attendeeFamilyIds.length}/${groupPlayDate.capacity} families`} />
          {groupPlayDate.activityTags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
          {groupPlayDate.vibeTags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </View>
        {isPrivateInvite ? (
          <Text style={styles.pendingCopy}>
            You can read the group chat before deciding. You will stay marked as pending until you accept the invite.
          </Text>
        ) : null}
        {isRequestedPublic ? (
          <Text style={styles.pendingCopy}>
            Your join request is waiting on host approval. You will move into the event and group chat once the host accepts it.
          </Text>
        ) : null}
        {isPublicNonMember ? (
          <Text style={styles.pendingCopy}>
            This is a public event. Request to join and the host can approve you if there is still room.
          </Text>
        ) : null}
        <Text style={styles.body}>{groupPlayDate.note}</Text>
        <View style={styles.actionStack}>
          {canAccessChat ? (
            <Button
              label="Open group chat"
              onPress={() => router.push({ pathname: '/group-chat/[groupId]', params: { groupId: groupPlayDate.id } })}
            />
          ) : null}

          {isPrivateInvite ? (
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

          {isPublicNonMember ? (
            <Button
              disabled={full}
              label={full ? 'Full' : 'Request to join'}
              onPress={() => requestToJoinGroupPlayDate(groupPlayDate.id)}
            />
          ) : null}

          {isRequestedPublic ? <Button disabled label="Request sent" variant="secondary" onPress={() => undefined} /> : null}
        </View>
      </Card>

      {activeLinkedParents.length > 1 && canAccessChat ? (
        <Card>
          <Text style={styles.sectionTitle}>Shared with family</Text>
          <Text style={styles.body}>
            Groups stay with the parent who joined until they explicitly add another linked parent.
          </Text>
          <View style={styles.filters}>
            {includedParents.map((parent) => (
              <Chip key={parent.id} label={parent.firstName} />
            ))}
          </View>
          {shareableParents.length > 0 ? (
            <View style={styles.shareActions}>
              {shareableParents.map((parent) => (
                <Button
                  key={parent.id}
                  label={`Add ${parent.firstName}`}
                  onPress={() => addLinkedParentToGroup(groupPlayDate.id, parent.id)}
                  variant="secondary"
                />
              ))}
            </View>
          ) : (
            <Text style={styles.attendeeMeta}>All active parents in your family already have access to this group.</Text>
          )}
        </Card>
      ) : null}

      {isHost && groupPlayDate.visibility === 'public' && requesters.length > 0 ? (
        <Card>
          <Text style={styles.sectionTitle}>Join requests</Text>
          <View style={styles.requestList}>
            {requesters.map((requester) => (
              <View key={requester.id} style={styles.requestRow}>
                <View style={styles.attendeeRow}>
                  <Avatar name={requester.parentName} imageUrl={requester.avatarUrl} size={40} />
                  <View style={styles.attendeeText}>
                    <Text style={styles.attendeeName}>{requester.parentName}</Text>
                    <Text style={styles.attendeeMeta}>Requested to join this public event</Text>
                  </View>
                </View>
                <View style={styles.inlineActions}>
                  <View style={styles.flex}>
                    <Button
                      label="Decline"
                      variant="secondary"
                      onPress={() => declineGroupJoinRequest(groupPlayDate.id, requester.id)}
                    />
                  </View>
                  <View style={styles.flex}>
                    <Button label="Approve" onPress={() => approveGroupJoinRequest(groupPlayDate.id, requester.id)} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

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

      {groupPlayDate.visibility === 'private' && pendingInvitees.length > 0 ? (
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
      ) : null}
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
  requestList: {
    gap: spacing.md,
  },
  requestRow: {
    gap: spacing.md,
  },
  shareActions: {
    gap: spacing.sm,
  },
});
