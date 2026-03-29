import { useEffect, useMemo, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SubscreenHeader } from '@/components/navigation/SubscreenHeader';
import { Button } from '@/components/ui/Button';
import { CalendarDateField, formatCalendarDateLabel } from '@/components/ui/CalendarDateField';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { LocationField } from '@/components/ui/LocationField';
import { Screen } from '@/components/ui/Screen';
import { SelectableChip } from '@/components/ui/SelectableChip';
import { TextField } from '@/components/ui/TextField';
import { stockholmLocationPresets } from '@/constants/locations';
import { expectingActivityOptions, groupActivityOptions, groupAgeRangeOptions, groupVibeOptions } from '@/constants/demo-profiles';
import {
  canParticipateInAudience,
  getActiveMatchedParentIds,
  getActiveParent,
  getFamilyByParentId,
  parseDirectMatchId,
  type Family,
  type GroupPlayDateAudience,
  type GroupPlayDateVisibility,
  type ParentAccount,
  type SavedLocation,
  useAppStore,
} from '@/store/app-store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getPrivateLocationLabel } from '@/utils/location';

type MatchedParentOption = {
  family: Family;
  parent: ParentAccount;
};

type PlanFormState = {
  title: string;
  locationName: string;
  location: SavedLocation | null;
  dateIso: string;
  dateLabel: string;
  timeLabel: string;
  note: string;
  ageRange: string;
  audience: GroupPlayDateAudience;
  activityTags: string[];
  vibeTags: string[];
  capacity: string;
  invitedParentIds: string[];
  visibility: GroupPlayDateVisibility;
};

const toggle = (values: string[], value: string) =>
  values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];

const unique = (values: string[]) => [...new Set(values)];
const createInitialForm = (defaultLocation: SavedLocation | null, audience: GroupPlayDateAudience): PlanFormState => ({
  title: '',
  locationName: '',
  location: defaultLocation,
  dateIso: '',
  dateLabel: '',
  timeLabel: '',
  note: '',
  ageRange: '',
  audience,
  activityTags: [],
  vibeTags: [],
  capacity: '3',
  invitedParentIds: [],
  visibility: 'private',
});

export default function CreatePlanScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { matchId } = useLocalSearchParams<{ matchId?: string }>();
  const draftProfile = useAppStore((state) => state.draftProfile);
  const families = useAppStore((state) => state.families);
  const matchedParentIdsByParent = useAppStore((state) => state.matchedParentIdsByParent);
  const createGroupPlayDate = useAppStore((state) => state.createGroupPlayDate);
  const activeParent = getActiveParent(draftProfile);
  const canHostChildrenEvents = canParticipateInAudience(draftProfile, 'children');
  const canHostExpectingEvents = canParticipateInAudience(draftProfile, 'expecting');
  const defaultAudience = canHostChildrenEvents ? 'children' : 'expecting';
  const [form, setForm] = useState<PlanFormState>(() => createInitialForm(draftProfile.homeLocation, defaultAudience));
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [24, 92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const lockedMatch = typeof matchId === 'string' && matchId.length > 0 ? parseDirectMatchId(matchId) : null;
  const lockedRemoteParentId =
    activeParent && lockedMatch?.localParentId === activeParent.id ? lockedMatch.remoteParentId : null;
  const activeMatchedParentIds = getActiveMatchedParentIds(draftProfile, matchedParentIdsByParent);

  const matchedParents = useMemo(
    () =>
      activeMatchedParentIds
        .map((parentId) => {
          const family = getFamilyByParentId(families, parentId);
          const parent = family?.parents.find((entry) => entry.id === parentId) ?? null;

          if (!family || !parent || (form.visibility === 'public' && !canParticipateInAudience(family, form.audience))) {
            return null;
          }

          return { family, parent };
        })
        .filter((entry): entry is MatchedParentOption => Boolean(entry)),
    [activeMatchedParentIds, families, form.audience, form.visibility]
  );
  const selectedParents = matchedParents.filter((entry) => form.invitedParentIds.includes(entry.parent.id));
  const selectedFamilyIds = unique(selectedParents.map((entry) => entry.family.id));
  const isMinimalPrivateFlow =
    form.visibility === 'private' && form.invitedParentIds.length > 0 && selectedFamilyIds.length === 1;
  const showGroupExtras = form.visibility === 'public';
  const activityOptions = form.audience === 'children' ? groupActivityOptions : expectingActivityOptions;
  const canHostSelectedAudience = form.visibility === 'private' ? true : canParticipateInAudience(draftProfile, form.audience);
  const minimumCapacity = form.visibility === 'private' ? selectedFamilyIds.length + 1 : 1;
  const parsedCapacity = Number.parseInt(form.capacity, 10);
  const effectiveCapacity = isMinimalPrivateFlow ? selectedFamilyIds.length + 1 : parsedCapacity;
  const hasBaseFields =
    form.title.trim().length > 0 &&
    form.locationName.trim().length > 0 &&
    Boolean(form.location) &&
    form.dateIso.trim().length > 0 &&
    form.timeLabel.trim().length > 0;
  const hasAgeRange = form.visibility === 'private' || form.audience === 'expecting' || form.ageRange.trim().length > 0;
  const hasPrivateInvite = form.visibility === 'public' || form.invitedParentIds.length > 0;
  const hasGroupExtras =
    !showGroupExtras ||
    (form.activityTags.length > 0 &&
      form.vibeTags.length > 0 &&
      Number.isFinite(effectiveCapacity) &&
      effectiveCapacity >= minimumCapacity);
  const canSubmit = canHostSelectedAudience && hasBaseFields && hasAgeRange && hasPrivateInvite && hasGroupExtras;
  const lockedParent = lockedRemoteParentId
    ? matchedParents.find((entry) => entry.parent.id === lockedRemoteParentId) ?? null
    : null;

  useEffect(() => {
    if (!lockedRemoteParentId) {
      return;
    }

    setForm((current) => {
      const nextInvitedParentIds = current.invitedParentIds.includes(lockedRemoteParentId)
        ? current.invitedParentIds
        : [lockedRemoteParentId];

      return {
        ...current,
        visibility: 'private',
        audience: 'mixed',
        ageRange: '',
        invitedParentIds: nextInvitedParentIds,
      };
    });
  }, [lockedRemoteParentId]);

  const setAudience = (audience: GroupPlayDateAudience) =>
    setForm((current) => ({
      ...current,
      audience,
      ageRange: audience === 'expecting' ? '' : current.ageRange,
      activityTags: [],
      invitedParentIds: current.invitedParentIds.filter((parentId) => {
        const family = getFamilyByParentId(families, parentId);
        return family ? canParticipateInAudience(family, audience) : false;
      }),
    }));

  const submit = () => {
    if (!canSubmit || !form.location || !activeParent) {
      return;
    }

    const id = createGroupPlayDate({
      title: form.title.trim(),
      location: form.location,
      locationName: form.locationName.trim(),
      dateLabel: form.dateLabel.trim(),
      timeLabel: form.timeLabel.trim(),
      ageRange: form.visibility === 'public' && form.audience === 'children' ? form.ageRange : undefined,
      audience: form.visibility === 'private' ? 'mixed' : form.audience,
      activityTags: showGroupExtras ? form.activityTags : [],
      vibeTags: showGroupExtras ? form.vibeTags : [],
      note: form.note.trim(),
      capacity: isMinimalPrivateFlow ? selectedFamilyIds.length + 1 : effectiveCapacity,
      visibility: form.visibility,
      invitedParentIds: form.visibility === 'private' ? form.invitedParentIds : [],
    });

    router.replace({ pathname: '/group/[id]', params: { id } });
  };

  return (
    <Screen
      header={<SubscreenHeader fallbackHref="/(tabs)/plans" title="Create a plan" titleOpacity={headerTitleOpacity} />}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
      scroll
    >
      <View style={styles.header}>
        <Text style={styles.title}>Create a plan</Text>
        <Text style={styles.subtitle}>Set up a private meetup with matched parents or host something public nearby.</Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Visibility</Text>
        <View style={styles.filters}>
          <SelectableChip
            label="Private"
            selected={form.visibility === 'private'}
            onPress={() =>
              setForm((current) => ({
                ...current,
                visibility: 'private',
                audience: 'mixed',
                ageRange: '',
                activityTags: [],
                vibeTags: [],
              }))
            }
          />
          {!lockedRemoteParentId ? (
            <SelectableChip
              label="Public"
              selected={form.visibility === 'public'}
              onPress={() =>
                setForm((current) => ({
                  ...current,
                  visibility: 'public',
                  audience: current.audience === 'mixed' ? defaultAudience : current.audience,
                  invitedParentIds: [],
                }))
              }
            />
          ) : null}
        </View>
        <Text style={styles.helperText}>
          {lockedRemoteParentId
            ? 'This plan starts from the current direct chat, so it stays private.'
            : form.visibility === 'private'
              ? 'Private plans invite specific matched parents.'
              : 'Public plans show up in Discover and parents can request to join.'}
        </Text>
      </Card>

      {form.visibility === 'private' ? (
        <Card>
          <Text style={styles.sectionTitle}>Invite parents</Text>
          {lockedRemoteParentId ? (
            lockedParent ? (
              <View style={styles.selectionSummary}>
                <Chip label={lockedParent.parent.firstName} />
                <Text style={styles.helperText}>{lockedParent.family.familySummary}</Text>
              </View>
            ) : (
              <Text style={styles.helperText}>This chat needs an active mutual match before you can create a private plan here.</Text>
            )
          ) : matchedParents.length > 0 ? (
            <>
              <View style={styles.filters}>
                {matchedParents.map((entry) => {
                  const label = `${entry.parent.firstName}${entry.parent.role === 'coparent' ? ' · Co-parent' : ''}`;

                  return (
                    <SelectableChip
                      key={entry.parent.id}
                      label={label}
                      selected={form.invitedParentIds.includes(entry.parent.id)}
                      onPress={() =>
                        setForm((current) => ({
                          ...current,
                          invitedParentIds: toggle(current.invitedParentIds, entry.parent.id),
                        }))
                      }
                    />
                  );
                })}
              </View>
              <Text style={styles.helperText}>
                Invite any matched parents you want included in this plan.
              </Text>
            </>
          ) : (
            <Text style={styles.helperText}>You need mutual matches before creating a private plan.</Text>
          )}
        </Card>
      ) : null}

      {form.visibility === 'public' ? (
        <Card>
          <Text style={styles.sectionTitle}>Age range</Text>
          <View style={styles.filters}>
            <SelectableChip label="Children" selected={form.audience === 'children'} onPress={() => setAudience('children')} />
            <SelectableChip label="Expecting" selected={form.audience === 'expecting'} onPress={() => setAudience('expecting')} />
          </View>
          <Text style={styles.helperText}>
            {form.audience === 'children'
              ? canHostChildrenEvents
                ? 'Choose the child age range that makes this plan feel like a good fit.'
                : 'Add at least one child with a valid birthday before creating a children-focused plan.'
              : canHostExpectingEvents
                ? 'Expecting plans stay adult-focused and skip child age ranges.'
                : 'Add a valid due month in your profile before creating an expecting-friendly plan.'}
          </Text>
          {form.audience === 'children' ? (
            <View style={styles.section}>
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
          ) : null}
        </Card>
      ) : null}

      <Card>
        <TextField
          label="Title"
          placeholder={isMinimalPrivateFlow ? 'Saturday coffee walk' : 'Sunday scooter circle'}
          value={form.title}
          onChangeText={(value) => setForm((current) => ({ ...current, title: value }))}
        />
        <TextField
          label="Location name"
          placeholder={isMinimalPrivateFlow ? 'Neighborhood cafe terrace' : 'Vasaparken playground'}
          value={form.locationName}
          onChangeText={(value) => setForm((current) => ({ ...current, locationName: value }))}
        />
        <LocationField
          collapseSuggestionsOnSelect
          helperText={form.location ? 'Meetup address selected.' : 'Choose the meetup address.'}
          label="Address"
          onChange={(location) => setForm((current) => ({ ...current, location }))}
          placeholder="Search by street or address"
          suggestionMetaFormatter={() => 'Used for meetup location'}
          suggestionTitleFormatter={getPrivateLocationLabel}
          suggestions={stockholmLocationPresets}
          value={form.location}
          valueFormatter={getPrivateLocationLabel}
        />
        <View style={styles.formRow}>
          <View style={styles.flex}>
            <CalendarDateField
              label="Date"
              placeholder="Pick a date"
              value={form.dateIso}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  dateIso: value,
                  dateLabel: formatCalendarDateLabel(value),
                }))
              }
            />
          </View>
          <View style={styles.flex}>
            <TextField
              label="Time"
              placeholder="10:30-12:00"
              value={form.timeLabel}
              onChangeText={(value) => setForm((current) => ({ ...current, timeLabel: value }))}
            />
          </View>
        </View>

        {showGroupExtras ? (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Activities</Text>
              <View style={styles.filters}>
                {activityOptions.map((tag) => (
                  <SelectableChip
                    key={tag}
                    label={tag}
                    selected={form.activityTags.includes(tag)}
                    onPress={() => setForm((current) => ({ ...current, activityTags: toggle(current.activityTags, tag) }))}
                  />
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Vibe</Text>
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
          </>
        ) : null}

        <TextField
          label="Note"
          multiline
          placeholder={
            isMinimalPrivateFlow
              ? 'What would make this meetup feel easy and low-pressure?'
              : form.visibility === 'private'
                ? 'What should invited parents know about the pace or setup?'
                : 'What should parents know before requesting to join?'
          }
          value={form.note}
          onChangeText={(value) => setForm((current) => ({ ...current, note: value }))}
        />

        {showGroupExtras ? (
          <TextField
            keyboardType="number-pad"
            label="Capacity (families)"
            placeholder="3"
            value={form.capacity}
            onChangeText={(value) => setForm((current) => ({ ...current, capacity: value }))}
          />
        ) : null}
      </Card>

      <View style={styles.actions}>
        <View style={styles.flex}>
          <Button label="Cancel" onPress={() => router.back()} variant="secondary" />
        </View>
        <View style={styles.flex}>
          <Button disabled={!canSubmit} label="Create plan" onPress={submit} />
        </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
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
  flex: {
    flex: 1,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  selectionSummary: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
