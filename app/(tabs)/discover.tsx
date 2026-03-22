import { useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MainAppHeader } from '@/components/navigation/MainAppHeader';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { SelectableChip } from '@/components/ui/SelectableChip';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FamilyCard } from '@/components/discovery/FamilyCard';
import { areaOptions, availabilityOptions, childInterestOptions } from '@/constants/demo-profiles';
import { useAppStore } from '@/store/app-store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function DiscoverScreen() {
  const [showFilters, setShowFilters] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const families = useAppStore((state) => state.families);
  const likedFamilyIds = useAppStore((state) => state.likedFamilyIds);
  const matchedFamilyIds = useAppStore((state) => state.matchedFamilyIds);
  const passedFamilyIds = useAppStore((state) => state.passedFamilyIds);
  const discoveryFilters = useAppStore((state) => state.discoveryFilters);
  const likeFamily = useAppStore((state) => state.likeFamily);
  const passFamily = useAppStore((state) => state.passFamily);
  const setDiscoveryArea = useAppStore((state) => state.setDiscoveryArea);
  const setDiscoveryAvailability = useAppStore((state) => state.setDiscoveryAvailability);
  const toggleDiscoveryInterest = useAppStore((state) => state.toggleDiscoveryInterest);
  const resetDiscoveryFilters = useAppStore((state) => state.resetDiscoveryFilters);

  const visibleFamilies = useMemo(
    () =>
      families.filter((family) => {
        if (passedFamilyIds.includes(family.id)) return false;
        if (discoveryFilters.area !== 'All nearby' && family.area !== discoveryFilters.area) return false;
        if (discoveryFilters.availability !== 'Any' && !family.availability.includes(discoveryFilters.availability)) return false;
        if (
          discoveryFilters.selectedInterests.length > 0 &&
          !discoveryFilters.selectedInterests.some((interest) => family.childInterests.includes(interest))
        ) {
          return false;
        }
        return true;
      }),
    [discoveryFilters, families, passedFamilyIds]
  );
  const activeFilterCount =
    (discoveryFilters.area === 'All nearby' ? 0 : 1) +
    (discoveryFilters.availability === 'Any' ? 0 : 1) +
    discoveryFilters.selectedInterests.length;
  const pendingCount = likedFamilyIds.filter((familyId) => !matchedFamilyIds.includes(familyId)).length;

  const heroCopy =
    activeFilterCount === 0
      ? `${visibleFamilies.length} nearby families are currently in view.`
      : `${visibleFamilies.length} nearby families match ${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}.`;
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
        <Text style={styles.subtitle}>Nearby families, lightweight filters, and a calm first-meetup lens.</Text>
      </View>

      <Card>
        <View style={styles.filterHeader}>
          <View style={styles.filterHeaderText}>
            <Text style={styles.filterTitle}>Discovery filters</Text>
            <Text style={styles.filterSubtitle}>{heroCopy}</Text>
          </View>
          <Pressable onPress={() => setShowFilters((value) => !value)} style={styles.linkButton}>
            <Text style={styles.linkText}>{showFilters ? 'Hide' : 'Edit'}</Text>
          </Pressable>
        </View>
        <View style={styles.filters}>
          <Chip label={discoveryFilters.area} />
          <Chip label={discoveryFilters.availability} />
          {discoveryFilters.selectedInterests.map((interest) => (
            <Chip key={interest} label={interest} />
          ))}
        </View>
        {pendingCount > 0 ? (
          <Pressable onPress={() => router.push('/(tabs)/connections')} style={styles.connectionsLink}>
            <Text style={styles.pendingHint}>
              {pendingCount} family interest{pendingCount === 1 ? '' : 's'} waiting in Connections.
            </Text>
          </Pressable>
        ) : null}
        {showFilters && (
          <View style={styles.filterPanel}>
            <View style={styles.filterGroup}>
              <Text style={styles.groupLabel}>Area</Text>
              <View style={styles.filters}>
                <SelectableChip
                  label="All nearby"
                  selected={discoveryFilters.area === 'All nearby'}
                  onPress={() => setDiscoveryArea('All nearby')}
                />
                {areaOptions.map((area) => (
                  <SelectableChip key={area} label={area} selected={discoveryFilters.area === area} onPress={() => setDiscoveryArea(area)} />
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
            <Button label="Reset filters" variant="secondary" onPress={resetDiscoveryFilters} />
          </View>
        )}
      </Card>

      {visibleFamilies.length === 0 ? (
        <EmptyState
          title="No families match these filters"
          body="Try broadening area or availability so the prototype can show more nearby families again."
          actionLabel="Reset filters"
          onAction={resetDiscoveryFilters}
        />
      ) : (
        visibleFamilies.map((family) => {
          const isMatched = matchedFamilyIds.includes(family.id);
          const isLiked = likedFamilyIds.includes(family.id);

          return (
            <FamilyCard
              key={family.id}
              {...family}
              status={isMatched ? 'matched' : isLiked ? 'liked' : 'default'}
              onPressPass={() => passFamily(family.id)}
              onPressInterested={() => likeFamily(family.id)}
              onPressOpen={() => router.push(`/family/${family.id}`)}
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
});
