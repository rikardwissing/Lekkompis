import { useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MainAppHeader } from '@/components/navigation/MainAppHeader';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { PhotoStrip } from '@/components/ui/PhotoStrip';
import { SelectableChip } from '@/components/ui/SelectableChip';
import {
  getActiveParent,
  isPrimaryActiveParent,
  useAppStore,
} from '@/store/app-store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatAgeLabelFromBirthDate, formatDateOnly, formatDueMonthLabel } from '@/utils/birthdays';
import { getPrivateLocationLabel } from '@/utils/location';

export default function MeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const draftProfile = useAppStore((state) => state.draftProfile);
  const coParentInvite = useAppStore((state) => state.coParentInvite);
  const setActiveParent = useAppStore((state) => state.setActiveParent);
  const createCoParentInvite = useAppStore((state) => state.createCoParentInvite);
  const cancelCoParentInvite = useAppStore((state) => state.cancelCoParentInvite);
  const acceptPendingCoParentInvite = useAppStore((state) => state.acceptPendingCoParentInvite);
  const unlinkCoParent = useAppStore((state) => state.unlinkCoParent);
  const resetDemoState = useAppStore((state) => state.resetDemoState);
  const children = draftProfile.children ?? [];
  const activeParent = getActiveParent(draftProfile);
  const primarySession = isPrimaryActiveParent(draftProfile);
  const linkedParents = draftProfile.parents.filter((parent) => parent.status === 'active');
  const coParent = linkedParents.find((parent) => parent.role === 'coparent');
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [24, 92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Screen
      header={<MainAppHeader title="Profile" titleOpacity={headerTitleOpacity} />}
      scroll
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    >
      <Text style={styles.title}>My family</Text>

      <Card>
        <View style={styles.identity}>
          <Avatar name={activeParent?.firstName ?? 'Parent'} imageUrl={activeParent?.avatarUrl} size={72} />
          <View style={styles.identityText}>
            <Text style={styles.name}>{activeParent?.firstName ?? 'Parent'}</Text>
            <Text style={styles.meta}>{getPrivateLocationLabel(draftProfile.homeLocation)}</Text>
            <Text style={styles.meta}>Home address stays private</Text>
            <Text style={styles.meta}>
              {activeParent?.role === 'primary' ? 'Primary parent session' : 'Linked co-parent session'}
            </Text>
          </View>
        </View>
        <Text style={styles.metaLabel}>About {activeParent?.firstName ?? 'this parent'}</Text>
        <Text style={styles.body}>{activeParent?.intro ?? 'No parent intro yet.'}</Text>
        <Text style={styles.metaLabel}>About this family</Text>
        <Text style={styles.body}>{draftProfile.familySummary}</Text>
        <PhotoStrip photos={draftProfile.photoUrls} size={104} />
        <Button label="Edit family and parent profile" onPress={() => router.push('/(setup)/parent-profile')} variant="secondary" />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Parent access</Text>
        <Text style={styles.body}>
          Shared groups, invites, hosting, and group chat stay available to both parents. Each linked parent can also build their own likes, matches, and direct chats while still seeing the other parent’s connections.
        </Text>
        <Text style={styles.metaLabel}>Switch active parent</Text>
        <View style={styles.row}>
          {linkedParents.map((parent) => (
            <SelectableChip
              key={parent.id}
              label={`${parent.firstName}${parent.role === 'primary' ? ' · Primary' : ''}`}
              selected={draftProfile.activeParentId === parent.id}
              onPress={() => setActiveParent(parent.id)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Active parent profile</Text>
        {activeParent?.birthDate ? <Text style={styles.metaLabel}>Birthday</Text> : null}
        {activeParent?.birthDate ? <Text style={styles.meta}>{formatDateOnly(activeParent.birthDate)}</Text> : null}
        <Text style={styles.metaLabel}>Interests</Text>
        <View style={styles.row}>
          {(activeParent?.interests ?? []).map((interest) => (
            <Chip key={interest} label={interest} />
          ))}
        </View>
        <Text style={styles.metaLabel}>Spoken languages</Text>
        <View style={styles.row}>
          {(activeParent?.languages ?? []).map((language) => (
            <Chip key={language} label={language} />
          ))}
        </View>
        <Text style={styles.metaLabel}>Visible in discover</Text>
        <Text style={styles.meta}>{activeParent?.isDiscoverable ? 'Yes' : 'Hidden'}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Co-parent connection</Text>
        <Text style={styles.body}>
          Link a co-parent account to share group planning and let each parent build their own direct connections inside the same family account.
        </Text>

        <View style={styles.parentStack}>
          {linkedParents.map((parent) => (
            <View key={parent.id} style={styles.parentRow}>
              <View style={styles.parentIdentity}>
                <Avatar name={parent.firstName} imageUrl={parent.avatarUrl} size={44} />
                <View style={styles.parentCopy}>
                  <Text style={styles.parentName}>{parent.firstName}</Text>
                  <Text style={styles.meta}>{parent.role === 'primary' ? 'Primary parent' : 'Linked co-parent'}</Text>
                </View>
              </View>
              {primarySession && parent.role === 'coparent' ? (
                <Button label="Unlink" onPress={() => unlinkCoParent(parent.id)} variant="secondary" />
              ) : null}
            </View>
          ))}
        </View>

        {!coParent && !coParentInvite && primarySession ? (
          <Button label="Generate invite code" onPress={createCoParentInvite} />
        ) : null}

        {coParentInvite ? (
          <View style={styles.inviteCard}>
            <Text style={styles.metaLabel}>Invite code</Text>
            <Text style={styles.inviteCode}>{coParentInvite.code}</Text>
            <Text style={styles.meta}>{coParentInvite.shareUrl}</Text>
            <Text style={styles.body}>
              This prototype uses a simulated invite flow. Accepting will add a demo co-parent account and switch the
              session over to it.
            </Text>
            <View style={styles.actions}>
              <View style={styles.flex}>
                <Button label="Cancel invite" onPress={cancelCoParentInvite} variant="secondary" />
              </View>
              <View style={styles.flex}>
                <Button label="Accept as Lukas" onPress={acceptPendingCoParentInvite} />
              </View>
            </View>
          </View>
        ) : null}
      </Card>

      {children.map((child) => (
        <Card key={child.id}>
          <Text style={styles.sectionTitle}>{child.name}</Text>
          <Text style={styles.meta}>{formatAgeLabelFromBirthDate(child.birthDate)}</Text>
          <Text style={styles.metaLabel}>Birthday</Text>
          <Text style={styles.meta}>{formatDateOnly(child.birthDate)}</Text>
          <View style={styles.row}>
            {child.interests.map((interest) => (
              <Chip key={`${child.id}-${interest}`} label={interest} />
            ))}
          </View>
        </Card>
      ))}

      {draftProfile.expecting ? (
        <Card>
          <Text style={styles.sectionTitle}>Expecting</Text>
          <Text style={styles.meta}>{formatDueMonthLabel(draftProfile.expecting.dueMonth)}</Text>
          <Text style={styles.body}>
            This family is currently open to expecting-friendly matches and events as well as the usual child-based flows.
          </Text>
        </Card>
      ) : null}

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
    flex: 1,
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
  parentStack: {
    gap: spacing.md,
  },
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  parentIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  parentCopy: {
    gap: spacing.xs,
    flex: 1,
  },
  parentName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  inviteCard: {
    gap: spacing.sm,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  inviteCode: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
});
