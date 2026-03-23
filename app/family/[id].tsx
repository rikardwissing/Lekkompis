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
  getActiveLikedFamilyIds,
  getActiveMatchedFamilyIds,
  getLinkedParentMatchedFamilyIds,
  getPrimaryParent,
  useAppStore,
} from '@/store/app-store';
import { getFamilyFitChips, getSharedChildInterests } from '@/store/derived';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatAgeLabelFromBirthDate, formatChildBirthdayLabel, formatParentBirthdayLabel } from '@/utils/birthdays';

export function generateStaticParams() {
  return ['sara', 'fatima', 'johan', 'elin'].map((id) => ({ id }));
}

export default function FamilyDetailScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { id } = useLocalSearchParams<{ id: string }>();
  const families = useAppStore((state) => state.families);
  const likeFamily = useAppStore((state) => state.likeFamily);
  const likedFamilyIdsByParent = useAppStore((state) => state.likedFamilyIdsByParent);
  const matchedFamilyIdsByParent = useAppStore((state) => state.matchedFamilyIdsByParent);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const family = families.find((item) => item.id === id);
  const currentFamilyPrimaryParent = getPrimaryParent(draftProfile);
  const familyPrimaryParent = family ? getPrimaryParent(family) : null;
  const likedFamilyIds = getActiveLikedFamilyIds(draftProfile, likedFamilyIdsByParent);
  const matchedFamilyIds = getActiveMatchedFamilyIds(draftProfile, matchedFamilyIdsByParent);
  const linkedParentMatchedFamilyIds = getLinkedParentMatchedFamilyIds(draftProfile, matchedFamilyIdsByParent);
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
  const isLiked = likedFamilyIds.includes(family.id);
  const familyChildren = family.children ?? [];
  const sharedInterests = getSharedChildInterests(draftProfile.children ?? [], familyChildren);
  const sharedLanguages = (familyPrimaryParent?.languages ?? []).filter((language) =>
    currentFamilyPrimaryParent?.languages.includes(language)
  );
  const fitChips = getFamilyFitChips(draftProfile, family);
  const sharedConnectionAvailable = !isMatched && linkedParentMatchedFamilyIds.includes(family.id);
  const actionLabel = isMatched ? 'Open chat' : isLiked ? 'Pending' : sharedConnectionAvailable ? 'Add to my account' : 'Interested';

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
          <Text style={styles.subtitle}>{family.area}</Text>
        </View>
      </View>
      <PhotoStrip photos={family.photoUrls} size={116} />
      <Card>
        <Text style={styles.sectionTitle}>About this family</Text>
        <Text style={styles.body}>{family.summary}</Text>
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
          {sharedInterests.length > 0 ? sharedInterests.map((item) => <Chip key={item} label={item} />) : <Chip label="Good age fit" />}
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
        {sharedConnectionAvailable ? (
          <Text style={styles.sharedConnectionNote}>
            {familyPrimaryParent?.firstName ?? 'This parent'} is already connected with another linked parent in your family. Add them to your own account to join the direct thread as yourself.
          </Text>
        ) : null}
      </Card>
      <View style={styles.actions}>
        <Button
          disabled={isLiked && !isMatched}
          label={actionLabel}
          onPress={() => {
            if (isMatched) {
              router.push(`/chat/${family.id}-match`);
              return;
            }

            if (isLiked) {
              return;
            }

            likeFamily(family.id);
            router.push('/(tabs)/connections');
          }}
        />
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
  sharedConnectionNote: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.primary,
  },
});
