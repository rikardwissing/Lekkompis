import { useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { SelectableChip } from '@/components/ui/SelectableChip';
import { Button } from '@/components/ui/Button';
import { MessageBubble } from '@/components/chat/MessageBubble';
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
  const { groupId = 'animal-zoo-sunday' } = useLocalSearchParams<{ groupId: string }>();
  const draftProfile = useAppStore((state) => state.draftProfile);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);
  const groupMessagesByPlayDate = useAppStore((state) => state.groupMessagesByPlayDate);
  const sendGroupMessage = useAppStore((state) => state.sendGroupMessage);

  const groupPlayDate = groupPlayDates.find((entry) => entry.id === groupId) ?? groupPlayDates[0];
  const messages = useMemo(() => groupMessagesByPlayDate[groupPlayDate.id] ?? [], [groupMessagesByPlayDate, groupPlayDate.id]);

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed && selectedPhotoUrls.length === 0) return;
    sendGroupMessage(groupPlayDate.id, draftProfile.parentName, trimmed, selectedPhotoUrls);
    setDraft('');
    setSelectedPhotoUrls([]);
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>{groupPlayDate.title}</Text>
        <Text style={styles.subtitle}>
          {groupPlayDate.locationName} · {groupPlayDate.dateLabel} · {groupPlayDate.timeLabel}
        </Text>
      </View>
      <Card>
        <View style={styles.chips}>
          {suggestedGroupReplies.map((reply) => (
            <SelectableChip key={reply} label={reply} selected={false} onPress={() => setDraft(reply)} />
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
        <Text style={styles.helperText}>Great for sharing the meetup spot, snacks, or a stroller-friendly entrance.</Text>
      </Card>
      <View style={styles.messages}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            sender={message.sender}
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
        <Button label="Send to group" onPress={submit} />
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
