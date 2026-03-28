import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DiscoveryBottomSheet } from '@/components/discovery/DiscoveryBottomSheet';
import { FamilyDetailSheet } from '@/components/discovery/FamilyDetailSheet';
import { FamilyDiscoveryHeroCard } from '@/components/discovery/FamilyDiscoveryHeroCard';
import {
  FamilySwipeStack,
  type FamilySwipeStackEmptyState,
  type FamilySwipeStackHandle,
  type FamilySwipeStackItem,
} from '@/components/discovery/FamilySwipeStack';
import { PublicEventCard } from '@/components/discovery/PublicEventCard';
import { Avatar } from '@/components/ui/Avatar';
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
  getActiveLikedParentIds,
  getActiveMatchedParentIds,
  getActivePassedParentIds,
  hasBornChildren,
  isExpectingFamily,
  getPrimaryParent,
  type Family,
  type ParentAccount,
  useAppStore,
} from '@/store/app-store';
import {
  getDueMonthGapSortValue,
  getDiscoverablePublicEvents,
  getFamilyChildrenSummary,
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
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { getAllChildInterests } from '@/utils/birthdays';
import { getDistanceKm, isWithinRadius } from '@/utils/location';

type DiscoverMode = 'families' | 'events';
type DiscoverableParentEntry = {
  family: Family;
  familyIndex: number;
  parent: ParentAccount;
  parentIndex: number;
};

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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.segmentButton,
        active ? styles.segmentButtonActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.segmentButtonText, active ? styles.segmentButtonTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const [mode, setMode] = useState<DiscoverMode>('families');
  const [showFamilyFilters, setShowFamilyFilters] = useState(false);
  const [showEventFilters, setShowEventFilters] = useState(false);
  const [deckParentIds, setDeckParentIds] = useState<string[]>([]);
  const [detailParentId, setDetailParentId] = useState<string | null>(null);
  const [decisionPending, setDecisionPending] = useState(false);
  const [matchOverlayParentId, setMatchOverlayParentId] = useState<string | null>(null);
  const stackRef = useRef<FamilySwipeStackHandle | null>(null);
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const families = useAppStore((state) => state.families);
  const likedParentIdsByParent = useAppStore((state) => state.likedParentIdsByParent);
  const matchedParentIdsByParent = useAppStore((state) => state.matchedParentIdsByParent);
  const passedParentIdsByParent = useAppStore((state) => state.passedParentIdsByParent);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const discoveryFilters = useAppStore((state) => state.discoveryFilters);
  const publicEventFilters = useAppStore((state) => state.publicEventFilters);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);
  const likeParent = useAppStore((state) => state.likeParent);
  const passParent = useAppStore((state) => state.passParent);
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
  const likedParentIds = getActiveLikedParentIds(draftProfile, likedParentIdsByParent);
  const matchedParentIds = getActiveMatchedParentIds(draftProfile, matchedParentIdsByParent);
  const passedParentIds = getActivePassedParentIds(draftProfile, passedParentIdsByParent);

  const draftChildren = draftProfile.children ?? [];
  const similarAgeOnly = discoveryFilters.similarAgeOnly ?? false;
  const hasDraftChildren = hasBornChildren(draftProfile);
  const showChildDiscoveryControls = hasDraftChildren && discoveryFilters.familyStage === 'all';
  const eventActivityOptions =
    publicEventFilters.audience === 'expecting'
      ? expectingActivityOptions
      : publicEventFilters.audience === 'children'
        ? groupActivityOptions
        : [
            ...groupActivityOptions,
            ...expectingActivityOptions.filter((option) => !groupActivityOptions.includes(option)),
          ];
  const familyById = useMemo(
    () =>
      Object.fromEntries([
        [
          currentFamilyId,
          { parentName: primaryParent?.firstName ?? 'Parent', avatarUrl: primaryParent?.avatarUrl },
        ],
        ...families.map((family) => {
          const publicParent = getPrimaryParent(family);
          return [
            family.id,
            { parentName: publicParent?.firstName ?? 'Parent', avatarUrl: publicParent?.avatarUrl },
          ] as const;
        }),
      ]),
    [currentFamilyId, families, primaryParent]
  );

  const visibleParentEntries = useMemo(
    () =>
      families
        .flatMap((family, familyIndex) =>
          family.parents.map((parent, parentIndex) => ({
            distanceKm: getDistanceKm(draftProfile.homeLocation, family.homeLocation),
            family,
            familyIndex,
            parent,
            parentIndex,
          }))
        )
        .filter(({ family, parent }) => {
          const familyChildren = family.children ?? [];
          if (!parent.isDiscoverable) return false;
          if (passedParentIds.includes(parent.id)) return false;
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
            getSharedParentInterestCount(draftProfile, right.family, right.parent) -
            getSharedParentInterestCount(draftProfile, left.family, left.parent);
          if (sharedParentInterestDelta !== 0) {
            return sharedParentInterestDelta;
          }

          const sharedLanguageDelta =
            getSharedLanguageCount(draftProfile, right.family, right.parent) -
            getSharedLanguageCount(draftProfile, left.family, left.parent);
          if (sharedLanguageDelta !== 0) {
            return sharedLanguageDelta;
          }

          const sharedVibeDelta =
            getSharedFamilyVibeCount(draftProfile, right.family) - getSharedFamilyVibeCount(draftProfile, left.family);
          if (sharedVibeDelta !== 0) {
            return sharedVibeDelta;
          }

          if (left.familyIndex !== right.familyIndex) {
            return left.familyIndex - right.familyIndex;
          }

          return left.parentIndex - right.parentIndex;
        })
        .map(({ family, familyIndex, parent, parentIndex }) => ({
          family,
          familyIndex,
          parent,
          parentIndex,
        })),
    [discoveryFilters, draftChildren, draftProfile, families, passedParentIds, showChildDiscoveryControls, similarAgeOnly]
  );

  const parentQueue = useMemo(
    () => visibleParentEntries.filter((entry) => !likedParentIds.includes(entry.parent.id) && !matchedParentIds.includes(entry.parent.id)),
    [likedParentIds, matchedParentIds, visibleParentEntries]
  );
  const parentQueueIds = useMemo(() => parentQueue.map((entry) => entry.parent.id), [parentQueue]);
  const parentLookup = useMemo(
    () => new Map(visibleParentEntries.map((entry) => [entry.parent.id, entry])),
    [visibleParentEntries]
  );
  const deckParents = useMemo(
    () =>
      deckParentIds
        .map((parentId) => parentLookup.get(parentId))
        .filter((entry): entry is DiscoverableParentEntry => Boolean(entry)),
    [deckParentIds, parentLookup]
  );
  const activeParentEntry = deckParents[0] ?? null;
  const detailParentEntry =
    (detailParentId ? parentLookup.get(detailParentId) : null) ??
    activeParentEntry;
  const matchParentEntry = matchOverlayParentId ? parentLookup.get(matchOverlayParentId) ?? null : null;
  const matchParent = matchParentEntry?.parent ?? null;

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

  const filterButtonDisabled =
    mode === 'families'
      ? decisionPending || showFamilyFilters || Boolean(detailParentId) || Boolean(matchOverlayParentId)
      : showEventFilters;

  useEffect(() => {
    if (mode !== 'families') {
      setShowFamilyFilters(false);
      setDetailParentId(null);
      setDecisionPending(false);
      setDeckParentIds(parentQueueIds);
    }
  }, [mode, parentQueueIds]);

  useEffect(() => {
    if (mode !== 'events') {
      setShowEventFilters(false);
    }
  }, [mode]);

  useEffect(() => {
    setDeckParentIds((previousIds) => {
      const keptIds = previousIds.filter((parentId) => parentQueueIds.includes(parentId));
      const appendedIds = parentQueueIds.filter((parentId) => !keptIds.includes(parentId));
      return [...keptIds, ...appendedIds];
    });
  }, [parentQueueIds]);

  useEffect(() => {
    if (deckParents.length === 0) {
      setDetailParentId(null);
    }
  }, [deckParents.length]);

  const handleDecisionStart = useCallback(() => {
    setDecisionPending(true);
  }, []);

  const handleDecision = useCallback(
    (parentId: string, decision: 'pass' | 'like') => {
      setDeckParentIds((previousIds) => previousIds.filter((id) => id !== parentId));

      const wasMatched = matchedParentIds.includes(parentId);

      if (decision === 'like') {
        likeParent(parentId);
        const nextState = useAppStore.getState();
        const nextMatchedParentIds = getActiveMatchedParentIds(nextState.draftProfile, nextState.matchedParentIdsByParent);

        if (!wasMatched && nextMatchedParentIds.includes(parentId)) {
          setMatchOverlayParentId(parentId);
        }
      } else {
        passParent(parentId);
      }

      setDecisionPending(false);
    },
    [likeParent, matchedParentIds, passParent]
  );

  const renderFamilyCard = useCallback(
    (entry: DiscoverableParentEntry | null, preview = false) => {
      if (!entry) {
        return null;
      }

      const { family, parent } = entry;

      return (
        <FamilyDiscoveryHeroCard
          key={parent.id}
          avatarUrl={parent.avatarUrl}
          distanceLabel={getFamilyDistanceLabel(draftProfile, family)}
          familySummary={getFamilyChildrenSummary(family.children ?? [], family.expecting)}
          fitChips={getFamilyFitChips(draftProfile, family, parent)}
          intro={parent.intro}
          parentName={parent.firstName}
          photoUrl={family.photoUrls[0] ?? parent.avatarUrl}
          preview={preview}
        />
      );
    },
    [draftProfile]
  );

  const stackCards = useMemo<FamilySwipeStackItem[]>(
    () =>
      deckParents.slice(0, 3).map((entry, index) => ({
        id: entry.parent.id,
        node: renderFamilyCard(entry, index > 0),
      })),
    [deckParents, renderFamilyCard]
  );

  const familyEmptyState = useMemo<FamilySwipeStackEmptyState>(
    () =>
      visibleParentEntries.length === 0
        ? {
            title: 'No parents match these filters',
            body: 'Try broadening the family stage, distance, or availability so the prototype can show more nearby parents again.',
            actionLabel: 'Reset filters',
            onAction: resetDiscoveryFilters,
          }
        : {
            title: 'No more parents to review right now',
            body: 'Your current likes and matches have moved on to Matches. You can keep browsing later or review the parents you already connected with there.',
            actionLabel: 'Open matches',
            onAction: () => router.push('/(tabs)/matches'),
          },
    [resetDiscoveryFilters, visibleParentEntries.length]
  );

  const renderEventsMode = () => (
    <ScrollView
      contentContainerStyle={styles.eventsScrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Card>
        <Chip label="Events are shared with co-parents" />

        <Text style={styles.filterSubtitle}>
          {publicEventFilterCount === 0
            ? `${visiblePublicEvents.length} events are currently discoverable nearby.`
            : `${visiblePublicEvents.length} events match ${publicEventFilterCount} active filter${publicEventFilterCount === 1 ? '' : 's'}.`}
        </Text>

        <View style={styles.filters}>
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
        </View>

      </Card>

      {visiblePublicEvents.length === 0 ? (
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
    </ScrollView>
  );

  return (
    <Screen contentStyle={styles.screenContent} edges={['top', 'left', 'right']}>
      <View style={styles.root}>
        <View style={styles.toolbarRow}>
          <View style={styles.modeSwitchShell}>
            <View style={styles.segmentRow}>
              <SegmentButton active={mode === 'families'} label="Parents" onPress={() => setMode('families')} />
              <SegmentButton active={mode === 'events'} label="Events" onPress={() => setMode('events')} />
            </View>
          </View>

          <Pressable
            accessibilityLabel="Open discovery filters"
            accessibilityRole="button"
            accessibilityState={{ disabled: filterButtonDisabled }}
            disabled={filterButtonDisabled}
            onPress={() => {
              if (mode === 'families') {
                setShowFamilyFilters(true);
                return;
              }

              setShowEventFilters(true);
            }}
            style={({ pressed }) => [
              styles.toolbarFilterButton,
              filterButtonDisabled ? styles.disabled : null,
              pressed && !filterButtonDisabled ? styles.pressed : null,
            ]}
          >
            <Ionicons color={colors.text} name="options-outline" size={16} />
            <Text style={styles.toolbarFilterText}>
              Filters
              {mode === 'families'
                ? familyFilterCount > 0
                  ? ` (${familyFilterCount})`
                  : ''
                : publicEventFilterCount > 0
                  ? ` (${publicEventFilterCount})`
                  : ''}
            </Text>
          </Pressable>
        </View>

        {mode === 'families' ? (
          <View style={styles.familyMode}>
            <View style={styles.deckArea}>
              <FamilySwipeStack
                ref={stackRef}
                disabled={decisionPending || showFamilyFilters || Boolean(detailParentId) || Boolean(matchOverlayParentId)}
                emptyState={familyEmptyState}
                items={stackCards}
                onDecision={handleDecision}
                onDecisionStart={handleDecisionStart}
              />
            </View>
          </View>
        ) : (
          renderEventsMode()
        )}
      </View>

      <DiscoveryBottomSheet
        onClose={() => setShowFamilyFilters(false)}
        title="Discovery filters"
        visible={showFamilyFilters}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.filterGroup}>
            <Text style={styles.groupLabel}>Distance</Text>
            <View style={styles.filters}>
              {distanceRadiusOptions.map((radiusKm) => (
                <SelectableChip
                  key={radiusKm === null ? 'any-distance-sheet' : `sheet-${radiusKm}-km`}
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
        </ScrollView>
      </DiscoveryBottomSheet>

      <DiscoveryBottomSheet
        onClose={() => setShowEventFilters(false)}
        title="Event filters"
        visible={showEventFilters}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
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
        </ScrollView>
      </DiscoveryBottomSheet>

      <FamilyDetailSheet
        draftProfile={draftProfile}
        family={detailParentEntry?.family ?? null}
        parent={detailParentEntry?.parent ?? null}
        onClose={() => setDetailParentId(null)}
        onOpenProfile={() => {
          const parentId = detailParentEntry?.parent.id;
          setDetailParentId(null);

          if (parentId) {
            router.push(`/parent/${parentId}`);
          }
        }}
        visible={Boolean(detailParentId && detailParentEntry)}
      />

      {matchParent ? (
        <View pointerEvents="box-none" style={styles.matchOverlayRoot}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setMatchOverlayParentId(null)}
            style={styles.matchBackdrop}
          />
          <View style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <Avatar imageUrl={matchParent.avatarUrl} name={matchParent.firstName} size={56} />
              <View style={styles.matchHeaderCopy}>
                <Text style={styles.matchTitle}>Mutual match</Text>
                <Text style={styles.matchName}>{matchParent.firstName} is interested too</Text>
              </View>
            </View>
            <Text style={styles.matchBody}>
              This match now lives in Matches, where you can jump into chat or keep browsing first.
            </Text>
            <View style={styles.matchActions}>
              <View style={styles.flex}>
                <Button label="Keep browsing" variant="secondary" onPress={() => setMatchOverlayParentId(null)} />
              </View>
              <View style={styles.flex}>
                <Button
                  label="Open matches"
                  onPress={() => {
                    setMatchOverlayParentId(null);
                    router.push('/(tabs)/matches');
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
    gap: 0,
  },
  root: {
    flex: 1,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  toolbarRow: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  modeSwitchShell: {
    flex: 1,
    alignItems: 'center',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    width: '100%',
    maxWidth: 280,
    padding: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.94)',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  segmentButtonTextActive: {
    color: colors.surface,
  },
  toolbarFilterButton: {
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  toolbarFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  familyMode: {
    flex: 1,
  },
  familyEmptyState: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 96,
    paddingHorizontal: spacing.xl,
  },
  deckArea: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  eventsScrollContent: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  filterSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterPanel: {
    gap: spacing.lg,
  },
  filterGroup: {
    gap: spacing.sm,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  sheetContent: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  matchOverlayRoot: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  matchBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 20, 18, 0.46)',
  },
  matchCard: {
    width: '100%',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    gap: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 10,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  matchHeaderCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  matchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  matchName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  matchBody: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  matchActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.55,
  },
});
