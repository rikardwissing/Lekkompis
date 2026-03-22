import { useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { SelectableChip } from '@/components/ui/SelectableChip';
import { Button } from '@/components/ui/Button';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { suggestedReplies } from '@/constants/demo-profiles';
import { useAppStore } from '@/store/app-store';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

export function generateStaticParams() {
  return [{ matchId: 'sara-match' }];
}

const photoReplyOptions = [
  'https://picsum.photos/seed/direct-chat-photo-1/720/480',
  'https://picsum.photos/seed/direct-chat-photo-2/720/480',
];

export default function ChatScreen() {
  const [draft, setDraft] = useState('');
  const [selectedPhotoUrls, setSelectedPhotoUrls] = useState<string[]>([]);
  const { matchId = 'sara-match' } = useLocalSearchParams<{ matchId: string }>();
  const draftProfile = useAppStore((state) => state.draftProfile);
  const messagesByMatch = useAppStore((state) => state.messagesByMatch);
  const sendMessage = useAppStore((state) => state.sendMessage);
  const families = useAppStore((state) => state.families);
  const messages = useMemo(() => messagesByMatch[matchId] ?? [], [messagesByMatch]);
  const matchFamily = families.find((family) => `${family.id}-match` === matchId);

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed && selectedPhotoUrls.length === 0) return;
    sendMessage(matchId, draftProfile.parentName, trimmed, selectedPhotoUrls);
    setDraft('');
    setSelectedPhotoUrls([]);
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Chat with {matchFamily?.parentName ?? 'your match'}</Text>
        <Text style={styles.subtitle}>{matchFamily?.meetupNote ?? 'Public-place-first · weekend playground meetup'}</Text>
      </View>
      <Card>
        <View style={styles.chips}>
          {suggestedReplies.map((reply) => (
            <SelectableChip key={reply} label={reply} selected={false} onPress={() => setDraft(reply)} />
          ))}
        </View>
      </Card>
      <Card>
        <Text style={styles.composerTitle}>Add a picture</Text>
        <View style={styles.chips}>
          {photoReplyOptions.map((photoUrl, index) => (
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
        {selectedPhotoUrls.length > 0 ? <Text style={styles.helperText}>{selectedPhotoUrls.length} photo attachment ready to send.</Text> : null}
      </Card>
      <View style={styles.messages}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            sender={message.sender}
            senderAvatarUrl={message.sender === draftProfile.parentName ? draftProfile.avatarUrl : matchFamily?.avatarUrl}
            body={message.body}
            photoUrls={message.photoUrls}
            mine={message.sender === draftProfile.parentName}
          />
        ))}
      </View>
      <Card>
        <Text style={styles.composerTitle}>Send a message</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Hej! Would Saturday morning work for you?"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />
        <Button label="Send" onPress={submit} />
      </Card>
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
    fontSize: 14,
    color: colors.textMuted,
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
