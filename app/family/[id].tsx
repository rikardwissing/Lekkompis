import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAppStore } from '@/store/app-store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function generateStaticParams() {
  return ['sara', 'fatima', 'johan', 'elin'].map((id) => ({ id }));
}

export default function FamilyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const families = useAppStore((state) => state.families);
  const likeFamily = useAppStore((state) => state.likeFamily);
  const matchedFamilyIds = useAppStore((state) => state.matchedFamilyIds);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const family = families.find((item) => item.id === id) ?? families[0];
  const isMatched = matchedFamilyIds.includes(family.id);
  const sharedInterests = family.childInterests.filter((interest) => draftProfile.childInterests.includes(interest));

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Avatar name={family.parentName} imageUrl={family.avatarUrl} size={72} />
        <View style={styles.heroText}>
          <Text style={styles.title}>{family.parentName}</Text>
          <Text style={styles.subtitle}>{family.area}</Text>
        </View>
      </View>
      <Card>
        <Text style={styles.sectionTitle}>About this family</Text>
        <Text style={styles.body}>{family.summary}</Text>
        <Text style={styles.sectionTitle}>Children</Text>
        <Text style={styles.body}>{family.childSummary} · {family.childAgeLabel}</Text>
        <Text style={styles.sectionTitle}>Why this could be a fit</Text>
        <View style={styles.row}>
          {family.shared.map((item) => (
            <Chip key={item} label={item} />
          ))}
        </View>
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Shared interests</Text>
        <View style={styles.row}>
          {sharedInterests.length > 0 ? sharedInterests.map((item) => <Chip key={item} label={item} />) : <Chip label="Good age fit" />}
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
        <Button label="Back" variant="secondary" onPress={() => router.back()} />
        <Button
          label={isMatched ? 'Open chat' : 'Interested'}
          onPress={() => {
            if (isMatched) {
              router.push('/chat/sara-match');
              return;
            }

            likeFamily(family.id);
            router.push('/(tabs)/matches');
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
  actions: {
    gap: spacing.md,
  },
});
