import { useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SubscreenHeader } from '@/components/navigation/SubscreenHeader';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SelectableChip } from '@/components/ui/SelectableChip';
import { TextField } from '@/components/ui/TextField';
import {
  areaOptions,
  expectingActivityOptions,
  groupActivityOptions,
  groupAgeRangeOptions,
  groupVibeOptions,
} from '@/constants/demo-profiles';
import {
  canParticipateInAudience,
  getActiveMatchedFamilyIds,
  getActiveParent,
  getLinkedParentMatchedFamilyIds,
  getPrimaryParent,
  type GroupPlayDateAudience,
  useAppStore,
  type GroupPlayDateVisibility,
} from '@/store/app-store';
import { getMatchedFamilies } from '@/store/derived';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type GroupFormState = {
  title: string;
  locationName: string;
  area: string;
  dateLabel: string;
  timeLabel: string;
  ageRange: string;
  audience: GroupPlayDateAudience;
  activityTags: string[];
  vibeTags: string[];
  note: string;
  capacity: string;
  invitedFamilyIds: string[];
  visibility: GroupPlayDateVisibility;
};

const toggle = (values: string[], value: string) =>
  values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];

const createInitialForm = (defaultArea: string, audience: GroupPlayDateAudience): GroupFormState => ({
  title: '',
  locationName: '',
  area: defaultArea,
  dateLabel: '',
  timeLabel: '',
  ageRange: '',
  audience,
  activityTags: [],
  vibeTags: [],
  note: '',
  capacity: '3',
  invitedFamilyIds: [],
  visibility: 'private',
});

export default function CreateGroupScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const draftProfile = useAppStore((state) => state.draftProfile);
  const families = useAppStore((state) => state.families);
  const matchedFamilyIdsByParent = useAppStore((state) => state.matchedFamilyIdsByParent);
  const createGroupPlayDate = useAppStore((state) => state.createGroupPlayDate);
  const activeParent = getActiveParent(draftProfile);
  const canHostChildrenEvents = canParticipateInAudience(draftProfile, 'children');
  const canHostExpectingEvents = canParticipateInAudience(draftProfile, 'expecting');
  const defaultAudience = canHostChildrenEvents ? 'children' : 'expecting';
  const [form, setForm] = useState<GroupFormState>(() => createInitialForm(draftProfile.area, defaultAudience));
  const canHostSelectedAudience = canParticipateInAudience(draftProfile, form.audience);
  const matchedFamilyIds = [
    ...new Set([
      ...getActiveMatchedFamilyIds(draftProfile, matchedFamilyIdsByParent),
      ...getLinkedParentMatchedFamilyIds(draftProfile, matchedFamilyIdsByParent),
    ]),
  ];
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [24, 92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const matchedFamilies = useMemo(
    () => getMatchedFamilies(families, matchedFamilyIds).filter((family) => canParticipateInAudience(family, form.audience)),
    [families, form.audience, matchedFamilyIds]
  );
  const activityOptions = form.audience === 'children' ? groupActivityOptions : expectingActivityOptions;

  const capacityValue = Number.parseInt(form.capacity, 10);
  const hasRequiredFields =
    form.title.trim().length > 0 &&
    form.locationName.trim().length > 0 &&
    form.area.trim().length > 0 &&
    form.dateLabel.trim().length > 0 &&
    form.timeLabel.trim().length > 0 &&
    (form.audience === 'expecting' || form.ageRange.trim().length > 0) &&
    form.activityTags.length > 0 &&
    form.vibeTags.length > 0 &&
    Number.isFinite(capacityValue) &&
    capacityValue >= 1;
  const canSubmit =
    canHostSelectedAudience &&
    hasRequiredFields &&
    capacityValue >= (form.visibility === 'private' ? form.invitedFamilyIds.length + 1 : 1) &&
    (form.visibility === 'public' || form.invitedFamilyIds.length > 0);

  const submit = () => {
    if (!canSubmit) {
      return;
    }

    const id = createGroupPlayDate({
      title: form.title.trim(),
      area: form.area,
      locationName: form.locationName.trim(),
      dateLabel: form.dateLabel.trim(),
      timeLabel: form.timeLabel.trim(),
      ageRange: form.audience === 'children' ? form.ageRange : undefined,
      audience: form.audience,
      activityTags: form.activityTags,
      vibeTags: form.vibeTags,
      note: form.note.trim(),
      capacity: capacityValue,
      visibility: form.visibility,
      invitedFamilyIds: form.visibility === 'private' ? form.invitedFamilyIds : [],
    });

    router.replace({ pathname: '/group/[id]', params: { id } });
  };

  return (
    <Screen
      header={
        <SubscreenHeader
          fallbackHref="/(tabs)/groups"
          title="Host an event"
          titleOpacity={headerTitleOpacity}
        />
      }
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
      scroll
    >
      <View style={styles.header}>
        <Text style={styles.title}>Host an event</Text>
        <Text style={styles.subtitle}>
          Choose whether this stays invite-only or becomes a public event parents can discover and request to join.
          {activeParent ? ` ${activeParent.firstName} is added first, and linked co-parents can be added later from the group details.` : ''}
        </Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Audience</Text>
        <View style={styles.filters}>
          <SelectableChip
            label="Families with children"
            selected={form.audience === 'children'}
            onPress={() =>
              setForm((current) => ({
                ...current,
                audience: 'children',
                activityTags: [],
                invitedFamilyIds: [],
              }))
            }
          />
          <SelectableChip
            label="Expecting parents"
            selected={form.audience === 'expecting'}
            onPress={() =>
              setForm((current) => ({
                ...current,
                audience: 'expecting',
                ageRange: '',
                activityTags: [],
                invitedFamilyIds: [],
              }))
            }
          />
        </View>
        <Text style={styles.helperText}>
          {form.audience === 'children'
            ? canHostChildrenEvents
              ? 'Child-focused events keep the age-range flow you already have.'
              : 'Add at least one born child with a valid birthday before creating a child-focused event.'
            : canHostExpectingEvents
              ? 'Expecting-friendly events stay parent-focused and skip child age ranges.'
              : 'Add a valid due month in your profile before creating an expecting-friendly event.'}
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Visibility</Text>
        <View style={styles.filters}>
          <SelectableChip
            label="Private"
            selected={form.visibility === 'private'}
            onPress={() => setForm((current) => ({ ...current, visibility: 'private' }))}
          />
          <SelectableChip
            label="Public"
            selected={form.visibility === 'public'}
            onPress={() => setForm((current) => ({ ...current, visibility: 'public', invitedFamilyIds: [] }))}
          />
        </View>
        <Text style={styles.helperText}>
          {form.visibility === 'private'
            ? 'Private events are invite-only and live inside your connection network.'
            : 'Public events show up in Discover for parents who fit this audience and request to join until you approve them.'}
        </Text>
      </Card>

      <Card>
        <TextField label="Event title" placeholder="Sunday scooter circle" value={form.title} onChangeText={(value) => setForm((current) => ({ ...current, title: value }))} />
        <TextField
          label="Location name"
          placeholder="Vasaparken playground"
          value={form.locationName}
          onChangeText={(value) => setForm((current) => ({ ...current, locationName: value }))}
        />
        <View style={styles.section}>
          <Text style={styles.label}>Area</Text>
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
              placeholder="Sun 6 Apr"
              value={form.dateLabel}
              onChangeText={(value) => setForm((current) => ({ ...current, dateLabel: value }))}
            />
          </View>
          <View style={styles.flex}>
            <TextField
              label="Time label"
              placeholder="10:30-12:00"
              value={form.timeLabel}
              onChangeText={(value) => setForm((current) => ({ ...current, timeLabel: value }))}
            />
          </View>
        </View>
        {form.audience === 'children' ? (
          <View style={styles.section}>
            <Text style={styles.label}>Age range</Text>
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
        <TextField
          label="Host note"
          multiline
          placeholder={
            form.visibility === 'private'
              ? 'What should invited parents know about the pace, tone, or first-meetup setup?'
              : 'What should parents know before requesting to join this public event?'
          }
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
      </Card>

      {form.visibility === 'private' ? (
        <Card>
          <Text style={styles.sectionTitle}>Invite families</Text>
          {matchedFamilies.length > 0 ? (
            <>
              <View style={styles.filters}>
                {matchedFamilies.map((family) => {
                  const publicParent = getPrimaryParent(family);

                  return (
                    <SelectableChip
                      key={family.id}
                      label={publicParent?.firstName ?? 'Parent'}
                      selected={form.invitedFamilyIds.includes(family.id)}
                      onPress={() =>
                        setForm((current) => ({
                          ...current,
                          invitedFamilyIds: toggle(current.invitedFamilyIds, family.id),
                        }))
                      }
                    />
                  );
                })}
              </View>
              <Text style={styles.helperText}>Capacity must cover you plus everyone invited.</Text>
            </>
          ) : (
            <Text style={styles.helperText}>
              You do not have any mutual matches who fit this audience yet, so private events are not available until you connect with another family here.
            </Text>
          )}
        </Card>
      ) : null}

      <View style={styles.actions}>
        <View style={styles.flex}>
          <Button label="Cancel" onPress={() => router.back()} variant="secondary" />
        </View>
        <View style={styles.flex}>
          <Button disabled={!canSubmit} label="Create event" onPress={submit} />
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
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
