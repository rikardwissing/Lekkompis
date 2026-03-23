import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SelectableChip } from '@/components/ui/SelectableChip';
import { TextField } from '@/components/ui/TextField';
import { BirthdayField } from '@/components/ui/BirthdayField';
import { childInterestOptions } from '@/constants/demo-profiles';
import { type ChildProfile, useAppStore } from '@/store/app-store';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { isValidDateOnly } from '@/utils/birthdays';

function ChildEditorCard({
  child,
  canRemove,
  onChange,
  onRemove,
  onToggleInterest,
}: {
  child: ChildProfile;
  canRemove: boolean;
  onChange: (patch: Partial<ChildProfile>) => void;
  onRemove: () => void;
  onToggleInterest: (value: string) => void;
}) {
  return (
    <View style={styles.childCard}>
      <View style={styles.childCardHeader}>
        <Text style={styles.childCardTitle}>{child.name.trim().length > 0 ? child.name : 'Child details'}</Text>
        {canRemove ? (
          <Pressable onPress={onRemove} style={({ pressed }) => [styles.removeButton, pressed ? styles.pressed : null]}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </Pressable>
        ) : null}
      </View>

      <TextField label="Child name" value={child.name} onChangeText={(value) => onChange({ name: value })} />
      <BirthdayField label="Birthday" value={child.birthDate} onChange={(birthDate) => onChange({ birthDate })} />

      <View style={styles.section}>
        <Text style={styles.label}>Interests</Text>
        <View style={styles.row}>
          {childInterestOptions.map((interest) => (
            <SelectableChip
              key={`${child.id}-${interest}`}
              label={interest}
              selected={child.interests.includes(interest)}
              onPress={() => onToggleInterest(interest)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default function ChildProfileScreen() {
  const draftProfile = useAppStore((state) => state.draftProfile);
  const addDraftChild = useAppStore((state) => state.addDraftChild);
  const removeDraftChild = useAppStore((state) => state.removeDraftChild);
  const updateDraftChild = useAppStore((state) => state.updateDraftChild);
  const toggleDraftChildInterest = useAppStore((state) => state.toggleDraftChildInterest);
  const children = draftProfile.children ?? [];

  const canContinue =
    children.length > 0 &&
    children.every(
      (child) => child.name.trim().length > 0 && child.birthDate.trim().length > 0 && isValidDateOnly(child.birthDate)
    );

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Child profiles</Text>
        <Text style={styles.subtitle}>Add each child with a real birthday so discovery can find families with the closest age fit automatically.</Text>
      </View>

      <Card>
        <View style={styles.stack}>
          {children.map((child) => (
            <ChildEditorCard
              key={child.id}
              canRemove={children.length > 1}
              child={child}
              onChange={(patch) => updateDraftChild(child.id, patch)}
              onRemove={() => removeDraftChild(child.id)}
              onToggleInterest={(value) => toggleDraftChildInterest(child.id, value)}
            />
          ))}
        </View>

        <Pressable onPress={addDraftChild} style={({ pressed }) => [styles.addChildButton, pressed ? styles.pressed : null]}>
          <Text style={styles.addChildButtonText}>Add another child</Text>
        </Pressable>
      </Card>

      {!canContinue ? (
        <Text style={styles.helper}>
          Add at least one child with a name and birthday before going to Discover. Interests can stay flexible.
        </Text>
      ) : null}

      <Button disabled={!canContinue} label="Go to discover" onPress={() => router.replace('/(tabs)/discover')} />
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
  stack: {
    gap: spacing.lg,
  },
  childCard: {
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.72)',
    padding: spacing.md,
  },
  childCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  childCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  removeButton: {
    paddingVertical: spacing.xs,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
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
  addChildButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  addChildButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  helper: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.85,
  },
});
