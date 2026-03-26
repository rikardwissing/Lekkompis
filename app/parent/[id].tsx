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
  buildDirectMatchId,
  getActiveLikedParentIds,
  getActiveMatchedParentIds,
  getActiveParent,
  getFamilyByParentId,
  getLinkedParentMatchedParentIds,
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

export default function ParentDetailScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { id } = useLocalSearchParams<{ id: string }>();
  const families = useAppStore((state) => state.families);
  const likeParent = useAppStore((state) => state.likeParent);
  const likedParentIdsByParent = useAppStore((state) => state.likedParentIdsByParent);
  const matchedParentIdsByParent = useAppStore((state) => state.matchedParentIdsByParent);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const family = id ? getFamilyByParentId(families, id) : null;
  const parent = family?.parents.find((entry) => entry.id === id) ?? null;
  const activeParent = getActiveParent(draftProfile);
  const likedParentIds = getActiveLikedParentIds(draftProfile, likedParentIdsByParent);
  const matchedParentIds = getActiveMatchedParentIds(draftProfile, matchedParentIdsByParent);
  const linkedParentMatchedParentIds = getLinkedParentMatchedParentIds(draftProfile, matchedParentIdsByParent);
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [24, 92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (!family || !parent) {
    return (
      <Screen header={<SubscreenHeader fallbackHref="/(tabs)/discover" title="Parent" />}>
        <EmptyState
          title="Parent not found"
          body="This parent profile is no longer available in the demo, so we could not open the detail view."
          actionLabel="Back to discover"
          onAction={() => router.replace('/(tabs)/discover')}
        />
      </Screen>
    );
  }

  const isMatched = matchedParentIds.includes(parent.id);
  const isLiked = likedParentIds.includes(parent.id);
  const linkedParentHasConnection = !isMatched && linkedParentMatchedParentIds.includes(parent.id);
  const familyChildren = family.children ?? [];
  const sharedInterests = [
    ...new Set([
      ...getSharedChildInterests(draftProfile.children ?? [], familyChildren),
      ...getSharedParentInterests(draftProfile, family, parent),
    ]),
  ];
  const sharedLanguages = getSharedLanguages(draftProfile, family, parent);
  const fitChips = getFamilyFitChips(draftProfile, family, parent);
  const distanceLabel = getFamilyDistanceLabel(draftProfile, family);
  const matchId = activeParent ? buildDirectMatchId(activeParent.id, parent.id) : null;
  const actionLabel = isMatched ? 'Open chat' : isLiked ? 'Pending' : linkedParentHasConnection ? 'Add to my account' : 'Interested';

  return (
    <Screen
      header={<SubscreenHeader fallbackHref="/(tabs)/discover" title={parent.firstName} titleOpacity={headerTitleOpacity} />}
      scroll
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    >
      <View style={styles.hero}>
        <Avatar name={parent.firstName} imageUrl={parent.avatarUrl} size={72} />
        <View style={styles.heroText}>
          <Text style={styles.title}>{parent.firstName}</Text>
          <Text style={styles.subtitle}>{distanceLabel ?? 'Nearby family'}</Text>
        </View>
      </View>
      <PhotoStrip photos={family.photoUrls} size={116} />
      <Card>
        <Text style={styles.sectionTitle}>About {parent.firstName}</Text>
        <View style={styles.row}>
          {distanceLabel ? <Chip label={distanceLabel} /> : null}
        </View>
        <Text style={styles.body}>{parent.intro}</Text>
        <Text style={styles.sectionTitle}>About this family</Text>
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
          {parent.interests.map((item) => (
            <Chip key={item} label={item} />
          ))}
        </View>
        <Text style={styles.sectionTitle}>Spoken languages</Text>
        <View style={styles.row}>
          {parent.languages.map((item) => (
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
        {isMatched && parent.birthDate ? (
          <>
            <Text style={styles.sectionTitle}>Birthday</Text>
            <Text style={styles.body}>
              {formatParentBirthdayLabel(parent.firstName, parent.birthDate) ?? 'Not set'}
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
        {linkedParentHasConnection ? (
          <Text style={styles.sharedConnectionNote}>
            {parent.firstName} is already connected with another linked parent in your family. Add them to your own account to join the direct thread as yourself.
          </Text>
        ) : null}
      </Card>
      <View style={styles.actions}>
        <Button
          disabled={isLiked && !isMatched}
          label={actionLabel}
          onPress={() => {
            if (isMatched && matchId) {
              router.push(`/chat/${matchId}`);
              return;
            }

            if (isLiked) {
              return;
            }

            likeParent(parent.id);
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
