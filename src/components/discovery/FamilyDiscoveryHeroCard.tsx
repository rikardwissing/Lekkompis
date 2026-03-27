import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

type FamilyDiscoveryHeroCardProps = {
  avatarUrl?: string;
  distanceLabel?: string | null;
  familySummary?: string | null;
  fitChips: string[];
  intro: string;
  parentName: string;
  photoUrl?: string;
  preview?: boolean;
};

export function FamilyDiscoveryHeroCard({
  avatarUrl,
  distanceLabel,
  familySummary,
  fitChips,
  intro,
  parentName,
  photoUrl,
  preview = false,
}: FamilyDiscoveryHeroCardProps) {
  const badgeChips = fitChips.slice(0, 3);

  return (
    <View style={[styles.surface, preview ? styles.previewSurface : null]}>
      {photoUrl ? <Image resizeMode="cover" source={{ uri: photoUrl }} style={StyleSheet.absoluteFillObject} /> : null}
      <LinearGradient
        colors={[
          'rgba(18, 24, 20, 0.10)',
          'rgba(18, 24, 20, 0.18)',
          'rgba(18, 24, 20, 0.82)',
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.bottom}>
        <View style={styles.identityRow}>
          <Avatar imageUrl={avatarUrl} name={parentName} size={48} />
          <View style={styles.identityCopy}>
            <Text numberOfLines={1} style={styles.parentName}>
              {parentName}
            </Text>
            {distanceLabel ? (
              <Text numberOfLines={1} style={styles.metaText}>
                {distanceLabel}
              </Text>
            ) : null}
          </View>
        </View>
        {familySummary ? <Text numberOfLines={1} style={styles.familySummary}>{familySummary}</Text> : null}
        <Text numberOfLines={3} style={styles.intro}>{intro}</Text>
        <View style={styles.chips}>
          {badgeChips.map((chip) => (
            <Chip key={chip} label={chip} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },
  previewSurface: {
    borderRadius: radius.lg,
  },
  bottom: {
    marginTop: 'auto',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  identityCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  parentName: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.surface,
  },
  metaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
  },
  familySummary: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.88)',
  },
  intro: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.94)',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
