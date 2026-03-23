import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChatThread, type ChatToolSection } from '@/components/chat/ChatThread';
import { buildChatRenderableItems } from '@/components/chat/chat-presenters';
import { SubscreenHeader } from '@/components/navigation/SubscreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
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
  const [toolsOpen, setToolsOpen] = useState(false);
  const { groupId = 'animal-zoo-sunday' } = useLocalSearchParams<{ groupId: string }>();
  const currentFamilyId = useAppStore((state) => state.currentFamilyId);
  const draftProfile = useAppStore((state) => state.draftProfile);
  const families = useAppStore((state) => state.families);
  const groupPlayDates = useAppStore((state) => state.groupPlayDates);
  const groupMessagesByPlayDate = useAppStore((state) => state.groupMessagesByPlayDate);
  const markConversationRead = useAppStore((state) => state.markConversationRead);
  const sendGroupMessage = useAppStore((state) => state.sendGroupMessage);

  const groupPlayDate = groupPlayDates.find((entry) => entry.id === groupId);
  const messages = useMemo(
    () => (groupPlayDate ? groupMessagesByPlayDate[groupPlayDate.id] ?? [] : []),
    [groupMessagesByPlayDate, groupPlayDate]
  );
  const familyById = useMemo(
    () =>
      Object.fromEntries([
        [
          currentFamilyId,
          {
            avatarUrl: draftProfile.avatarUrl,
            parentName: draftProfile.parentName,
          },
        ],
        ...families.map((family) => [
          family.id,
          {
            avatarUrl: family.avatarUrl,
            parentName: family.parentName,
          },
        ]),
      ]),
    [currentFamilyId, draftProfile.avatarUrl, draftProfile.parentName, families]
  );
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

  const chatItems = useMemo(
    () =>
      buildChatRenderableItems({
        avatarBySender,
        currentSenderName: draftProfile.parentName,
        messages,
        threadKind: 'group',
      }),
    [avatarBySender, draftProfile.parentName, messages]
  );

  const toolSections = useMemo<ChatToolSection[]>(
    () => [
      {
        id: 'quick-replies',
        title: 'Quick replies',
        items: suggestedGroupReplies.map((reply) => ({
          id: reply,
          label: reply,
          onPress: () => setDraft(reply),
          selected: draft === reply,
        })),
      },
      {
        id: 'photos',
        title: 'Photos',
        items: groupPhotoOptions.map((photoUrl, index) => ({
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
  const host = familyById[groupPlayDate.hostFamilyId];

  const submit = () => {
    const trimmed = draft.trim();

    if (!trimmed && selectedPhotoUrls.length === 0) {
      return;
    }

    sendGroupMessage(groupPlayDate.id, draftProfile.parentName, trimmed, selectedPhotoUrls);
    setDraft('');
    setSelectedPhotoUrls([]);
    setToolsOpen(false);
  };

  return (
    <Screen
      contentStyle={styles.screenContent}
      header={<SubscreenHeader fallbackHref="/conversations" title={groupPlayDate.title} />}
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
            <View style={styles.contextLine}>
              <Ionicons color={colors.primary} name="location-outline" size={15} />
              <Text numberOfLines={1} style={styles.contextTitle}>
                {groupPlayDate.locationName}
              </Text>
            </View>
            <View style={styles.contextMetaRow}>
              <Text style={styles.contextMeta}>
                {groupPlayDate.dateLabel} · {groupPlayDate.timeLabel}
              </Text>
              <Text style={styles.contextMeta}>Hosted by {host?.parentName ?? 'a nearby parent'}</Text>
            </View>
          </View>
        }
        draft={draft}
        items={chatItems}
        onChangeDraft={setDraft}
        onSend={submit}
        onToggleTools={() => setToolsOpen((current) => !current)}
        placeholder="Message the group"
        statusBanner={
          isPendingInvite ? (
            <View style={styles.pendingBanner}>
              <View style={styles.pendingCopy}>
                <Text style={styles.pendingTitle}>Invitation pending</Text>
                <Text numberOfLines={2} style={styles.pendingBody}>
                  You can read the thread and reply before deciding. The group still sees you as pending.
                </Text>
              </View>
              <Pressable
                onPress={() => router.push({ pathname: '/group/[id]', params: { id: groupPlayDate.id } })}
                style={({ pressed }) => [styles.pendingAction, pressed ? styles.pressed : null]}
              >
                <Text style={styles.pendingActionText}>Details</Text>
              </Pressable>
            </View>
          ) : undefined
        }
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
    gap: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(227, 231, 227, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.86)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  contextLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contextTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  contextMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  contextMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: 'rgba(241, 230, 215, 0.94)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  pendingCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  pendingBody: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  pendingAction: {
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pendingActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  pressed: {
    opacity: 0.84,
  },
});
