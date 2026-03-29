import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChatThread, type ChatToolSection } from '@/components/chat/ChatThread';
import { buildChatRenderableItems } from '@/components/chat/chat-presenters';
import { SubscreenHeader } from '@/components/navigation/SubscreenHeader';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { suggestedReplies } from '@/constants/demo-profiles';
import {
  buildDirectMatchId,
  getActiveMatchedParentIds,
  getActiveParent,
  getFamilyByParentId,
  getLinkedParentMatchedParentIds,
  parseDirectMatchId,
  useAppStore,
} from '@/store/app-store';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

export function generateStaticParams() {
  return [
    { matchId: buildDirectMatchId('anna-primary', 'sara-primary') },
    { matchId: buildDirectMatchId('anna-primary', 'mira-primary') },
  ];
}

const photoReplyOptions = [
  'https://picsum.photos/seed/direct-chat-photo-1/720/480',
  'https://picsum.photos/seed/direct-chat-photo-2/720/480',
];

export default function ChatScreen() {
  const [draft, setDraft] = useState('');
  const [selectedPhotoUrls, setSelectedPhotoUrls] = useState<string[]>([]);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { matchId = buildDirectMatchId('anna-primary', 'sara-primary') } = useLocalSearchParams<{ matchId: string }>();
  const draftProfile = useAppStore((state) => state.draftProfile);
  const messagesByMatch = useAppStore((state) => state.messagesByMatch);
  const markDirectConversationRead = useAppStore((state) => state.markDirectConversationRead);
  const matchedParentIdsByParent = useAppStore((state) => state.matchedParentIdsByParent);
  const sendMessage = useAppStore((state) => state.sendMessage);
  const families = useAppStore((state) => state.families);
  const activeParent = getActiveParent(draftProfile);
  const matchDescriptor = parseDirectMatchId(matchId);
  const matchFamily = matchDescriptor ? getFamilyByParentId(families, matchDescriptor.remoteParentId) : null;
  const matchParent = matchFamily?.parents.find((parent) => parent.id === matchDescriptor?.remoteParentId) ?? null;
  const messages = useMemo(() => (matchParent ? messagesByMatch[matchId] ?? [] : []), [matchId, matchParent, messagesByMatch]);
  const matchedParentIds = getActiveMatchedParentIds(draftProfile, matchedParentIdsByParent);
  const linkedParentMatchedParentIds = getLinkedParentMatchedParentIds(draftProfile, matchedParentIdsByParent);
  const canAccessDirectChat =
    Boolean(
      activeParent &&
      matchDescriptor &&
      activeParent.id === matchDescriptor.localParentId &&
      matchedParentIds.includes(matchDescriptor.remoteParentId)
    );
  const linkedParentHasConnection = Boolean(matchDescriptor && linkedParentMatchedParentIds.includes(matchDescriptor.remoteParentId));
  const canSend = draft.trim().length > 0 || selectedPhotoUrls.length > 0;

  useEffect(() => {
    if (!matchFamily || !canAccessDirectChat) {
      return;
    }

    const lastActivityAt = messages[messages.length - 1]?.createdAt ?? Date.now();
    markDirectConversationRead(matchId, lastActivityAt);
  }, [canAccessDirectChat, markDirectConversationRead, matchFamily, matchId, messages]);

  const chatItems = useMemo(
    () =>
      buildChatRenderableItems({
        currentSenderParentId: activeParent?.id ?? draftProfile.primaryParentId,
        messages,
        senderDirectory: {
          ...Object.fromEntries(
            draftProfile.parents.map((parent) => [
              parent.id,
              {
                avatarUrl: parent.avatarUrl,
                name: parent.firstName,
              },
            ])
          ),
          ...Object.fromEntries(
            (matchFamily?.parents ?? []).map((parent) => [
              parent.id,
              {
                avatarUrl: parent.avatarUrl,
                name: parent.firstName,
              },
            ])
          ),
        },
        threadKind: 'direct',
      }),
    [activeParent?.id, draftProfile.parents, draftProfile.primaryParentId, matchFamily?.parents, messages]
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

  if (!matchFamily || !matchParent) {
    return (
      <Screen header={<SubscreenHeader fallbackHref="/(tabs)/inbox" title="Conversation" />}>
        <EmptyState
          title="Chat not found"
          body="This conversation is not available in the demo right now, so we kept you from landing in the wrong thread."
          actionLabel="Back to inbox"
          onAction={() => router.replace('/(tabs)/inbox')}
        />
      </Screen>
    );
  }

  if (!canAccessDirectChat) {
    return (
      <Screen header={<SubscreenHeader fallbackHref="/(tabs)/discover" title="Conversation" />}>
        <EmptyState
          title={linkedParentHasConnection ? 'You need your own match first' : 'Direct chat not available yet'}
          body={
            linkedParentHasConnection
              ? `${matchParent.firstName} is connected with your linked co-parent, but this chat only opens once you have your own mutual match too.`
              : 'Once you have a direct match with this parent, the conversation will open here.'
          }
          actionLabel="Open profile"
          onAction={() => router.replace({ pathname: '/parent/[id]', params: { id: matchParent.id } })}
        />
      </Screen>
    );
  }

  const submit = () => {
    const trimmed = draft.trim();

    if (!trimmed && selectedPhotoUrls.length === 0) {
      return;
    }

    sendMessage(matchId, trimmed, selectedPhotoUrls);
    setDraft('');
    setSelectedPhotoUrls([]);
    setToolsOpen(false);
  };

  return (
    <Screen contentStyle={styles.screenContent} header={<SubscreenHeader fallbackHref="/(tabs)/inbox" title={matchParent.firstName} />}>
      <ChatThread
        attachmentSummaryLabel={
          selectedPhotoUrls.length > 0
            ? `${selectedPhotoUrls.length} photo${selectedPhotoUrls.length === 1 ? '' : 's'} selected`
            : undefined
        }
        canSend={canSend}
        context={
          <View style={styles.contextStrip}>
            <View style={styles.contextIdentity}>
              <Avatar imageUrl={matchParent.avatarUrl} name={matchParent.firstName} size={42} />
              <View style={styles.contextCopy}>
                <Text numberOfLines={1} style={styles.contextTitle}>
                  {matchParent.firstName}
                </Text>
                <Text numberOfLines={2} style={styles.contextBody}>
                  {matchFamily.familySummary}
                </Text>
              </View>
            </View>
            <View style={styles.contextActions}>
              <Pressable
                accessibilityLabel="Open matched parent profile"
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/parent/[id]', params: { id: matchParent.id } })}
                style={({ pressed }) => [styles.contextAction, pressed ? styles.pressed : null]}
              >
                <Text style={styles.contextActionText}>Profile</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Create a private plan"
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/plan/create', params: { matchId } })}
                style={({ pressed }) => [styles.contextAction, pressed ? styles.pressed : null]}
              >
                <Text style={styles.contextActionText}>Plan</Text>
              </Pressable>
            </View>
          </View>
        }
        draft={draft}
        items={chatItems}
        onChangeDraft={setDraft}
        onSend={submit}
        onToggleTools={() => setToolsOpen((current) => !current)}
        placeholder="Message the parent"
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
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(227, 231, 227, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.86)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  contextIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  contextActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contextAction: {
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  contextActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  pressed: {
    opacity: 0.84,
  },
});
