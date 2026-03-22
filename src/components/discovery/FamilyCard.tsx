import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { PhotoStrip } from '@/components/ui/PhotoStrip';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type FamilyCardProps = {
  parentName: string;
  avatarUrl: string;
  photoUrls: string[];
  area: string;
  summary: string;
  childSummary: string;
  childAgeLabel: string;
  childInterests: string[];
  parentInterests: string[];
  languages: string[];
  shared: string[];
  familyVibe: string[];
  availability: string[];
  status?: 'default' | 'liked' | 'matched';
  onPressInterested?: () => void;
  onPressPass?: () => void;
  onPressOpen?: () => void;
};

export function FamilyCard({
  parentName,
  avatarUrl,
  photoUrls,
  area,
  summary,
  childSummary,
  childAgeLabel,
  childInterests,
  parentInterests,
  languages,
  shared,
  familyVibe,
  availability,
  status = 'default',
  onPressInterested,
  onPressPass,
  onPressOpen,
}: FamilyCardProps) {
  const interestedLabel = status === 'matched' ? 'Open' : status === 'liked' ? 'Pending' : 'Interested';
  const interestedDisabled = status === 'liked';

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.identity}>
          <Avatar name={parentName} imageUrl={avatarUrl} />
          <View style={styles.identityText}>
            <Text style={styles.name}>{parentName}</Text>
            <Text style={styles.area}>{area}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.summary}>{summary}</Text>
      <PhotoStrip photos={photoUrls} size={96} />
      <Text style={styles.child}>{childSummary} · {childAgeLabel}</Text>
      <View style={styles.chips}>
        {shared.map((item) => (
          <Chip key={item} label={item} />
        ))}
      </View>
      <View style={styles.metaBlock}>
        <Text style={styles.metaTitle}>Parent interests</Text>
        <Text style={styles.metaCopy}>{parentInterests.join(' · ')}</Text>
      </View>
      <View style={styles.metaBlock}>
        <Text style={styles.metaTitle}>Spoken languages</Text>
        <Text style={styles.metaCopy}>{languages.join(' · ')}</Text>
      </View>
      <View style={styles.metaBlock}>
        <Text style={styles.metaTitle}>Child interests</Text>
        <Text style={styles.metaCopy}>{childInterests.join(' · ')}</Text>
      </View>
      <View style={styles.metaBlock}>
        <Text style={styles.metaTitle}>Family vibe</Text>
        <Text style={styles.metaCopy}>{familyVibe.join(' · ')}</Text>
      </View>
      <View style={styles.metaBlock}>
        <Text style={styles.metaTitle}>Availability</Text>
        <Text style={styles.metaCopy}>{availability.join(' · ')}</Text>
      </View>
      <View style={styles.actions}>
        <View style={styles.flex}><Button label="Not now" variant="secondary" onPress={onPressPass} /></View>
        <View style={styles.flex}>
          <Button
            disabled={interestedDisabled}
            label={interestedLabel}
            onPress={status === 'matched' ? onPressOpen : onPressInterested}
            variant={status === 'liked' ? 'secondary' : 'primary'}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  identityText: {
    gap: spacing.xs,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  area: {
    fontSize: 14,
    color: colors.textMuted,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  child: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaBlock: {
    gap: spacing.xs,
  },
  metaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  metaCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
});
