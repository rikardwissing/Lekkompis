import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ChatThread, type ChatToolSection } from '@/components/chat/ChatThread';
import { buildChatRenderableItems } from '@/components/chat/chat-presenters';
import { SubscreenHeader } from '@/components/navigation/SubscreenHeader';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
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
  const [toolsOpen, setToolsOpen] = useState(false);
  const { matchId = 'sara-match' } = useLocalSearchParams<{ matchId: string }>();
  const draftProfile = useAppStore((state) => state.draftProfile);
  const messagesByMatch = useAppStore((state) => state.messagesByMatch);
  const markConversationRead = useAppStore((state) => state.markConversationRead);
  const sendMessage = useAppStore((state) => state.sendMessage);
  const families = useAppStore((state) => state.families);
  const matchFamily = families.find((family) => `${family.id}-match` === matchId);
  const messages = useMemo(() => (matchFamily ? messagesByMatch[matchId] ?? [] : []), [matchFamily, matchId, messagesByMatch]);
  const canSend = draft.trim().length > 0 || selectedPhotoUrls.length > 0;

  useEffect(() => {
    if (!matchFamily) {
      return;
    }

    const lastActivityAt = messages[messages.length - 1]?.createdAt ?? Date.now();
    markConversationRead(matchId, lastActivityAt);
  }, [markConversationRead, matchFamily, matchId, messages]);

  const chatItems = useMemo(
    () =>
      buildChatRenderableItems({
        currentSenderName: draftProfile.parentName,
        messages,
        threadKind: 'direct',
      }),
    [draftProfile.parentName, messages]
  );

  const toolSections = useMemo<ChatToolSection[]>(
    () => [
      {
        id: 'quick-replies',
        title: 'Quick replies',
        items: suggestedReplies.map((reply) => ({
          id: reply,
          label: reply,
          onPress: () => setDraft(reply),
          selected: draft === reply,
        })),
      },
      {
        id: 'photos',
        title: 'Photos',
        items: photoReplyOptions.map((photoUrl, index) => ({
          id: photoUrl,
          label: `Photo ${index + 1}`,
          onPress: () =>
            setSelectedPhotoUrls((current) =>
              current.includes(photoUrl) ? current.filter((entry) => entry !== photoUrl) : [...current, photoUrl]
            ),
          selected: selectedPhotoUrls.includes(photoUrl),
        })),
      },
    ],
    [draft, selectedPhotoUrls]
  );

  if (!matchFamily) {
    return (
      <Screen header={<SubscreenHeader fallbackHref="/conversations" title="Conversation" />}>
        <EmptyState
          title="Chat not found"
          body="This conversation is not available in the demo right now, so we kept you from landing in the wrong thread."
          actionLabel="Back to conversations"
          onAction={() => router.replace('/conversations')}
        />
      </Screen>
    );
  }

  const submit = () => {
    const trimmed = draft.trim();

    if (!trimmed && selectedPhotoUrls.length === 0) {
      return;
    }

    sendMessage(matchId, draftProfile.parentName, trimmed, selectedPhotoUrls);
    setDraft('');
    setSelectedPhotoUrls([]);
    setToolsOpen(false);
  };

  return (
    <Screen
      contentStyle={styles.screenContent}
      header={<SubscreenHeader fallbackHref="/conversations" title={matchFamily.parentName} />}
    >
      <ChatThread
        attachmentSummaryLabel={
          selectedPhotoUrls.length > 0
            ? `${selectedPhotoUrls.length} photo${selectedPhotoUrls.length === 1 ? '' : 's'} selected`
            : undefined
        }
        canSend={canSend}
        context={
          <View style={styles.contextStrip}>
            <Avatar imageUrl={matchFamily.avatarUrl} name={matchFamily.parentName} size={42} />
            <View style={styles.contextCopy}>
              <Text style={styles.contextTitle}>{matchFamily.parentName}</Text>
              <Text numberOfLines={2} style={styles.contextBody}>
                {matchFamily.meetupNote}
              </Text>
            </View>
          </View>
        }
        draft={draft}
        items={chatItems}
        onChangeDraft={setDraft}
        onSend={submit}
        onToggleTools={() => setToolsOpen((current) => !current)}
        placeholder="Message"
        toolSections={toolSections}
        toolsOpen={toolsOpen}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
    gap: 0,
  },
  contextStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(227, 231, 227, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.86)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  contextCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  contextTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  contextBody: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
