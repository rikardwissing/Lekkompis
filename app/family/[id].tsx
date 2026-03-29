import { useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SubscreenHeader } from '@/components/navigation/SubscreenHeader';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { PhotoStrip } from '@/components/ui/PhotoStrip';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  getActiveMatchedFamilyIds,
  getPrimaryParent,
  useAppStore,
} from '@/store/app-store';
import {
  getFamilyDistanceLabel,
  getFamilyFitChips,
  getSharedChildInterests,
  getSharedLanguages,
  getSharedParentInterests,
} from '@/store/derived';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatAgeLabelFromBirthDate, formatChildBirthdayLabel, formatDueMonthLabel, formatParentBirthdayLabel } from '@/utils/birthdays';

export function generateStaticParams() {
  return ['sara', 'fatima', 'johan', 'elin', 'mira'].map((id) => ({ id }));
}

export default function FamilyDetailScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { id } = useLocalSearchParams<{ id: string }>();
  const families = useAppStore((state) => state.families);
  const matchedParentIdsByParent = useAppStore((state) => state.matchedParentIdsByParent);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const family = families.find((item) => item.id === id);
  const familyPrimaryParent = family ? getPrimaryParent(family) : null;
  const matchedFamilyIds = getActiveMatchedFamilyIds(draftProfile, matchedParentIdsByParent, families);
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [24, 92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (!family) {
    return (
      <Screen header={<SubscreenHeader fallbackHref="/(tabs)/discover" title="Family" />}>
        <EmptyState
          title="Family not found"
          body="This family profile is no longer available in the demo, so we could not open the detail view."
          actionLabel="Back to discover"
          onAction={() => router.replace('/(tabs)/discover')}
        />
      </Screen>
    );
  }

  const isMatched = matchedFamilyIds.includes(family.id);
  const familyChildren = family.children ?? [];
  const sharedInterests = [
    ...new Set([
      ...getSharedChildInterests(draftProfile.children ?? [], familyChildren),
      ...getSharedParentInterests(draftProfile, family),
    ]),
  ];
  const sharedLanguages = getSharedLanguages(draftProfile, family);
  const fitChips = getFamilyFitChips(draftProfile, family);
  const distanceLabel = getFamilyDistanceLabel(draftProfile, family);
  const discoverableParents = family.parents.filter((parent) => parent.isDiscoverable);

  return (
    <Screen
      header={<SubscreenHeader fallbackHref="/(tabs)/discover" title={familyPrimaryParent?.firstName ?? 'Family'} titleOpacity={headerTitleOpacity} />}
      scroll
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    >
      <View style={styles.hero}>
        <Avatar name={familyPrimaryParent?.firstName ?? 'Parent'} imageUrl={familyPrimaryParent?.avatarUrl} size={72} />
        <View style={styles.heroText}>
          <Text style={styles.title}>{familyPrimaryParent?.firstName ?? 'Parent'}</Text>
          <Text style={styles.subtitle}>{distanceLabel ?? 'Nearby family'}</Text>
        </View>
      </View>
      <PhotoStrip photos={family.photoUrls} size={116} />
      <Card>
        <Text style={styles.sectionTitle}>About this family</Text>
        <View style={styles.row}>
          {distanceLabel ? <Chip label={distanceLabel} /> : null}
        </View>
        <Text style={styles.body}>{family.familySummary}</Text>
        {family.expecting ? (
          <>
            <Text style={styles.sectionTitle}>Expecting</Text>
            <View style={styles.row}>
              <Chip label="Expecting" />
              <Chip label={formatDueMonthLabel(family.expecting.dueMonth)} />
            </View>
          </>
        ) : null}
        <Text style={styles.sectionTitle}>Parent interests</Text>
        <View style={styles.row}>
          {(familyPrimaryParent?.interests ?? []).map((item) => (
            <Chip key={item} label={item} />
          ))}
        </View>
        <Text style={styles.sectionTitle}>Spoken languages</Text>
        <View style={styles.row}>
          {(familyPrimaryParent?.languages ?? []).map((item) => (
            <Chip key={item} label={item} />
          ))}
        </View>
        <Text style={styles.sectionTitle}>Children</Text>
        {familyChildren.length > 0 ? (
          <View style={styles.childStack}>
            {familyChildren.map((child) => {
              const birthdayLabel = formatChildBirthdayLabel(child.name, child.birthDate);
              return (
                <View key={child.id} style={styles.childBlock}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.body}>{formatAgeLabelFromBirthDate(child.birthDate)}</Text>
                  {isMatched && birthdayLabel ? <Text style={styles.metaLine}>{birthdayLabel}</Text> : null}
                  <View style={styles.row}>
                    {child.interests.map((item) => (
                      <Chip key={`${child.id}-${item}`} label={item} />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.body}>No born children added yet. This family is currently matching through parent details and expecting stage.</Text>
        )}
        {isMatched && familyPrimaryParent?.birthDate ? (
          <>
            <Text style={styles.sectionTitle}>Parent birthday</Text>
            <Text style={styles.body}>
              {formatParentBirthdayLabel(familyPrimaryParent.firstName, familyPrimaryParent.birthDate) ?? 'Not set'}
            </Text>
          </>
        ) : null}
        <Text style={styles.sectionTitle}>Why this could be a fit</Text>
        <View style={styles.row}>
          {fitChips.map((item) => (
            <Chip key={item} label={item} />
          ))}
        </View>
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Shared interests</Text>
        <View style={styles.row}>
          {sharedInterests.length > 0 ? sharedInterests.map((item) => <Chip key={item} label={item} />) : <Chip label={fitChips[0] ?? 'Good fit'} />}
        </View>
        <Text style={styles.sectionTitle}>Shared languages</Text>
        <View style={styles.row}>
          {sharedLanguages.length > 0 ? sharedLanguages.map((item) => <Chip key={item} label={item} />) : <Chip label="English-friendly" />}
        </View>
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.row}>
          {family.availability.map((item) => (
            <Chip key={item} label={item} />
          ))}
        </View>
        <Text style={styles.sectionTitle}>First meetup tone</Text>
        <Text style={styles.body}>{family.meetupNote}</Text>
      </Card>
      <View style={styles.actions}>
        {discoverableParents.length > 0 ? (
          <Button
            label="View discoverable parent"
            onPress={() => router.push(`/parent/${discoverableParents[0].id}`)}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  heroText: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  childStack: {
    gap: spacing.md,
  },
  childBlock: {
    gap: spacing.sm,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  metaLine: {
    fontSize: 13,
    color: colors.textMuted,
  },
  actions: {
    gap: spacing.md,
  },
});
