import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { useAppStore } from '@/store/app-store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function MatchesScreen() {
  const matchedFamilyIds = useAppStore((state) => state.matchedFamilyIds);
  const likedFamilyIds = useAppStore((state) => state.likedFamilyIds);
  const families = useAppStore((state) => state.families);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);
  const respondToGroupPlayDateInvite = useAppStore((state) => state.respondToGroupPlayDateInvite);

  const matchedFamilies = families.filter((family) => matchedFamilyIds.includes(family.id));
  const pendingFamilies = families.filter((family) => likedFamilyIds.includes(family.id) && !matchedFamilyIds.includes(family.id));
  const invitedGroupPlayDates = groupPlayDates.filter((groupPlayDate) => groupPlayDate.status === 'invited');
  const hostingGroupPlayDates = groupPlayDates.filter((groupPlayDate) => groupPlayDate.status === 'hosting');
  const upcomingGroupPlayDates = groupPlayDates.filter((groupPlayDate) => groupPlayDate.status === 'going' || groupPlayDate.status === 'hosting');

  const familyById = Object.fromEntries(families.map((family) => [family.id, family]));

  return (
    <Screen scroll>
      <Text style={styles.title}>Connections</Text>
      <Text style={styles.subtitle}>1:1 chats still live here, and now group play dates do too.</Text>

      {invitedGroupPlayDates.length > 0 && (
        <Card>
          <Text style={styles.matchTitle}>Group invitations</Text>
          <Text style={styles.body}>Accept an invite to move it into your shared upcoming plans.</Text>
          <View style={styles.stack}>
            {invitedGroupPlayDates.map((groupPlayDate) => {
              const hostFamily = familyById[groupPlayDate.hostFamilyId];

              return (
                <View key={groupPlayDate.id} style={styles.groupCard}>
                  <View style={styles.identity}>
                    <Avatar name={hostFamily?.parentName ?? 'Host'} imageUrl={hostFamily?.avatarUrl} />
                    <View style={styles.identityText}>
                      <Text style={styles.groupTitle}>{groupPlayDate.title}</Text>
                      <Text style={styles.body}>
                        Hosted by {hostFamily?.parentName ?? 'a nearby parent'} · {groupPlayDate.locationName}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.groupMeta}>
                    {groupPlayDate.dateLabel} · {groupPlayDate.timeLabel} · {groupPlayDate.ageRange}
                  </Text>
                  <View style={styles.chips}>
                    <Chip label={groupPlayDate.area} />
                    {groupPlayDate.activityTags.map((tag) => (
                      <Chip key={tag} label={tag} />
                    ))}
                  </View>
                  <Text style={styles.body}>{groupPlayDate.note}</Text>
                  <View style={styles.actions}>
                    <View style={styles.flex}>
                      <Button
                        label="Not this one"
                        variant="secondary"
                        onPress={() => respondToGroupPlayDateInvite(groupPlayDate.id, 'not-going')}
                      />
                    </View>
                    <View style={styles.flex}>
                      <Button label="Join group date" onPress={() => respondToGroupPlayDateInvite(groupPlayDate.id, 'going')} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      )}

      {hostingGroupPlayDates.length > 0 && (
        <Card>
          <Text style={styles.matchTitle}>You are hosting</Text>
          <View style={styles.stack}>
            {hostingGroupPlayDates.map((groupPlayDate) => (
              <View key={groupPlayDate.id} style={styles.groupCard}>
                <Text style={styles.groupTitle}>{groupPlayDate.title}</Text>
                <Text style={styles.body}>
                  {groupPlayDate.locationName} · {groupPlayDate.dateLabel} · {groupPlayDate.timeLabel}
                </Text>
                <View style={styles.chips}>
                  <Chip label={`${groupPlayDate.attendeeFamilyIds.length}/{groupPlayDate.capacity} families`} />
                  {groupPlayDate.vibeTags.map((tag) => (
                    <Chip key={tag} label={tag} />
                  ))}
                </View>
                <Text style={styles.body}>{groupPlayDate.note}</Text>
                <Button label="Open group chat" onPress={() => router.push(`/group-chat/${groupPlayDate.id}`)} />
              </View>
            ))}
          </View>
        </Card>
      )}

      {upcomingGroupPlayDates.length > 0 && (
        <Card>
          <Text style={styles.matchTitle}>Upcoming group play dates</Text>
          <View style={styles.pendingList}>
            {upcomingGroupPlayDates.map((groupPlayDate) => (
              <View key={groupPlayDate.id} style={styles.upcomingRow}>
                <View style={styles.flex}>
                  <Text style={styles.pendingItem}>{groupPlayDate.title}</Text>
                  <Text style={styles.upcomingMeta}>
                    {groupPlayDate.dateLabel} · {groupPlayDate.locationName} · {groupPlayDate.attendeeFamilyIds.length} families going
                  </Text>
                </View>
                <View style={styles.upcomingActions}>
                  <Chip label={groupPlayDate.status === 'hosting' ? 'Hosting' : 'Going'} />
                  <Button label="Chat" variant="secondary" onPress={() => router.push(`/group-chat/${groupPlayDate.id}`)} />
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

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
            <Button label="Start chat" onPress={() => router.push(`/chat/${family.id}-match`)} />
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
        <Text style={styles.noteText}>
          For the prototype, Sara is still the scripted mutual connection, and group play dates now layer into the same Connections space.
        </Text>
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
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
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
  stack: {
    gap: spacing.lg,
  },
  groupCard: {
    gap: spacing.sm,
  },
  groupTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  groupMeta: {
    fontSize: 14,
    color: colors.textMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pendingItem: {
    fontSize: 15,
    color: colors.text,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  upcomingActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  upcomingMeta: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
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
