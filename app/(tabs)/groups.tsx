import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MainAppHeader } from '@/components/navigation/MainAppHeader';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { SelectableChip } from '@/components/ui/SelectableChip';
import { TextField } from '@/components/ui/TextField';
import {
  areaOptions,
  groupActivityOptions,
  groupAgeRangeOptions,
  groupVibeOptions,
} from '@/constants/demo-profiles';
import { useAppStore } from '@/store/app-store';
import { getMatchedFamilies } from '@/store/derived';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

type GroupFormState = {
  title: string;
  locationName: string;
  area: string;
  dateLabel: string;
  timeLabel: string;
  ageRange: string;
  activityTags: string[];
  vibeTags: string[];
  note: string;
  capacity: string;
  invitedFamilyIds: string[];
};

const toggle = (values: string[], value: string) =>
  values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];

const createInitialForm = (defaultArea: string): GroupFormState => ({
  title: '',
  locationName: '',
  area: defaultArea,
  dateLabel: '',
  timeLabel: '',
  ageRange: '',
  activityTags: [],
  vibeTags: [],
  note: '',
  capacity: '3',
  invitedFamilyIds: [],
});

export default function GroupsScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const families = useAppStore((state) => state.families);
  const matchedFamilyIds = useAppStore((state) => state.matchedFamilyIds);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);
  const respondToGroupPlayDateInvite = useAppStore((state) => state.respondToGroupPlayDateInvite);
  const createGroupPlayDate = useAppStore((state) => state.createGroupPlayDate);

  const [showHostForm, setShowHostForm] = useState(false);
  const [form, setForm] = useState<GroupFormState>(() => createInitialForm(draftProfile.area));

  const matchedFamilies = getMatchedFamilies(families, matchedFamilyIds);
  const familyById = Object.fromEntries([
    [
      currentFamilyId,
      {
        id: currentFamilyId,
        parentName: draftProfile.parentName,
        avatarUrl: draftProfile.avatarUrl,
      },
    ],
    ...families.map((family) => [family.id, family]),
  ]);
  const invitedGroupPlayDates = groupPlayDates.filter(
    (groupPlayDate) => groupPlayDate.status === 'invited' && groupPlayDate.invitedFamilyIds.includes(currentFamilyId)
  );
  const upcomingGroupPlayDates = groupPlayDates.filter(
    (groupPlayDate) =>
      (groupPlayDate.status === 'going' || groupPlayDate.status === 'hosting') &&
      (groupPlayDate.hostFamilyId === currentFamilyId || groupPlayDate.attendeeFamilyIds.includes(currentFamilyId))
  );

  const summaryCards = [
    { label: 'Invitations', value: invitedGroupPlayDates.length },
    { label: 'Upcoming', value: upcomingGroupPlayDates.length },
  ];

  const capacityValue = Number.parseInt(form.capacity, 10);
  const canSubmit =
    form.title.trim().length > 0 &&
    form.locationName.trim().length > 0 &&
    form.area.trim().length > 0 &&
    form.dateLabel.trim().length > 0 &&
    form.timeLabel.trim().length > 0 &&
    form.ageRange.trim().length > 0 &&
    form.activityTags.length > 0 &&
    form.vibeTags.length > 0 &&
    form.invitedFamilyIds.length > 0 &&
    Number.isFinite(capacityValue) &&
    capacityValue >= form.invitedFamilyIds.length + 1;

  const resetForm = () => setForm(createInitialForm(draftProfile.area));
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [24, 92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const submit = () => {
    if (!canSubmit) {
      return;
    }

    createGroupPlayDate({
      title: form.title.trim(),
      locationName: form.locationName.trim(),
      area: form.area,
      dateLabel: form.dateLabel.trim(),
      timeLabel: form.timeLabel.trim(),
      ageRange: form.ageRange,
      activityTags: form.activityTags,
      vibeTags: form.vibeTags,
      note: form.note.trim(),
      capacity: capacityValue,
      invitedFamilyIds: form.invitedFamilyIds,
    });

    resetForm();
    setShowHostForm(false);
  };

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
        <Text style={styles.subtitle}>Handle invitations, host plans, and keep upcoming playdates organized.</Text>
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
        <Button
          disabled={matchedFamilies.length === 0}
          label={showHostForm ? 'Hide host flow' : 'Host a group'}
          onPress={() => setShowHostForm((value) => !value)}
        />
        <Text style={styles.helperText}>
          {matchedFamilies.length > 0
            ? 'Invite mutual connections only, so new groups stay rooted in families you already know.'
            : 'Host flow unlocks after you have at least one mutual family connection.'}
        </Text>

        {showHostForm && (
          <View style={styles.form}>
            <TextField label="Group title" placeholder="Saturday scooter circle" value={form.title} onChangeText={(value) => setForm((current) => ({ ...current, title: value }))} />
            <TextField
              label="Location name"
              placeholder="Vasaparken playground"
              value={form.locationName}
              onChangeText={(value) => setForm((current) => ({ ...current, locationName: value }))}
            />
            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>Area</Text>
              <View style={styles.filters}>
                {areaOptions.map((area) => (
                  <SelectableChip
                    key={area}
                    label={area}
                    selected={form.area === area}
                    onPress={() => setForm((current) => ({ ...current, area }))}
                  />
                ))}
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.flex}>
                <TextField
                  label="Date label"
                  placeholder="Sat 5 Apr"
                  value={form.dateLabel}
                  onChangeText={(value) => setForm((current) => ({ ...current, dateLabel: value }))}
                />
              </View>
              <View style={styles.flex}>
                <TextField
                  label="Time label"
                  placeholder="10:00-11:30"
                  value={form.timeLabel}
                  onChangeText={(value) => setForm((current) => ({ ...current, timeLabel: value }))}
                />
              </View>
            </View>
            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>Age range</Text>
              <View style={styles.filters}>
                {groupAgeRangeOptions.map((ageRange) => (
                  <SelectableChip
                    key={ageRange}
                    label={ageRange}
                    selected={form.ageRange === ageRange}
                    onPress={() => setForm((current) => ({ ...current, ageRange }))}
                  />
                ))}
              </View>
            </View>
            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>Activities</Text>
              <View style={styles.filters}>
                {groupActivityOptions.map((tag) => (
                  <SelectableChip
                    key={tag}
                    label={tag}
                    selected={form.activityTags.includes(tag)}
                    onPress={() => setForm((current) => ({ ...current, activityTags: toggle(current.activityTags, tag) }))}
                  />
                ))}
              </View>
            </View>
            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>Vibe</Text>
              <View style={styles.filters}>
                {groupVibeOptions.map((tag) => (
                  <SelectableChip
                    key={tag}
                    label={tag}
                    selected={form.vibeTags.includes(tag)}
                    onPress={() => setForm((current) => ({ ...current, vibeTags: toggle(current.vibeTags, tag) }))}
                  />
                ))}
              </View>
            </View>
            <TextField
              label="Host note"
              multiline
              placeholder="Short note about the pace, first-meetup tone, or what families should bring."
              value={form.note}
              onChangeText={(value) => setForm((current) => ({ ...current, note: value }))}
            />
            <TextField
              keyboardType="number-pad"
              label="Capacity (families)"
              placeholder="3"
              value={form.capacity}
              onChangeText={(value) => setForm((current) => ({ ...current, capacity: value }))}
            />
            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>Invite families</Text>
              <View style={styles.filters}>
                {matchedFamilies.map((family) => (
                  <SelectableChip
                    key={family.id}
                    label={family.parentName}
                    selected={form.invitedFamilyIds.includes(family.id)}
                    onPress={() =>
                      setForm((current) => ({
                        ...current,
                        invitedFamilyIds: toggle(current.invitedFamilyIds, family.id),
                      }))
                    }
                  />
                ))}
              </View>
              <Text style={styles.helperText}>Capacity must cover you plus every invited family.</Text>
            </View>
            <View style={styles.formActions}>
              <View style={styles.flex}>
                <Button
                  label="Cancel"
                  variant="secondary"
                  onPress={() => {
                    resetForm();
                    setShowHostForm(false);
                  }}
                />
              </View>
              <View style={styles.flex}>
                <Button disabled={!canSubmit} label="Create group" onPress={submit} />
              </View>
            </View>
          </View>
        )}
      </Card>

      {invitedGroupPlayDates.length > 0 ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Invitations</Text>
          <View style={styles.stack}>
            {invitedGroupPlayDates.map((groupPlayDate) => {
              const hostFamily = familyById[groupPlayDate.hostFamilyId];
              const visibleAttendees = groupPlayDate.attendeeFamilyIds.slice(0, 4);
              const overflowAttendeeCount = groupPlayDate.attendeeFamilyIds.length - visibleAttendees.length;
              const attendeeNames = visibleAttendees
                .map((familyId) => familyById[familyId]?.parentName)
                .filter((name): name is string => Boolean(name));
              const otherPendingCount = groupPlayDate.invitedFamilyIds.filter(
                (familyId) => familyId !== currentFamilyId
              ).length;

              return (
                <View key={groupPlayDate.id} style={styles.invitationCard}>
                  <Pressable
                    onPress={() => router.push({ pathname: '/group/[id]', params: { id: groupPlayDate.id } })}
                    style={({ pressed }) => [styles.invitationSurface, pressed ? styles.pressed : null]}
                  >
                    <View style={[styles.accentLine, styles.invitationAccentLine]} />
                    <View style={styles.upcomingMetaRow}>
                      <Text style={styles.eventMeta}>
                        {groupPlayDate.dateLabel} · {groupPlayDate.timeLabel}
                      </Text>
                      <View style={styles.statusPill}>
                        <Text style={styles.statusPillText}>Invitation pending</Text>
                      </View>
                    </View>
                    <Text style={styles.upcomingTitle}>{groupPlayDate.title}</Text>
                    <Text style={styles.invitationHostLine}>
                      Hosted by {hostFamily?.parentName ?? 'a nearby parent'} · {groupPlayDate.locationName} ·{' '}
                      {groupPlayDate.area}
                    </Text>
                    {groupPlayDate.note ? (
                      <Text numberOfLines={2} style={styles.invitationNote}>
                        {groupPlayDate.note}
                      </Text>
                    ) : null}

                    <View style={styles.metaPills}>
                      <View style={styles.metaPill}>
                        <Text style={styles.metaPillText}>{groupPlayDate.ageRange}</Text>
                      </View>
                      {groupPlayDate.activityTags.slice(0, 1).map((tag) => (
                        <View key={tag} style={styles.metaPill}>
                          <Text style={styles.metaPillText}>{tag}</Text>
                        </View>
                      ))}
                      <View style={styles.metaPill}>
                        <Text style={styles.metaPillText}>{groupPlayDate.capacity} families max</Text>
                      </View>
                    </View>

                    <View style={styles.upcomingFooter}>
                      <View style={styles.avatarRow}>
                        {visibleAttendees.map((familyId) => {
                          const attendee = familyById[familyId];

                          if (!attendee) {
                            return null;
                          }

                          return (
                            <View key={familyId} style={styles.avatarStackItem}>
                              <Avatar name={attendee.parentName} imageUrl={attendee.avatarUrl} size={34} />
                            </View>
                          );
                        })}
                        {overflowAttendeeCount > 0 ? (
                          <View style={[styles.avatarStackItem, styles.avatarOverflow]}>
                            <Text style={styles.avatarOverflowText}>+{overflowAttendeeCount}</Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.attendanceCopy}>
                        <Text numberOfLines={1} style={styles.attendanceNames}>
                          {attendeeNames.join(', ')}
                          {overflowAttendeeCount > 0 ? ` +${overflowAttendeeCount}` : ''}
                        </Text>
                        <Text style={styles.attendanceCount}>
                          {groupPlayDate.attendeeFamilyIds.length}/{groupPlayDate.capacity} families confirmed
                          {otherPendingCount > 0 ? ` · ${otherPendingCount} more invited` : ''}
                        </Text>
                      </View>
                    </View>
                  </Pressable>

                  <View style={styles.actionStack}>
                    <View style={styles.formActions}>
                      <View style={styles.flex}>
                        <Button
                          label="Open chat"
                          variant="secondary"
                          onPress={() =>
                            router.push({
                              pathname: '/group-chat/[groupId]',
                              params: { groupId: groupPlayDate.id },
                            })
                          }
                        />
                      </View>
                      <View style={styles.flex}>
                        <Button
                          label="Accept invite"
                          onPress={() => respondToGroupPlayDateInvite(groupPlayDate.id, 'going')}
                        />
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
        </View>
      ) : (
        <EmptyState title="No group invitations" body="When a connected family invites you to a playdate, it will show up here first." />
      )}

      {upcomingGroupPlayDates.length > 0 ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <View style={styles.stack}>
            {upcomingGroupPlayDates.map((groupPlayDate) => {
              const hostFamily = familyById[groupPlayDate.hostFamilyId];
              const visibleAttendees = groupPlayDate.attendeeFamilyIds.slice(0, 4);
              const overflowAttendeeCount = groupPlayDate.attendeeFamilyIds.length - visibleAttendees.length;
              const attendeeNames = visibleAttendees
                .map((familyId) => familyById[familyId]?.parentName)
                .filter((name): name is string => Boolean(name));

              return (
                <Pressable
                  key={groupPlayDate.id}
                  onPress={() => router.push({ pathname: '/group/[id]', params: { id: groupPlayDate.id } })}
                  style={({ pressed }) => [styles.upcomingCard, pressed ? styles.pressed : null]}
                >
                  <View style={styles.accentLine} />
                  <View style={styles.upcomingMetaRow}>
                    <Text style={styles.eventMeta}>
                      {groupPlayDate.dateLabel} · {groupPlayDate.timeLabel}
                    </Text>
                    {groupPlayDate.invitedFamilyIds.length > 0 ? (
                      <Text style={styles.pendingMeta}>
                        {groupPlayDate.invitedFamilyIds.length} pending
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.upcomingHeader}>
                    <View style={styles.flex}>
                      <Text style={styles.upcomingTitle}>{groupPlayDate.title}</Text>
                      <Text style={styles.locationLine}>
                        {groupPlayDate.locationName} · {groupPlayDate.area}
                      </Text>
                    </View>
                    <Chip label={groupPlayDate.status === 'hosting' ? 'Hosting' : 'Going'} />
                  </View>

                  <View style={styles.metaPills}>
                    <View style={styles.metaPill}>
                      <Text style={styles.metaPillText}>{groupPlayDate.ageRange}</Text>
                    </View>
                    <View style={styles.metaPill}>
                      <Text style={styles.metaPillText}>
                        Hosted by {hostFamily?.parentName ?? 'a nearby parent'}
                      </Text>
                    </View>
                    {groupPlayDate.activityTags.slice(0, 1).map((tag) => (
                      <View key={tag} style={styles.metaPill}>
                        <Text style={styles.metaPillText}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.upcomingFooter}>
                    <View style={styles.avatarRow}>
                      {visibleAttendees.map((familyId) => {
                        const attendee = familyById[familyId];

                        if (!attendee) {
                          return null;
                        }

                        return (
                          <View key={familyId} style={styles.avatarStackItem}>
                            <Avatar name={attendee.parentName} imageUrl={attendee.avatarUrl} size={34} />
                          </View>
                        );
                      })}
                      {overflowAttendeeCount > 0 ? (
                        <View style={[styles.avatarStackItem, styles.avatarOverflow]}>
                          <Text style={styles.avatarOverflowText}>+{overflowAttendeeCount}</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.attendanceCopy}>
                      <Text numberOfLines={1} style={styles.attendanceNames}>
                        {attendeeNames.length > 0 ? attendeeNames.join(', ') : 'No attendees yet'}
                        {overflowAttendeeCount > 0 ? ` +${overflowAttendeeCount}` : ''}
                      </Text>
                      <Text style={styles.attendanceCount}>
                        {groupPlayDate.attendeeFamilyIds.length}/{groupPlayDate.capacity} families confirmed
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        <EmptyState title="No upcoming groups" body="Accept an invite or host your own meetup and it will show up here." />
      )}
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
  sectionBlock: {
    gap: spacing.md,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  form: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  formSection: {
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  stack: {
    gap: spacing.lg,
  },
  groupCard: {
    gap: spacing.sm,
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
  groupTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  groupMeta: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
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
  accentLine: {
    width: 48,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  invitationAccentLine: {
    backgroundColor: colors.accent,
  },
  upcomingMetaRow: {
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
  pendingMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  statusPill: {
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  locationLine: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  invitationHostLine: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  invitationNote: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  metaPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaPill: {
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  pressed: {
    opacity: 0.88,
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
  upcomingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 34,
  },
  avatarStackItem: {
    marginRight: -10,
    borderWidth: 2,
    borderColor: colors.background,
    borderRadius: radius.pill,
  },
  avatarOverflow: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  avatarOverflowText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  attendanceCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  attendanceNames: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  attendanceCount: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
