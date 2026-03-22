import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import { SubscreenHeader } from '@/components/navigation/SubscreenHeader';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { SelectableChip } from '@/components/ui/SelectableChip';
import { Button } from '@/components/ui/Button';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore } from '@/store/app-store';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

const suggestedGroupReplies = [
  'We are in and should be on time.',
  'Happy to keep this one simple and outdoors.',
  'We can bring fruit and bubbles.',
];

const groupPhotoOptions = [
  'https://picsum.photos/seed/group-chat-photo-1/720/480',
  'https://picsum.photos/seed/group-chat-photo-2/720/480',
];

export function generateStaticParams() {
  return [{ groupId: 'animal-zoo-sunday' }, { groupId: 'vasaparken-saturday' }];
}

export default function GroupChatScreen() {
  const [draft, setDraft] = useState('');
  const [selectedPhotoUrls, setSelectedPhotoUrls] = useState<string[]>([]);
  const scrollY = useState(() => new Animated.Value(0))[0];
  const { groupId = 'animal-zoo-sunday' } = useLocalSearchParams<{ groupId: string }>();
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const families = useAppStore((state) => state.families);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);
  const groupMessagesByPlayDate = useAppStore((state) => state.groupMessagesByPlayDate);
  const markConversationRead = useAppStore((state) => state.markConversationRead);
  const sendGroupMessage = useAppStore((state) => state.sendGroupMessage);

  const groupPlayDate = groupPlayDates.find((entry) => entry.id === groupId);
  const messages = useMemo(() => (groupPlayDate ? groupMessagesByPlayDate[groupPlayDate.id] ?? [] : []), [groupMessagesByPlayDate, groupPlayDate]);
  const avatarBySender = useMemo(
    () =>
      Object.fromEntries([
        [draftProfile.parentName, draftProfile.avatarUrl],
        ...families.map((family) => [family.parentName, family.avatarUrl]),
      ]),
    [draftProfile.avatarUrl, draftProfile.parentName, families]
  );
  const canSend = draft.trim().length > 0 || selectedPhotoUrls.length > 0;

  useEffect(() => {
    if (!groupPlayDate) {
      return;
    }

    const lastActivityAt = messages[messages.length - 1]?.createdAt ?? groupPlayDate.createdAt;
    markConversationRead(groupPlayDate.id, lastActivityAt);
  }, [groupPlayDate, markConversationRead, messages]);
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [24, 92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (!groupPlayDate) {
    return (
      <Screen header={<SubscreenHeader fallbackHref="/conversations" title="Group chat" />}>
        <EmptyState
          title="Group chat not found"
          body="This group thread is no longer part of the current demo state, so we stopped before showing the wrong meetup."
          actionLabel="Back to conversations"
          onAction={() => router.replace('/conversations')}
        />
      </Screen>
    );
  }

  const isPendingInvite =
    groupPlayDate.status === 'invited' && groupPlayDate.invitedFamilyIds.includes(currentFamilyId);

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed && selectedPhotoUrls.length === 0) return;
    sendGroupMessage(groupPlayDate.id, draftProfile.parentName, trimmed, selectedPhotoUrls);
    setDraft('');
    setSelectedPhotoUrls([]);
  };

  return (
    <Screen
      header={<SubscreenHeader fallbackHref="/conversations" title={groupPlayDate.title} titleOpacity={headerTitleOpacity} />}
      scroll
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{groupPlayDate.title}</Text>
        <Text style={styles.subtitle}>
          {groupPlayDate.locationName} · {groupPlayDate.dateLabel} · {groupPlayDate.timeLabel}
        </Text>
      </View>
      {isPendingInvite ? (
        <Card>
          <Text style={styles.pendingTitle}>Invitation pending</Text>
          <Text style={styles.helperText}>
            You can read the thread, see who is confirmed, and message the group before you reply. Messages sent now
            still show you as invited.
          </Text>
          <Button
            label="View group details"
            variant="secondary"
            onPress={() => router.push({ pathname: '/group/[id]', params: { id: groupPlayDate.id } })}
          />
        </Card>
      ) : null}
      <Card>
        <View style={styles.chips}>
          {suggestedGroupReplies.map((reply) => (
            <SelectableChip key={reply} label={reply} selected={draft === reply} onPress={() => setDraft(reply)} />
          ))}
        </View>
      </Card>
      <Card>
        <Text style={styles.composerTitle}>Attach a picture for the group</Text>
        <View style={styles.chips}>
          {groupPhotoOptions.map((photoUrl, index) => (
            <SelectableChip
              key={photoUrl}
              label={`Photo ${index + 1}`}
              selected={selectedPhotoUrls.includes(photoUrl)}
              onPress={() =>
                setSelectedPhotoUrls((current) =>
                  current.includes(photoUrl) ? current.filter((entry) => entry !== photoUrl) : [...current, photoUrl]
                )
              }
            />
          ))}
        </View>
        <Text style={styles.helperText}>
          {selectedPhotoUrls.length > 0
            ? `${selectedPhotoUrls.length} photo attachment${selectedPhotoUrls.length === 1 ? '' : 's'} ready for the group.`
            : 'Great for sharing the meetup spot, snacks, or a stroller-friendly entrance.'}
        </Text>
      </Card>
      <View style={styles.messages}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            sender={message.sender}
            senderAvatarUrl={avatarBySender[message.sender]}
            body={message.body}
            photoUrls={message.photoUrls}
            mine={message.sender === draftProfile.parentName}
          />
        ))}
      </View>
      <Card>
        <Text style={styles.composerTitle}>Send to the group</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="We can bring fruit and meet by the entrance."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />
        <Button disabled={!canSend} label="Send to group" onPress={submit} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  messages: {
    gap: spacing.md,
  },
  composerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  pendingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  helperText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  input: {
    minHeight: 100,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    textAlignVertical: 'top',
    fontSize: 15,
    color: colors.text,
  },
});
