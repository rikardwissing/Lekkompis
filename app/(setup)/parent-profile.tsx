import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SelectableChip } from '@/components/ui/SelectableChip';
import { TextField } from '@/components/ui/TextField';
import { PhotoStrip } from '@/components/ui/PhotoStrip';
import { areaOptions, familyVibeOptions, languageOptions, parentInterestOptions } from '@/constants/demo-profiles';
import { useAppStore } from '@/store/app-store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function ParentProfileScreen() {
  const draftProfile = useAppStore((state) => state.draftProfile);
  const updateDraftProfile = useAppStore((state) => state.updateDraftProfile);
  const toggleFamilyVibe = useAppStore((state) => state.toggleFamilyVibe);
  const toggleParentInterest = useAppStore((state) => state.toggleParentInterest);
  const toggleLanguage = useAppStore((state) => state.toggleLanguage);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Parent profile</Text>
        <Text style={styles.subtitle}>Show the adult side too — mock photos, interests, and languages help this feel like family matching for parents as well.</Text>
      </View>
      <Card>
        <TextField label="First name" value={draftProfile.parentName} onChangeText={(value) => updateDraftProfile({ parentName: value })} />
        <View style={styles.section}>
          <Text style={styles.label}>Mock profile photos</Text>
          <PhotoStrip photos={draftProfile.photoUrls} size={112} />
          <Text style={styles.helper}>Temporary placeholder photos for the prototype to make each parent profile feel more personal.</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Area</Text>
          <View style={styles.row}>
            {areaOptions.map((area) => (
              <SelectableChip key={area} label={area} selected={draftProfile.area === area} onPress={() => updateDraftProfile({ area })} />
            ))}
          </View>
        </View>
        <TextField label="Short intro" value={draftProfile.bio} onChangeText={(value) => updateDraftProfile({ bio: value })} multiline />
        <View style={styles.section}>
          <Text style={styles.label}>Parent interests</Text>
          <View style={styles.row}>
            {parentInterestOptions.map((item) => (
              <SelectableChip key={item} label={item} selected={draftProfile.parentInterests.includes(item)} onPress={() => toggleParentInterest(item)} />
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Spoken languages</Text>
          <View style={styles.row}>
            {languageOptions.map((item) => (
              <SelectableChip key={item} label={item} selected={draftProfile.languages.includes(item)} onPress={() => toggleLanguage(item)} />
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Family vibe</Text>
          <View style={styles.row}>
            {familyVibeOptions.map((item) => (
              <SelectableChip key={item} label={item} selected={draftProfile.familyVibe.includes(item)} onPress={() => toggleFamilyVibe(item)} />
            ))}
          </View>
        </View>
      </Card>
      <Button label="Continue to child profile" onPress={() => router.push('/(setup)/child-profile')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  helper: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
