import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { PhotoStrip } from '@/components/ui/PhotoStrip';
import { DiscoveryBottomSheet } from '@/components/discovery/DiscoveryBottomSheet';
import type { DraftProfile, Family, ParentAccount } from '@/store/app-store';
import {
  getFamilyChildrenSummary,
  getFamilyDistanceLabel,
  getFamilyFitChips,
} from '@/store/derived';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type FamilyDetailSheetProps = {
  draftProfile: DraftProfile;
  family: Family | null;
  parent: ParentAccount | null;
  onClose: () => void;
  onOpenProfile: () => void;
  visible: boolean;
};

export function FamilyDetailSheet({
  draftProfile,
  family,
  parent,
  onClose,
  onOpenProfile,
  visible,
}: FamilyDetailSheetProps) {
  if (!family || !parent) {
    return null;
  }

  const fitChips = getFamilyFitChips(draftProfile, family, parent);
  const distanceLabel = getFamilyDistanceLabel(draftProfile, family);
  const familySummary = getFamilyChildrenSummary(family.children ?? [], family.expecting);
  const childInterests = [...new Set((family.children ?? []).flatMap((child) => child.interests))];

  return (
    <DiscoveryBottomSheet
      footer={<Button label="View full profile" onPress={onOpenProfile} />}
      onClose={onClose}
      title={`About ${parent.firstName}`}
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identityRow}>
          <Avatar imageUrl={parent.avatarUrl} name={parent.firstName} size={56} />
          <View style={styles.identityCopy}>
            <Text style={styles.name}>{parent.firstName}</Text>
            {distanceLabel ? <Text style={styles.meta}>{distanceLabel}</Text> : null}
          </View>
        </View>

        <Text style={styles.summary}>{parent.intro}</Text>
        <PhotoStrip photos={family.photoUrls} size={88} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family snapshot</Text>
          <Text style={styles.body}>{familySummary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this family</Text>
          <Text style={styles.body}>{family.familySummary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why it could click</Text>
          <View style={styles.row}>
            {fitChips.map((item) => (
              <Chip key={item} label={item} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parent interests</Text>
          <View style={styles.row}>
            {parent.interests.map((item) => (
              <Chip key={item} label={item} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spoken languages</Text>
          <View style={styles.row}>
            {parent.languages.map((item) => (
              <Chip key={item} label={item} />
            ))}
          </View>
        </View>

        {childInterests.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Child interests</Text>
            <View style={styles.row}>
              {childInterests.map((item) => (
                <Chip key={item} label={item} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family vibe</Text>
          <View style={styles.row}>
            {family.familyVibe.map((item) => (
              <Chip key={item} label={item} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.row}>
            {family.availability.map((item) => (
              <Chip key={item} label={item} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>First meetup tone</Text>
          <Text style={styles.body}>{family.meetupNote}</Text>
        </View>
      </ScrollView>
    </DiscoveryBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
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
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 14,
    color: colors.textMuted,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
});
