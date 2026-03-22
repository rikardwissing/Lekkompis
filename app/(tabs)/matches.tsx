import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAppStore } from '@/store/app-store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function MatchesScreen() {
  const matchedFamilyIds = useAppStore((state) => state.matchedFamilyIds);
  const likedFamilyIds = useAppStore((state) => state.likedFamilyIds);
  const families = useAppStore((state) => state.families);

  const matchedFamilies = families.filter((family) => matchedFamilyIds.includes(family.id));
  const pendingFamilies = families.filter((family) => likedFamilyIds.includes(family.id) && !matchedFamilyIds.includes(family.id));

  return (
    <Screen scroll>
      <Text style={styles.title}>Connections</Text>
      {matchedFamilies.length > 0 ? (
        matchedFamilies.map((family) => (
          <Card key={family.id}>
            <View style={styles.identity}>
              <Avatar name={family.parentName} imageUrl={family.avatarUrl} />
              <View style={styles.identityText}>
                <Text style={styles.matchTitle}>You both want to connect</Text>
                <Text style={styles.body}>
                  {family.parentName} in {family.area} also wants to meet. {family.meetupNote}
                </Text>
              </View>
            </View>
            <Button label="Start chat" onPress={() => router.push('/chat/sara-match')} />
          </Card>
        ))
      ) : (
        <Card>
          <Text style={styles.matchTitle}>No active matches yet</Text>
          <Text style={styles.body}>Like a few nearby families and your mutual connections will show up here.</Text>
        </Card>
      )}

      {pendingFamilies.length > 0 && (
        <Card>
          <Text style={styles.matchTitle}>Pending interest</Text>
          <View style={styles.pendingList}>
            {pendingFamilies.map((family) => (
              <View key={family.id} style={styles.pendingRow}>
                <Avatar name={family.parentName} imageUrl={family.avatarUrl} size={40} />
                <Text style={styles.pendingItem}>{family.parentName} in {family.area}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      <View style={styles.note}>
        <Text style={styles.noteText}>For the prototype, Sara is a scripted mutual connection so the full happy path can be demoed on web.</Text>
      </View>
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
    gap: spacing.md,
  },
  identityText: {
    flex: 1,
    gap: spacing.xs,
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  pendingList: {
    gap: spacing.sm,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pendingItem: {
    fontSize: 15,
    color: colors.text,
  },
  note: {
    paddingHorizontal: spacing.sm,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
