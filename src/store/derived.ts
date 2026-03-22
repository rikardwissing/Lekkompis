import type { ConversationThread, DraftProfile, Family, GroupPlayDate, Message } from '@/store/app-store';

type ConversationThreadInput = {
  currentFamilyId: string;
  draftProfile: DraftProfile;
  conversationLastSeenAt: Record<string, number>;
  families: Family[];
  messagesByMatch: Record<string, Message[]>;
  groupMessagesByPlayDate: Record<string, Message[]>;
  groupPlayDates: GroupPlayDate[];
};

export const buildConversationPreview = (
  message?: Message,
  emptyMessage = 'No messages yet - open the chat to start coordinating.'
) => {
  if (!message) {
    return emptyMessage;
  }

  if (message.body && message.body.trim().length > 0) {
    return message.body;
  }

  const photoCount = message.photoUrls?.length ?? 0;
  return `Shared ${photoCount} photo${photoCount === 1 ? '' : 's'}.`;
};

export const formatConversationActivity = (timestamp: number) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));

export const getMatchedFamilies = (families: Family[], matchedFamilyIds: string[]) =>
  families.filter((family) => matchedFamilyIds.includes(family.id));

export const getPendingFamilies = (families: Family[], likedFamilyIds: string[], matchedFamilyIds: string[]) =>
  families.filter((family) => likedFamilyIds.includes(family.id) && !matchedFamilyIds.includes(family.id));

export const getConversationThreads = ({
  currentFamilyId,
  draftProfile,
  conversationLastSeenAt,
  families,
  messagesByMatch,
  groupMessagesByPlayDate,
  groupPlayDates,
}: ConversationThreadInput): ConversationThread[] => {
  const familyDirectory = Object.fromEntries([
    [
      currentFamilyId,
      {
        parentName: draftProfile.parentName,
        avatarUrl: draftProfile.avatarUrl,
      },
    ],
    ...families.map((family) => [
      family.id,
      {
        parentName: family.parentName,
        avatarUrl: family.avatarUrl,
      },
    ]),
  ]);

  const directThreads = Object.entries(messagesByMatch).reduce<ConversationThread[]>(
    (threadsAccumulator, [matchId, messages]) => {
      const family = families.find((entry) => `${entry.id}-match` === matchId);

      if (!family || messages.length === 0) {
        return threadsAccumulator;
      }

      const lastMessage = messages[messages.length - 1];
      const lastSeenAt = conversationLastSeenAt[matchId] ?? 0;
      const unreadCount = messages.filter(
        (message) => message.sender !== draftProfile.parentName && message.createdAt > lastSeenAt
      ).length;

      threadsAccumulator.push({
        id: matchId,
        kind: 'direct',
        title: family.parentName,
        subtitle: `Direct chat - ${family.area}`,
        lastMessagePreview: buildConversationPreview(lastMessage),
        lastActivityAt: lastMessage.createdAt,
        route: `/chat/${matchId}`,
        badgeLabel: 'Direct',
        badgeTone: 'direct',
        avatarNames: [family.parentName],
        avatarUrls: family.avatarUrl ? [family.avatarUrl] : [],
        participantCount: 2,
        unreadCount,
      });

      return threadsAccumulator;
    },
    []
  );

  const groupThreads = groupPlayDates
    .filter(
      (groupPlayDate) =>
        ((groupPlayDate.status === 'going' || groupPlayDate.status === 'hosting') &&
          (groupPlayDate.hostFamilyId === currentFamilyId || groupPlayDate.attendeeFamilyIds.includes(currentFamilyId))) ||
        (groupPlayDate.status === 'invited' && groupPlayDate.invitedFamilyIds.includes(currentFamilyId))
    )
    .map((groupPlayDate) => {
      const messages = groupMessagesByPlayDate[groupPlayDate.id] ?? [];
      const lastMessage = messages[messages.length - 1];
      const isPendingInvite =
        groupPlayDate.status === 'invited' && groupPlayDate.invitedFamilyIds.includes(currentFamilyId);
      const lastSeenAt = conversationLastSeenAt[groupPlayDate.id] ?? 0;
      const avatarFamilyIds = [
        groupPlayDate.hostFamilyId,
        ...groupPlayDate.attendeeFamilyIds.filter((familyId) => familyId !== groupPlayDate.hostFamilyId),
      ];
      const avatarNames = avatarFamilyIds
        .map((familyId) => familyDirectory[familyId]?.parentName)
        .filter((name): name is string => Boolean(name));
      const avatarUrls = avatarFamilyIds
        .map((familyId) => familyDirectory[familyId]?.avatarUrl)
        .filter((avatarUrl): avatarUrl is string => Boolean(avatarUrl));
      const unreadMessageCount = messages.filter(
        (message) => message.sender !== draftProfile.parentName && message.createdAt > lastSeenAt
      ).length;
      const unreadCount =
        unreadMessageCount > 0
          ? unreadMessageCount
          : isPendingInvite && groupPlayDate.createdAt > lastSeenAt
            ? 1
            : 0;

      return {
        id: groupPlayDate.id,
        kind: 'group',
        title: groupPlayDate.title,
        subtitle: isPendingInvite
          ? `Invitation pending - ${groupPlayDate.dateLabel} - ${groupPlayDate.locationName}`
          : `${groupPlayDate.dateLabel} - ${groupPlayDate.locationName}`,
        lastMessagePreview: buildConversationPreview(
          lastMessage,
          isPendingInvite
            ? 'Invitation pending - open the group chat to see who is confirmed before you reply.'
            : 'No messages yet - open the group chat to start coordinating.'
        ),
        lastActivityAt: lastMessage?.createdAt ?? groupPlayDate.createdAt,
        route: `/group-chat/${groupPlayDate.id}`,
        badgeLabel: isPendingInvite ? 'Pending' : 'Group',
        badgeTone: isPendingInvite ? 'pending' : 'group',
        avatarNames,
        avatarUrls,
        participantCount:
          groupPlayDate.attendeeFamilyIds.length + (isPendingInvite ? 1 : 0),
        unreadCount,
      } satisfies ConversationThread;
    });

  return [...groupThreads, ...directThreads].sort((a, b) => b.lastActivityAt - a.lastActivityAt);
};
