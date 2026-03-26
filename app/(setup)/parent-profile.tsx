import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LocationField } from '@/components/ui/LocationField';
import { SelectableChip } from '@/components/ui/SelectableChip';
import { TextField } from '@/components/ui/TextField';
import { PhotoStrip } from '@/components/ui/PhotoStrip';
import { BirthdayField } from '@/components/ui/BirthdayField';
import { MonthField } from '@/components/ui/MonthField';
import { stockholmLocationPresets } from '@/constants/locations';
import { familyVibeOptions, languageOptions, parentInterestOptions } from '@/constants/demo-profiles';
import { getActiveParent, useAppStore } from '@/store/app-store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getPrivateLocationLabel } from '@/utils/location';

export default function ParentProfileScreen() {
  const draftProfile = useAppStore((state) => state.draftProfile);
  const updateDraftProfile = useAppStore((state) => state.updateDraftProfile);
  const updateDraftParent = useAppStore((state) => state.updateDraftParent);
  const toggleFamilyVibe = useAppStore((state) => state.toggleFamilyVibe);
  const toggleParentInterest = useAppStore((state) => state.toggleParentInterest);
  const toggleLanguage = useAppStore((state) => state.toggleLanguage);
  const activeParent = getActiveParent(draftProfile);
  const canContinue = Boolean(draftProfile.homeLocation);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Family and parent profile</Text>
        <Text style={styles.subtitle}>Keep family context shared, but let each parent show their own voice too. This is what nearby parents will discover first.</Text>
      </View>
      <Card>
        <TextField
          label="First name"
          value={activeParent?.firstName ?? ''}
          onChangeText={(value) => {
            if (!activeParent) {
              return;
            }

            updateDraftParent(activeParent.id, { firstName: value });
          }}
        />
        <View style={styles.section}>
          <Text style={styles.label}>Mock profile photos</Text>
          <PhotoStrip photos={draftProfile.photoUrls} size={112} />
          <Text style={styles.helper}>Temporary placeholder photos for the prototype to make each parent profile feel more personal.</Text>
        </View>
        <View style={styles.section}>
          <TextField
            label="Family intro"
            value={draftProfile.familySummary}
            onChangeText={(value) => updateDraftProfile({ familySummary: value })}
            multiline
          />
        </View>
        <View style={styles.section}>
          <TextField
            label="About you"
            value={activeParent?.intro ?? ''}
            onChangeText={(value) => {
              if (!activeParent) {
                return;
              }

              updateDraftParent(activeParent.id, { intro: value });
            }}
            multiline
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Discoverability</Text>
          <View style={styles.row}>
            <SelectableChip
              label="Shown in discover"
              selected={Boolean(activeParent?.isDiscoverable)}
              onPress={() => {
                if (!activeParent) {
                  return;
                }

                updateDraftParent(activeParent.id, { isDiscoverable: !activeParent.isDiscoverable });
              }}
            />
          </View>
        </View>
        <View style={styles.section}>
          <LocationField
            helperText={
              draftProfile.homeLocation
                ? 'Private home address. It is only used to calculate distance and never shown to other parents.'
                : 'Choose your home address. It stays private and is only used to calculate distance.'
            }
            label="Home address (private)"
            onChange={(homeLocation) => updateDraftProfile({ homeLocation })}
            placeholder="Search by street or address"
            suggestionMetaFormatter={() => 'Private address · never shown publicly'}
            suggestionTitleFormatter={getPrivateLocationLabel}
            suggestions={stockholmLocationPresets}
            valueFormatter={getPrivateLocationLabel}
            value={draftProfile.homeLocation}
          />
        </View>
        <BirthdayField
          label="Your birthday (optional)"
          placeholder="Only shown in connections if you add it"
          value={activeParent?.birthDate ?? ''}
          onChange={(birthDate) => {
            if (!activeParent) {
              return;
            }

            updateDraftParent(activeParent.id, { birthDate });
          }}
        />
        <View style={styles.section}>
          <Text style={styles.label}>Parent interests</Text>
          <View style={styles.row}>
            {parentInterestOptions.map((item) => (
              <SelectableChip
                key={item}
                label={item}
                selected={activeParent?.interests.includes(item) ?? false}
                onPress={() => toggleParentInterest(item)}
              />
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Spoken languages</Text>
          <View style={styles.row}>
            {languageOptions.map((item) => (
              <SelectableChip
                key={item}
                label={item}
                selected={activeParent?.languages.includes(item) ?? false}
                onPress={() => toggleLanguage(item)}
              />
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
        <View style={styles.section}>
          <Text style={styles.label}>Expecting</Text>
          <View style={styles.row}>
            <SelectableChip
              label="Expecting a child"
              selected={Boolean(draftProfile.expecting)}
              onPress={() =>
                updateDraftProfile({
                  expecting: draftProfile.expecting ? null : { dueMonth: '' },
                })
              }
            />
          </View>
          <Text style={styles.helper}>Optional for the prototype, but it unlocks matching and events for expecting parents too.</Text>
          {draftProfile.expecting ? (
            <MonthField
              label="Due month"
              placeholder="Only month and year are shown"
              value={draftProfile.expecting.dueMonth}
              onChange={(dueMonth) => updateDraftProfile({ expecting: { dueMonth } })}
            />
          ) : null}
        </View>
      </Card>
      <Button disabled={!canContinue} label="Continue to child profile" onPress={() => router.push('/(setup)/child-profile')} />
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
