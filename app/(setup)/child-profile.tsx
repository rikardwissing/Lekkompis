import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SelectableChip } from '@/components/ui/SelectableChip';
import { TextField } from '@/components/ui/TextField';
import { childInterestOptions } from '@/constants/demo-profiles';
import { useAppStore } from '@/store/app-store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const ageOptions = ['3 years', '4 years', '5 years', '6 years'];

export default function ChildProfileScreen() {
  const draftProfile = useAppStore((state) => state.draftProfile);
  const updateDraftProfile = useAppStore((state) => state.updateDraftProfile);
  const toggleChildInterest = useAppStore((state) => state.toggleChildInterest);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Child profile</Text>
        <Text style={styles.subtitle}>Choose just enough detail to make discovery feel believable and safe.</Text>
      </View>
      <Card>
        <TextField label="Child name" value={draftProfile.childName} onChangeText={(value) => updateDraftProfile({ childName: value })} />
        <View style={styles.section}>
          <Text style={styles.label}>Age</Text>
          <View style={styles.row}>
            {ageOptions.map((age) => (
              <SelectableChip key={age} label={age} selected={draftProfile.childAgeLabel === age} onPress={() => updateDraftProfile({ childAgeLabel: age })} />
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Interests</Text>
          <View style={styles.row}>
            {childInterestOptions.map((interest) => (
              <SelectableChip
                key={interest}
                label={interest}
                selected={draftProfile.childInterests.includes(interest)}
                onPress={() => toggleChildInterest(interest)}
              />
            ))}
          </View>
        </View>
      </Card>
      <Button label="Go to discover" onPress={() => router.replace('/(tabs)/discover')} />
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
