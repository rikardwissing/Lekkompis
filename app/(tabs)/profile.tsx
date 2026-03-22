import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { PhotoStrip } from '@/components/ui/PhotoStrip';
import { useAppStore } from '@/store/app-store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function ProfileScreen() {
  const draftProfile = useAppStore((state) => state.draftProfile);
  const resetDemoState = useAppStore((state) => state.resetDemoState);

  return (
    <Screen scroll>
      <Text style={styles.title}>My family</Text>
      <Card>
        <View style={styles.identity}>
          <Avatar name={draftProfile.parentName} imageUrl={draftProfile.avatarUrl} size={72} />
          <View style={styles.identityText}>
            <Text style={styles.name}>{draftProfile.parentName}</Text>
            <Text style={styles.meta}>{draftProfile.area}</Text>
          </View>
        </View>
        <Text style={styles.body}>{draftProfile.bio}</Text>
        <PhotoStrip photos={draftProfile.photoUrls} size={104} />
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Parent highlights</Text>
        <Text style={styles.metaLabel}>Interests</Text>
        <View style={styles.row}>
          {draftProfile.parentInterests.map((interest) => (
            <Chip key={interest} label={interest} />
          ))}
        </View>
        <Text style={styles.metaLabel}>Spoken languages</Text>
        <View style={styles.row}>
          {draftProfile.languages.map((language) => (
            <Chip key={language} label={language} />
          ))}
        </View>
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>{draftProfile.childName}</Text>
        <Text style={styles.meta}>{draftProfile.childAgeLabel}</Text>
        <View style={styles.row}>
          {draftProfile.childInterests.map((interest) => (
            <Chip key={interest} label={interest} />
          ))}
        </View>
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Family vibe</Text>
        <View style={styles.row}>
          {draftProfile.familyVibe.map((item) => (
            <Chip key={item} label={item} />
          ))}
        </View>
      </Card>
      <Button label="Reset demo" variant="secondary" onPress={resetDemoState} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  identityText: {
    gap: spacing.xs,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 14,
    color: colors.textMuted,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
