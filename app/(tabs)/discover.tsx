import { useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MainAppHeader } from '@/components/navigation/MainAppHeader';
import { PublicEventCard } from '@/components/discovery/PublicEventCard';
import { FamilyCard } from '@/components/discovery/FamilyCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SelectableChip } from '@/components/ui/SelectableChip';
import { DEFAULT_DISCOVERY_RADIUS_KM, distanceRadiusOptions } from '@/constants/locations';
import {
  availabilityOptions,
  childInterestOptions,
  expectingActivityOptions,
  groupActivityOptions,
  groupAgeRangeOptions,
} from '@/constants/demo-profiles';
import {
  ANY_PUBLIC_EVENT_AGE,
  ANY_PUBLIC_EVENT_AUDIENCE,
  type DistanceRadiusKm,
  getActiveLikedFamilyIds,
  getActiveMatchedFamilyIds,
  getActivePassedFamilyIds,
  hasBornChildren,
  isExpectingFamily,
  getPrimaryParent,
  useAppStore,
} from '@/store/app-store';
import {
  getDueMonthGapSortValue,
  getDiscoverablePublicEvents,
  getFamilyDistanceLabel,
  getFamilyFitChips,
  getGroupDistanceLabel,
  getGroupAudienceLabel,
  getSharedFamilyVibeCount,
  getSharedLanguageCount,
  getSharedParentInterestCount,
  getFamilySortValue,
  isGroupFull,
  isSimilarAgeFamily,
} from '@/store/derived';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getAllChildInterests } from '@/utils/birthdays';
import { getDistanceKm, isWithinRadius } from '@/utils/location';

type DiscoverMode = 'families' | 'events';

const formatRadiusLabel = (radiusKm: DistanceRadiusKm) =>
  radiusKm === null ? 'Any distance' : `Within ${radiusKm} km`;

function SegmentButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.segmentButton, active ? styles.segmentButtonActive : null, pressed ? styles.pressed : null]}>
      <Text style={[styles.segmentButtonText, active ? styles.segmentButtonTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const [showFilters, setShowFilters] = useState(false);
  const [mode, setMode] = useState<DiscoverMode>('families');
  const scrollY = useRef(new Animated.Value(0)).current;
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const families = useAppStore((state) => state.families);
  const likedFamilyIdsByParent = useAppStore((state) => state.likedFamilyIdsByParent);
  const matchedFamilyIdsByParent = useAppStore((state) => state.matchedFamilyIdsByParent);
  const passedFamilyIdsByParent = useAppStore((state) => state.passedFamilyIdsByParent);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const discoveryFilters = useAppStore((state) => state.discoveryFilters);
  const publicEventFilters = useAppStore((state) => state.publicEventFilters);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);
  const likeFamily = useAppStore((state) => state.likeFamily);
  const passFamily = useAppStore((state) => state.passFamily);
  const setDiscoveryRadius = useAppStore((state) => state.setDiscoveryRadius);
  const setDiscoveryAvailability = useAppStore((state) => state.setDiscoveryAvailability);
  const setDiscoveryFamilyStage = useAppStore((state) => state.setDiscoveryFamilyStage);
  const toggleDiscoveryInterest = useAppStore((state) => state.toggleDiscoveryInterest);
  const toggleDiscoverySimilarAge = useAppStore((state) => state.toggleDiscoverySimilarAge);
  const resetDiscoveryFilters = useAppStore((state) => state.resetDiscoveryFilters);
  const setPublicEventRadius = useAppStore((state) => state.setPublicEventRadius);
  const setPublicEventAudience = useAppStore((state) => state.setPublicEventAudience);
  const setPublicEventAgeRange = useAppStore((state) => state.setPublicEventAgeRange);
  const togglePublicEventActivity = useAppStore((state) => state.togglePublicEventActivity);
  const resetPublicEventFilters = useAppStore((state) => state.resetPublicEventFilters);
  const requestToJoinGroupPlayDate = useAppStore((state) => state.requestToJoinGroupPlayDate);
  const primaryParent = getPrimaryParent(draftProfile);
  const likedFamilyIds = getActiveLikedFamilyIds(draftProfile, likedFamilyIdsByParent);
  const matchedFamilyIds = getActiveMatchedFamilyIds(draftProfile, matchedFamilyIdsByParent);
  const passedFamilyIds = getActivePassedFamilyIds(draftProfile, passedFamilyIdsByParent);

  const draftChildren = draftProfile.children ?? [];
  const similarAgeOnly = discoveryFilters.similarAgeOnly ?? false;
  const hasDraftChildren = hasBornChildren(draftProfile);
  const showChildDiscoveryControls = hasDraftChildren && discoveryFilters.familyStage === 'all';
  const eventActivityOptions =
    publicEventFilters.audience === 'expecting'
      ? expectingActivityOptions
      : publicEventFilters.audience === 'children'
        ? groupActivityOptions
        : [...groupActivityOptions, ...expectingActivityOptions.filter((option) => !groupActivityOptions.includes(option))];
  const familyById = useMemo(
    () =>
      Object.fromEntries([
        [currentFamilyId, { parentName: primaryParent?.firstName ?? 'Parent', avatarUrl: primaryParent?.avatarUrl }],
        ...families.map((family) => {
          const publicParent = getPrimaryParent(family);
          return [family.id, { parentName: publicParent?.firstName ?? 'Parent', avatarUrl: publicParent?.avatarUrl }] as const;
        }),
      ]),
    [currentFamilyId, families, primaryParent]
  );

  const visibleFamilies = useMemo(
    () =>
      families
        .map((family, index) => ({
          distanceKm: getDistanceKm(draftProfile.homeLocation, family.homeLocation),
          family,
          index,
        }))
        .filter(({ family }) => {
          const familyChildren = family.children ?? [];
          if (passedFamilyIds.includes(family.id)) return false;
          if (!isWithinRadius(draftProfile.homeLocation, family.homeLocation, discoveryFilters.radiusKm)) return false;
          if (discoveryFilters.availability !== 'Any' && !family.availability.includes(discoveryFilters.availability)) return false;
          if (discoveryFilters.familyStage === 'expecting' && !isExpectingFamily(family)) return false;
          if (
            showChildDiscoveryControls &&
            discoveryFilters.selectedInterests.length > 0 &&
            !discoveryFilters.selectedInterests.some((interest) => getAllChildInterests(familyChildren).includes(interest))
          ) {
            return false;
          }
          if (showChildDiscoveryControls && similarAgeOnly && !isSimilarAgeFamily(draftChildren, familyChildren)) {
            return false;
          }
          return true;
        })
        .sort((left, right) => {
          const leftDistance = left.distanceKm ?? Number.POSITIVE_INFINITY;
          const rightDistance = right.distanceKm ?? Number.POSITIVE_INFINITY;

          if (leftDistance !== rightDistance) {
            return leftDistance - rightDistance;
          }

          const leftAgeSortValue = getFamilySortValue(draftChildren, left.family.children ?? []);
          const rightAgeSortValue = getFamilySortValue(draftChildren, right.family.children ?? []);
          const leftHasAgeFit = Number.isFinite(leftAgeSortValue);
          const rightHasAgeFit = Number.isFinite(rightAgeSortValue);

          if (leftHasAgeFit !== rightHasAgeFit) {
            return leftHasAgeFit ? -1 : 1;
          }

          if (leftHasAgeFit && rightHasAgeFit && leftAgeSortValue !== rightAgeSortValue) {
            return leftAgeSortValue - rightAgeSortValue;
          }

          const leftDueMonthSortValue = getDueMonthGapSortValue(draftProfile.expecting, left.family.expecting);
          const rightDueMonthSortValue = getDueMonthGapSortValue(draftProfile.expecting, right.family.expecting);
          const leftHasDueMonthFit = Number.isFinite(leftDueMonthSortValue);
          const rightHasDueMonthFit = Number.isFinite(rightDueMonthSortValue);

          if (leftHasDueMonthFit !== rightHasDueMonthFit) {
            return leftHasDueMonthFit ? -1 : 1;
          }

          if (leftHasDueMonthFit && rightHasDueMonthFit && leftDueMonthSortValue !== rightDueMonthSortValue) {
            return leftDueMonthSortValue - rightDueMonthSortValue;
          }

          const sharedParentInterestDelta =
            getSharedParentInterestCount(draftProfile, right.family) - getSharedParentInterestCount(draftProfile, left.family);
          if (sharedParentInterestDelta !== 0) {
            return sharedParentInterestDelta;
          }

          const sharedLanguageDelta =
            getSharedLanguageCount(draftProfile, right.family) - getSharedLanguageCount(draftProfile, left.family);
          if (sharedLanguageDelta !== 0) {
            return sharedLanguageDelta;
          }

          const sharedVibeDelta =
            getSharedFamilyVibeCount(draftProfile, right.family) - getSharedFamilyVibeCount(draftProfile, left.family);
          if (sharedVibeDelta !== 0) {
            return sharedVibeDelta;
          }

          return left.index - right.index;
        })
        .map(({ family }) => family),
    [discoveryFilters, draftChildren, draftProfile, families, passedFamilyIds, showChildDiscoveryControls, similarAgeOnly]
  );

  const visiblePublicEvents = useMemo(
    () =>
      getDiscoverablePublicEvents({
        currentFamilyId,
        draftProfile,
        filters: publicEventFilters,
        groupPlayDates,
      }),
    [currentFamilyId, draftProfile, groupPlayDates, publicEventFilters]
  );

  const familyFilterCount =
    (discoveryFilters.radiusKm === DEFAULT_DISCOVERY_RADIUS_KM ? 0 : 1) +
    (discoveryFilters.availability === 'Any' ? 0 : 1) +
    (discoveryFilters.familyStage === 'expecting' ? 1 : 0) +
    (showChildDiscoveryControls ? discoveryFilters.selectedInterests.length : 0) +
    (showChildDiscoveryControls && similarAgeOnly ? 1 : 0);
  const publicEventFilterCount =
    (publicEventFilters.radiusKm === DEFAULT_DISCOVERY_RADIUS_KM ? 0 : 1) +
    (publicEventFilters.audience === ANY_PUBLIC_EVENT_AUDIENCE ? 0 : 1) +
    (publicEventFilters.audience === 'children' && publicEventFilters.ageRange !== ANY_PUBLIC_EVENT_AGE ? 1 : 0) +
    publicEventFilters.selectedActivityTags.length;
  const pendingCount = likedFamilyIds.filter((familyId) => !matchedFamilyIds.includes(familyId)).length;
  const ownershipChipLabel =
    mode === 'families' ? 'Likes and matches stay with each parent' : 'Public events are shared with co-parents';

  const heroCopy =
    mode === 'families'
      ? familyFilterCount === 0
        ? `${visibleFamilies.length} nearby families are currently in view.`
        : `${visibleFamilies.length} nearby families match ${familyFilterCount} active filter${familyFilterCount === 1 ? '' : 's'}.`
      : publicEventFilterCount === 0
        ? `${visiblePublicEvents.length} public events are currently discoverable nearby.`
        : `${visiblePublicEvents.length} public events match ${publicEventFilterCount} active filter${publicEventFilterCount === 1 ? '' : 's'}.`;
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [24, 92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Screen
      header={<MainAppHeader title="Discover" titleOpacity={headerTitleOpacity} />}
      scroll
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>
          Browse nearby families or switch over to public events. Expecting parents stay in the same feed, while group events still stay shared with co-parents.
        </Text>
      </View>

      <Card>
        <View style={styles.segmentRow}>
          <SegmentButton active={mode === 'families'} label="Families" onPress={() => setMode('families')} />
          <SegmentButton active={mode === 'events'} label="Public events" onPress={() => setMode('events')} />
        </View>
        <Chip label={ownershipChipLabel} />

        <View style={styles.filterHeader}>
          <View style={styles.filterHeaderText}>
            <Text style={styles.filterTitle}>{mode === 'families' ? 'Family discovery' : 'Public event discovery'}</Text>
            <Text style={styles.filterSubtitle}>{heroCopy}</Text>
          </View>
          <Pressable onPress={() => setShowFilters((value) => !value)} style={styles.linkButton}>
            <Text style={styles.linkText}>{showFilters ? 'Hide' : 'Edit'}</Text>
          </Pressable>
        </View>

        <View style={styles.filters}>
          {mode === 'families' ? (
            <>
              <Chip label={formatRadiusLabel(discoveryFilters.radiusKm)} />
              <Chip label={discoveryFilters.availability} />
              {discoveryFilters.familyStage === 'expecting' ? <Chip label="Expecting" /> : null}
              {showChildDiscoveryControls && similarAgeOnly ? <Chip label="Similar age" /> : null}
              {showChildDiscoveryControls &&
                discoveryFilters.selectedInterests.map((interest) => (
                <Chip key={interest} label={interest} />
                ))}
            </>
          ) : (
            <>
              <Chip label={formatRadiusLabel(publicEventFilters.radiusKm)} />
              {publicEventFilters.audience !== ANY_PUBLIC_EVENT_AUDIENCE ? (
                <Chip label={publicEventFilters.audience === 'expecting' ? 'Expecting parents' : 'Families with children'} />
              ) : null}
              {publicEventFilters.audience === 'children' && publicEventFilters.ageRange !== ANY_PUBLIC_EVENT_AGE ? (
                <Chip label={publicEventFilters.ageRange} />
              ) : null}
              {publicEventFilters.selectedActivityTags.map((tag) => (
                <Chip key={tag} label={tag} />
              ))}
            </>
          )}
        </View>

        {mode === 'families' && pendingCount > 0 ? (
          <Pressable onPress={() => router.push('/(tabs)/connections')} style={styles.connectionsLink}>
            <Text style={styles.pendingHint}>
              {pendingCount} family interest{pendingCount === 1 ? '' : 's'} waiting in Connections.
            </Text>
          </Pressable>
        ) : null}

        {showFilters ? (
          <View style={styles.filterPanel}>
            {mode === 'families' ? (
              <>
                <View style={styles.filterGroup}>
                  <Text style={styles.groupLabel}>Distance</Text>
                  <View style={styles.filters}>
                    {distanceRadiusOptions.map((radiusKm) => (
                      <SelectableChip
                        key={radiusKm === null ? 'any-distance' : `${radiusKm}-km`}
                        label={formatRadiusLabel(radiusKm)}
                        selected={discoveryFilters.radiusKm === radiusKm}
                        onPress={() => setDiscoveryRadius(radiusKm)}
                      />
                    ))}
                  </View>
                </View>
                <View style={styles.filterGroup}>
                  <Text style={styles.groupLabel}>Availability</Text>
                  <View style={styles.filters}>
                    {availabilityOptions.map((option) => (
                      <SelectableChip
                        key={option}
                        label={option}
                        selected={discoveryFilters.availability === option}
                        onPress={() => setDiscoveryAvailability(option)}
                      />
                    ))}
                  </View>
                </View>
                <View style={styles.filterGroup}>
                  <Text style={styles.groupLabel}>Family stage</Text>
                  <View style={styles.filters}>
                    <SelectableChip
                      label="All families"
                      selected={discoveryFilters.familyStage === 'all'}
                      onPress={() => setDiscoveryFamilyStage('all')}
                    />
                    <SelectableChip
                      label="Expecting"
                      selected={discoveryFilters.familyStage === 'expecting'}
                      onPress={() => setDiscoveryFamilyStage('expecting')}
                    />
                  </View>
                </View>
                {showChildDiscoveryControls ? (
                  <>
                    <View style={styles.filterGroup}>
                      <Text style={styles.groupLabel}>Age fit</Text>
                      <View style={styles.filters}>
                        <SelectableChip label="Similar age" selected={similarAgeOnly} onPress={toggleDiscoverySimilarAge} />
                      </View>
                    </View>
                    <View style={styles.filterGroup}>
                      <Text style={styles.groupLabel}>Shared interests</Text>
                      <View style={styles.filters}>
                        {childInterestOptions.map((interest) => (
                          <SelectableChip
                            key={interest}
                            label={interest}
                            selected={discoveryFilters.selectedInterests.includes(interest)}
                            onPress={() => toggleDiscoveryInterest(interest)}
                          />
                        ))}
                      </View>
                    </View>
                  </>
                ) : null}
                <Button label="Reset filters" variant="secondary" onPress={resetDiscoveryFilters} />
              </>
            ) : (
              <>
                <View style={styles.filterGroup}>
                  <Text style={styles.groupLabel}>Distance</Text>
                  <View style={styles.filters}>
                    {distanceRadiusOptions.map((radiusKm) => (
                      <SelectableChip
                        key={radiusKm === null ? 'any-event-distance' : `event-${radiusKm}-km`}
                        label={formatRadiusLabel(radiusKm)}
                        selected={publicEventFilters.radiusKm === radiusKm}
                        onPress={() => setPublicEventRadius(radiusKm)}
                      />
                    ))}
                  </View>
                </View>
                <View style={styles.filterGroup}>
                  <Text style={styles.groupLabel}>Audience</Text>
                  <View style={styles.filters}>
                    <SelectableChip
                      label="All events"
                      selected={publicEventFilters.audience === ANY_PUBLIC_EVENT_AUDIENCE}
                      onPress={() => setPublicEventAudience(ANY_PUBLIC_EVENT_AUDIENCE)}
                    />
                    <SelectableChip
                      label="Families with children"
                      selected={publicEventFilters.audience === 'children'}
                      onPress={() => setPublicEventAudience('children')}
                    />
                    <SelectableChip
                      label="Expecting parents"
                      selected={publicEventFilters.audience === 'expecting'}
                      onPress={() => setPublicEventAudience('expecting')}
                    />
                  </View>
                </View>
                {publicEventFilters.audience === 'children' ? (
                  <View style={styles.filterGroup}>
                    <Text style={styles.groupLabel}>Age range</Text>
                    <View style={styles.filters}>
                      <SelectableChip
                        label={ANY_PUBLIC_EVENT_AGE}
                        selected={publicEventFilters.ageRange === ANY_PUBLIC_EVENT_AGE}
                        onPress={() => setPublicEventAgeRange(ANY_PUBLIC_EVENT_AGE)}
                      />
                      {groupAgeRangeOptions.map((ageRange) => (
                        <SelectableChip
                          key={ageRange}
                          label={ageRange}
                          selected={publicEventFilters.ageRange === ageRange}
                          onPress={() => setPublicEventAgeRange(ageRange)}
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
                <View style={styles.filterGroup}>
                  <Text style={styles.groupLabel}>Activities</Text>
                  <View style={styles.filters}>
                    {eventActivityOptions.map((tag) => (
                      <SelectableChip
                        key={tag}
                        label={tag}
                        selected={publicEventFilters.selectedActivityTags.includes(tag)}
                        onPress={() => togglePublicEventActivity(tag)}
                      />
                    ))}
                  </View>
                </View>
                <Button label="Reset filters" variant="secondary" onPress={resetPublicEventFilters} />
              </>
            )}
          </View>
        ) : null}
      </Card>

      {mode === 'families' ? (
        visibleFamilies.length === 0 ? (
          <EmptyState
            title="No families match these filters"
            body="Try broadening the family stage, distance, or availability so the prototype can show more nearby parents again."
            actionLabel="Reset filters"
            onAction={resetDiscoveryFilters}
          />
        ) : (
          visibleFamilies.map((family) => {
            const isMatched = matchedFamilyIds.includes(family.id);
            const isLiked = likedFamilyIds.includes(family.id);
            const publicParent = getPrimaryParent(family);

            return (
              <FamilyCard
                key={family.id}
                availability={family.availability}
                avatarUrl={publicParent?.avatarUrl ?? ''}
                children={family.children ?? []}
                distanceLabel={getFamilyDistanceLabel(draftProfile, family)}
                expecting={family.expecting}
                familyVibe={family.familyVibe}
                fitChips={getFamilyFitChips(draftProfile, family)}
                languages={publicParent?.languages ?? []}
                parentInterests={publicParent?.interests ?? []}
                parentName={publicParent?.firstName ?? 'Parent'}
                photoUrls={family.photoUrls}
                summary={family.summary}
                status={isMatched ? 'matched' : isLiked ? 'liked' : 'default'}
                onPressPass={() => passFamily(family.id)}
                onPressInterested={() => likeFamily(family.id)}
                onPressOpen={() => router.push(`/family/${family.id}`)}
              />
            );
          })
        )
      ) : visiblePublicEvents.length === 0 ? (
        <EmptyState
          title="No public events match these filters"
          body="Try broadening the distance or audience to find more open events nearby."
          actionLabel="Reset filters"
          onAction={resetPublicEventFilters}
        />
      ) : (
        visiblePublicEvents.map((groupPlayDate) => {
          const host = familyById[groupPlayDate.hostFamilyId];
          const isRequestedByThisParent =
            groupPlayDate.membership === 'requested' &&
            groupPlayDate.includedParentIds.includes(draftProfile.activeParentId);
          const isRequestedByLinkedParent =
            groupPlayDate.membership === 'requested' &&
            !groupPlayDate.includedParentIds.includes(draftProfile.activeParentId);
          const isFull = isGroupFull(groupPlayDate);

          return (
            <PublicEventCard
              key={groupPlayDate.id}
              audienceLabel={getGroupAudienceLabel(groupPlayDate)}
              attendeeCount={groupPlayDate.attendeeFamilyIds.length}
              capacity={groupPlayDate.capacity}
              ctaDisabled={isRequestedByThisParent || isRequestedByLinkedParent || isFull}
              ctaLabel={
                isRequestedByThisParent
                  ? 'Request sent'
                  : isRequestedByLinkedParent
                    ? 'Requested by linked parent'
                    : isFull
                      ? 'Full'
                      : 'Request to join'
              }
              dateLabel={groupPlayDate.dateLabel}
              distanceLabel={getGroupDistanceLabel(draftProfile, groupPlayDate)}
              hostAvatarUrl={host?.avatarUrl}
              hostName={host?.parentName ?? 'Nearby host'}
              locationName={groupPlayDate.locationName}
              note={groupPlayDate.note}
              onPressCta={() => requestToJoinGroupPlayDate(groupPlayDate.id)}
              onPressOpen={() => router.push({ pathname: '/group/[id]', params: { id: groupPlayDate.id } })}
              primaryVariant={isRequestedByThisParent || isRequestedByLinkedParent || isFull ? 'secondary' : 'primary'}
              timeLabel={groupPlayDate.timeLabel}
              title={groupPlayDate.title}
              topActivity={groupPlayDate.activityTags[0]}
            />
          );
        })
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
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  segmentButtonActive: {
    backgroundColor: colors.primarySoft,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  segmentButtonTextActive: {
    color: colors.primary,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  filterHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  filterSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  linkButton: {
    paddingVertical: spacing.sm,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pendingHint: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.primary,
  },
  connectionsLink: {
    alignSelf: 'flex-start',
  },
  filterPanel: {
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  filterGroup: {
    gap: spacing.sm,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.86,
  },
});
