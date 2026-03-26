import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChatThread, type ChatToolSection } from '@/components/chat/ChatThread';
import { buildChatRenderableItems } from '@/components/chat/chat-presenters';
import { SubscreenHeader } from '@/components/navigation/SubscreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { getActiveParent, getPrimaryParent, useAppStore } from '@/store/app-store';
import { getGroupAudienceLabel } from '@/store/derived';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

const suggestedGroupReplies = [
  'We are in and should be there on time.',
  'Happy to keep this one simple and low-key.',
  'Tea and a short catch-up sounds lovely to us.',
];

const groupPhotoOptions = [
  'https://picsum.photos/seed/group-chat-photo-1/720/480',
  'https://picsum.photos/seed/group-chat-photo-2/720/480',
];

export function generateStaticParams() {
  return [{ groupId: 'animal-zoo-sunday' }, { groupId: 'vasaparken-saturday' }, { groupId: 'due-date-coffee-circle' }];
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
  const markGroupConversationRead = useAppStore((state) => state.markGroupConversationRead);
  const sendGroupMessage = useAppStore((state) => state.sendGroupMessage);
  const activeParent = getActiveParent(draftProfile);
  const primaryParent = getPrimaryParent(draftProfile);
  const activeParentId = activeParent?.id ?? draftProfile.primaryParentId;

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
            avatarUrl: primaryParent?.avatarUrl,
            parentName: primaryParent?.firstName ?? 'Parent',
          },
        ],
        ...families.map((family) => {
          const publicParent = getPrimaryParent(family);
          return [
            family.id,
            {
              avatarUrl: publicParent?.avatarUrl,
              parentName: publicParent?.firstName ?? 'Parent',
            },
          ] as const;
        }),
      ]),
    [currentFamilyId, families, primaryParent]
  );
  const senderDirectory = useMemo(
    () =>
      Object.fromEntries([
        ...draftProfile.parents.map((parent) => [
          parent.id,
          {
            avatarUrl: parent.avatarUrl,
            name: parent.firstName,
          },
        ]),
        ...families.flatMap((family) =>
          family.parents.map((parent) => [
            parent.id,
            {
              avatarUrl: parent.avatarUrl,
              name: parent.firstName,
            },
          ])
        ),
      ]),
    [draftProfile.parents, families]
  );
  const canSend = draft.trim().length > 0 || selectedPhotoUrls.length > 0;
  const isSharedWithActiveParent = groupPlayDate ? groupPlayDate.includedParentIds.includes(activeParentId) : false;
  const isPendingInvite =
    groupPlayDate?.visibility === 'private' &&
    groupPlayDate.membership === 'invited' &&
    groupPlayDate.invitedFamilyIds.includes(currentFamilyId);
  const canAccessChat =
    isSharedWithActiveParent &&
    (groupPlayDate?.membership === 'hosting' ||
      groupPlayDate?.membership === 'going' ||
      isPendingInvite);

  useEffect(() => {
    if (!groupPlayDate || !canAccessChat) {
      return;
    }

    const lastActivityAt = messages[messages.length - 1]?.createdAt ?? groupPlayDate.createdAt;
    markGroupConversationRead(groupPlayDate.id, lastActivityAt);
  }, [canAccessChat, groupPlayDate, markGroupConversationRead, messages]);

  const chatItems = useMemo(
    () =>
      buildChatRenderableItems({
        currentSenderParentId: activeParent?.id ?? draftProfile.primaryParentId,
        messages,
        senderDirectory,
        threadKind: 'group',
      }),
    [activeParent?.id, draftProfile.primaryParentId, messages, senderDirectory]
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

  const host = familyById[groupPlayDate.hostFamilyId];

  if (groupPlayDate.membership !== 'none' && !isSharedWithActiveParent) {
    return (
      <Screen header={<SubscreenHeader fallbackHref="/conversations" title={groupPlayDate.title} />}>
        <EmptyState
          title="This chat has not been shared with this parent yet"
          body="Another parent in your family needs to add this parent before the thread appears here."
          actionLabel="Open event details"
          onAction={() => router.replace({ pathname: '/group/[id]', params: { id: groupPlayDate.id } })}
        />
      </Screen>
    );
  }

  if (!canAccessChat) {
    return (
      <Screen header={<SubscreenHeader fallbackHref="/conversations" title={groupPlayDate.title} />}>
        <EmptyState
          title="Chat unlocks after approval"
          body="Public event chats open once the host approves your request. You can still review the event details in the meantime."
          actionLabel="Open event details"
          onAction={() => router.replace({ pathname: '/group/[id]', params: { id: groupPlayDate.id } })}
        />
      </Screen>
    );
  }

  const submit = () => {
    const trimmed = draft.trim();

    if (!trimmed && selectedPhotoUrls.length === 0) {
      return;
    }

    sendGroupMessage(groupPlayDate.id, trimmed, selectedPhotoUrls);
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
            <View style={styles.contextHeaderRow}>
              <View style={styles.contextLine}>
                <Ionicons color={colors.primary} name="location-outline" size={15} />
                <Text numberOfLines={1} style={styles.contextTitle}>
                  {groupPlayDate.locationName}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Open event details"
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/group/[id]', params: { id: groupPlayDate.id } })}
                style={({ pressed }) => [styles.contextAction, pressed ? styles.pressed : null]}
              >
                <Text style={styles.contextActionText}>Open event</Text>
              </Pressable>
            </View>
            <View style={styles.contextMetaRow}>
              <Text style={styles.contextMeta}>
                {groupPlayDate.dateLabel} · {groupPlayDate.timeLabel}
              </Text>
              <Text style={styles.contextMeta}>{getGroupAudienceLabel(groupPlayDate)}</Text>
              <Text style={styles.contextMeta}>Hosted by {host?.parentName ?? 'a nearby parent'}</Text>
              {activeParent ? <Text style={styles.contextMeta}>Coordinating as {activeParent.firstName}</Text> : null}
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
  contextHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contextLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  contextTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
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
