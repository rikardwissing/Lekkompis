import {
  ANY_PUBLIC_EVENT_AGE,
  ANY_PUBLIC_EVENT_AUDIENCE,
  canParticipateInAudience,
  type ChildProfile,
  type ConversationThread,
  type DraftProfile,
  type ExpectingProfile,
  type Family,
  getActiveMatchedFamilyIds,
  getActiveParent,
  getDirectConversationLastSeenAtForActiveParent,
  type GroupPlayDateAudience,
  hasBornChildren,
  isExpectingFamily,
  getPrimaryParent,
  type GroupPlayDate,
  type Message,
  type PublicEventFilters,
} from '@/store/app-store';
import {
  formatChildBirthdayLabel,
  formatDueMonthLabel,
  formatParentBirthdayLabel,
  formatChildrenSummary,
  getAgeGapSortValue,
  getAllChildInterests,
  getClosestChildAgeMatch,
  getMonthOnlyDifference,
  getNextBirthdayInfo,
} from '@/utils/birthdays';

type ConversationThreadInput = {
  currentFamilyId: string;
  draftProfile: DraftProfile;
  directConversationLastSeenAtByParent: Record<string, Record<string, number>>;
  matchedFamilyIdsByParent: Record<string, string[]>;
  groupConversationLastSeenAtByParent: Record<string, Record<string, number>>;
  families: Family[];
  messagesByMatch: Record<string, Message[]>;
  groupMessagesByPlayDate: Record<string, Message[]>;
  groupPlayDates: GroupPlayDate[];
};

type BuildConversationPreviewOptions = {
  includeSender?: boolean;
  senderName?: string;
};

export type BirthdayEvent = {
  familyId: string;
  familyName: string;
  id: string;
  kind: 'child' | 'parent';
  label: string;
  nextDateLabel: string;
  nextDateOnly: string;
  daysUntil: number;
};

const unique = (values: string[]) => [...new Set(values)];

const getFamilyPublicParent = (family: Family) => getPrimaryParent(family);
const getSharedValues = (left: string[] = [], right: string[] = []) => {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value));
};

export const buildConversationPreview = (
  message?: Message,
  emptyMessage = 'No messages yet - open the chat to start coordinating.',
  options: BuildConversationPreviewOptions = {}
) => {
  if (!message) {
    return emptyMessage;
  }

  if (message.kind === 'event') {
    return message.body ?? emptyMessage;
  }

  const prefix = options.includeSender && options.senderName ? `${options.senderName}: ` : '';

  if (message.body && message.body.trim().length > 0) {
    return `${prefix}${message.body}`;
  }

  const photoCount = message.photoUrls?.length ?? 0;
  return `${prefix}Shared ${photoCount} photo${photoCount === 1 ? '' : 's'}.`;
};

export const formatConversationActivity = (timestamp: number) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));

export const getMatchedFamilies = (families: Family[], matchedFamilyIds: string[] = []) =>
  families.filter((family) => matchedFamilyIds.includes(family.id));

export const getPendingFamilies = (families: Family[], likedFamilyIds: string[] = [], matchedFamilyIds: string[] = []) =>
  families.filter((family) => likedFamilyIds.includes(family.id) && !matchedFamilyIds.includes(family.id));

export const getSharedChildInterests = (draftChildren: ChildProfile[] = [], familyChildren: ChildProfile[] = []) => {
  const draftInterests = new Set(getAllChildInterests(draftChildren));
  return getAllChildInterests(familyChildren).filter((interest) => draftInterests.has(interest));
};

export const getSharedParentInterests = (draftProfile: DraftProfile, family: Family) =>
  getSharedValues(getPrimaryParent(draftProfile)?.interests ?? [], getFamilyPublicParent(family)?.interests ?? []);

export const getSharedLanguages = (draftProfile: DraftProfile, family: Family) =>
  getSharedValues(getPrimaryParent(draftProfile)?.languages ?? [], getFamilyPublicParent(family)?.languages ?? []);

export const getSharedFamilyVibes = (draftProfile: DraftProfile, family: Family) =>
  getSharedValues(draftProfile.familyVibe ?? [], family.familyVibe ?? []);

export const getSharedParentInterestCount = (draftProfile: DraftProfile, family: Family) =>
  getSharedParentInterests(draftProfile, family).length;

export const getSharedLanguageCount = (draftProfile: DraftProfile, family: Family) =>
  getSharedLanguages(draftProfile, family).length;

export const getSharedFamilyVibeCount = (draftProfile: DraftProfile, family: Family) =>
  getSharedFamilyVibes(draftProfile, family).length;

export const getDueMonthGapSortValue = (
  currentExpecting: ExpectingProfile | null | undefined,
  familyExpecting: ExpectingProfile | null | undefined
) => {
  if (!currentExpecting?.dueMonth || !familyExpecting?.dueMonth) {
    return Number.POSITIVE_INFINITY;
  }

  const difference = getMonthOnlyDifference(currentExpecting.dueMonth, familyExpecting.dueMonth);
  return difference ?? Number.POSITIVE_INFINITY;
};

export const getDueMonthFitLabel = (
  currentExpecting: ExpectingProfile | null | undefined,
  familyExpecting: ExpectingProfile | null | undefined
) => {
  const difference = getMonthOnlyDifference(currentExpecting?.dueMonth ?? '', familyExpecting?.dueMonth ?? '');

  if (difference === null || difference > 3) {
    return null;
  }

  return 'Similar due month';
};

export const getFamilyAgeFitLabel = (draftChildren: ChildProfile[] = [], familyChildren: ChildProfile[] = []) => {
  const match = getClosestChildAgeMatch(draftChildren, familyChildren);

  if (!match) {
    return null;
  }

  return match.label === 'same' ? 'Same age' : 'Close age match';
};

export const isSimilarAgeFamily = (draftChildren: ChildProfile[] = [], familyChildren: ChildProfile[] = []) =>
  Number.isFinite(getAgeGapSortValue(draftChildren, familyChildren));

export const getFamilySortValue = (draftChildren: ChildProfile[] = [], familyChildren: ChildProfile[] = []) =>
  getAgeGapSortValue(draftChildren, familyChildren);

export const getFamilyFitChips = (draftProfile: DraftProfile, family: Family) => {
  const ageFit = getFamilyAgeFitLabel(draftProfile.children ?? [], family.children ?? []);
  const dueMonthFit = getDueMonthFitLabel(draftProfile.expecting, family.expecting);
  const parentFitChips = [
    getSharedParentInterestCount(draftProfile, family) > 0 ? 'Shared parent interests' : null,
    getSharedLanguageCount(draftProfile, family) > 0 ? 'Shared language' : null,
    getSharedFamilyVibeCount(draftProfile, family) > 0 ? 'Shared family vibe' : null,
  ].filter((value): value is string => Boolean(value));

  return unique([...(family.shared ?? []), ...(ageFit ? [ageFit] : []), ...(dueMonthFit ? [dueMonthFit] : []), ...parentFitChips]);
};

export const getFamilyChildrenSummary = (
  children: ChildProfile[],
  expecting?: ExpectingProfile | null,
  today = new Date()
) => {
  const childSummary = formatChildrenSummary(children, today);
  const dueMonthLabel = expecting?.dueMonth ? formatDueMonthLabel(expecting.dueMonth) : null;

  if (childSummary && dueMonthLabel) {
    return `${childSummary} · ${dueMonthLabel}`;
  }

  return childSummary || dueMonthLabel || 'No family details yet';
};

export const isExpectingOnlyFamily = (value: { children?: ChildProfile[]; expecting?: ExpectingProfile | null }) =>
  !hasBornChildren(value) && isExpectingFamily(value);

export const getGroupAudienceLabel = ({
  ageRange,
  audience,
}: {
  ageRange?: string;
  audience: GroupPlayDateAudience;
}) => (audience === 'expecting' ? 'Expecting parents' : ageRange ?? 'Families with children');

export const getUpcomingBirthdayEventsForFamily = (family: Family, today = new Date(), windowDays = 30) => {
  const familyParent = getFamilyPublicParent(family);
  const childEvents = (family.children ?? []).reduce<BirthdayEvent[]>((events, child) => {
    const info = getNextBirthdayInfo(child.birthDate, today);
    const label = formatChildBirthdayLabel(child.name, child.birthDate, today);

    if (!info || !label || info.daysUntil > windowDays) {
      return events;
    }

    events.push({
      familyId: family.id,
      familyName: familyParent?.firstName ?? 'Parent',
      id: `${family.id}-${child.id}`,
      kind: 'child',
      label,
      nextDateLabel: info.nextDateLabel,
      nextDateOnly: info.nextDateOnly,
      daysUntil: info.daysUntil,
    });

    return events;
  }, []);

  const parentInfo = familyParent?.birthDate ? getNextBirthdayInfo(familyParent.birthDate, today) : null;
  const parentLabel = familyParent?.birthDate
    ? formatParentBirthdayLabel(familyParent.firstName, familyParent.birthDate, today)
    : null;
  const parentEvents =
    parentInfo && parentLabel && parentInfo.daysUntil <= windowDays
      ? [
          {
            familyId: family.id,
            familyName: familyParent.firstName,
            id: `${family.id}-parent`,
            kind: 'parent' as const,
            label: parentLabel,
            nextDateLabel: parentInfo.nextDateLabel,
            nextDateOnly: parentInfo.nextDateOnly,
            daysUntil: parentInfo.daysUntil,
          },
        ]
      : [];

  return [...childEvents, ...parentEvents].sort((a, b) => a.daysUntil - b.daysUntil || a.label.localeCompare(b.label));
};

export const getUpcomingBirthdayEvents = (
  families: Family[],
  matchedFamilyIds: string[],
  today = new Date(),
  windowDays = 30
) =>
  getMatchedFamilies(families, matchedFamilyIds)
    .flatMap((family) => getUpcomingBirthdayEventsForFamily(family, today, windowDays))
    .sort((a, b) => a.daysUntil - b.daysUntil || a.nextDateOnly.localeCompare(b.nextDateOnly));

export const isGroupFull = (groupPlayDate: GroupPlayDate) =>
  groupPlayDate.attendeeFamilyIds.length >= groupPlayDate.capacity;

export const isGroupSharedWithParent = (groupPlayDate: GroupPlayDate, parentId?: string | null) =>
  Boolean(parentId && groupPlayDate.includedParentIds.includes(parentId));

export const isGroupSharedWithActiveParent = (groupPlayDate: GroupPlayDate, draftProfile: DraftProfile) =>
  isGroupSharedWithParent(groupPlayDate, getActiveParent(draftProfile)?.id);

export const canActiveParentViewGroup = (groupPlayDate: GroupPlayDate, draftProfile: DraftProfile) =>
  groupPlayDate.membership === 'none' || isGroupSharedWithActiveParent(groupPlayDate, draftProfile);

export const getPrivateInvitations = (
  groupPlayDates: GroupPlayDate[],
  currentFamilyId: string,
  draftProfile: DraftProfile
) =>
  groupPlayDates.filter(
    (groupPlayDate) =>
      isGroupSharedWithActiveParent(groupPlayDate, draftProfile) &&
      groupPlayDate.visibility === 'private' &&
      groupPlayDate.membership === 'invited' &&
      groupPlayDate.invitedFamilyIds.includes(currentFamilyId)
  );

export const getHostedRequestGroups = (
  groupPlayDates: GroupPlayDate[],
  currentFamilyId: string,
  draftProfile: DraftProfile
) =>
  groupPlayDates.filter(
    (groupPlayDate) =>
      isGroupSharedWithActiveParent(groupPlayDate, draftProfile) &&
      groupPlayDate.visibility === 'public' &&
      groupPlayDate.hostFamilyId === currentFamilyId &&
      groupPlayDate.pendingRequestFamilyIds.length > 0
  );

export const getPendingGroupJoinRequestCount = (
  groupPlayDates: GroupPlayDate[],
  currentFamilyId: string,
  draftProfile: DraftProfile
) =>
  getHostedRequestGroups(groupPlayDates, currentFamilyId, draftProfile).reduce(
    (count, groupPlayDate) => count + groupPlayDate.pendingRequestFamilyIds.length,
    0
  );

export const getGroupAttentionCount = (
  groupPlayDates: GroupPlayDate[],
  currentFamilyId: string,
  draftProfile: DraftProfile
) =>
  getPrivateInvitations(groupPlayDates, currentFamilyId, draftProfile).length +
  getPendingGroupJoinRequestCount(groupPlayDates, currentFamilyId, draftProfile);

export const getUpcomingGroups = (groupPlayDates: GroupPlayDate[], draftProfile: DraftProfile) =>
  groupPlayDates.filter(
    (groupPlayDate) =>
      isGroupSharedWithActiveParent(groupPlayDate, draftProfile) &&
      (groupPlayDate.membership === 'hosting' || groupPlayDate.membership === 'going')
  );

export const getDiscoverablePublicEvents = ({
  currentFamilyId,
  draftProfile,
  filters,
  groupPlayDates,
}: {
  currentFamilyId: string;
  draftProfile: DraftProfile;
  filters: PublicEventFilters;
  groupPlayDates: GroupPlayDate[];
}) =>
  groupPlayDates.filter((groupPlayDate) => {
    if (groupPlayDate.visibility !== 'public') return false;
    if (groupPlayDate.hostFamilyId === currentFamilyId) return false;
    if (groupPlayDate.membership !== 'none' && groupPlayDate.membership !== 'requested') return false;
    if (!canParticipateInAudience(draftProfile, groupPlayDate.audience)) return false;
    if (filters.area !== 'All nearby' && groupPlayDate.area !== filters.area) return false;
    if (filters.audience !== ANY_PUBLIC_EVENT_AUDIENCE && groupPlayDate.audience !== filters.audience) return false;
    if (
      filters.audience === 'children' &&
      filters.ageRange !== ANY_PUBLIC_EVENT_AGE &&
      groupPlayDate.ageRange !== filters.ageRange
    ) {
      return false;
    }
    if (
      filters.selectedActivityTags.length > 0 &&
      !filters.selectedActivityTags.some((tag) => groupPlayDate.activityTags.includes(tag))
    ) {
      return false;
    }

    return true;
  });

export const getConversationThreads = ({
  currentFamilyId,
  draftProfile,
  directConversationLastSeenAtByParent,
  matchedFamilyIdsByParent,
  groupConversationLastSeenAtByParent,
  families,
  messagesByMatch,
  groupMessagesByPlayDate,
  groupPlayDates,
}: ConversationThreadInput): ConversationThread[] => {
  const activeParent = getActiveParent(draftProfile);
  const primaryParent = getPrimaryParent(draftProfile);
  const activeMatchedFamilyIds = getActiveMatchedFamilyIds(draftProfile, matchedFamilyIdsByParent);
  const activeDirectConversationLastSeenAt = getDirectConversationLastSeenAtForActiveParent(
    draftProfile,
    directConversationLastSeenAtByParent
  );
  const familyDirectory = Object.fromEntries([
    [
      currentFamilyId,
      {
        parentName: primaryParent?.firstName ?? 'Parent',
        avatarUrl: primaryParent?.avatarUrl,
      },
    ],
    ...families.map((family) => {
      const publicParent = getFamilyPublicParent(family);
      return [
        family.id,
        {
          parentName: publicParent?.firstName ?? 'Parent',
          avatarUrl: publicParent?.avatarUrl,
        },
      ] as const;
    }),
  ]);
  const parentDirectory = Object.fromEntries([
    ...draftProfile.parents.map((parent) => [
      parent.id,
      {
        familyId: currentFamilyId,
        name: parent.firstName,
        avatarUrl: parent.avatarUrl,
      },
    ]),
    ...families.flatMap((family) =>
      family.parents.map((parent) => [
        parent.id,
        {
          familyId: family.id,
          name: parent.firstName,
          avatarUrl: parent.avatarUrl,
        },
      ])
    ),
  ]);

  const directThreads = Object.entries(messagesByMatch).reduce<ConversationThread[]>((threadsAccumulator, [matchId, messages]) => {
    const family = families.find((entry) => `${entry.id}-match` === matchId);
    const publicParent = family ? getFamilyPublicParent(family) : null;

    if (!family || !publicParent || messages.length === 0 || !activeMatchedFamilyIds.includes(family.id)) {
      return threadsAccumulator;
    }

    const lastMessage = messages[messages.length - 1];
    const lastSeenAt = activeDirectConversationLastSeenAt[matchId] ?? 0;
    const unreadCount = messages.filter(
      (message) => message.senderParentId !== activeParent?.id && message.createdAt > lastSeenAt
    ).length;

    threadsAccumulator.push({
      id: matchId,
      kind: 'direct',
      title: publicParent.firstName,
      subtitle: `Direct chat - ${family.area}`,
      lastMessagePreview: buildConversationPreview(lastMessage),
      lastActivityAt: lastMessage.createdAt,
      route: `/chat/${matchId}`,
      badgeLabel: 'Direct',
      badgeTone: 'direct',
      avatarNames: [publicParent.firstName],
      avatarUrls: publicParent.avatarUrl ? [publicParent.avatarUrl] : [],
      participantCount: 2,
      unreadCount,
    });

    return threadsAccumulator;
  }, []);

  const groupThreads = groupPlayDates
    .filter(
      (groupPlayDate) =>
        isGroupSharedWithActiveParent(groupPlayDate, draftProfile) &&
        (groupPlayDate.membership === 'hosting' ||
          groupPlayDate.membership === 'going' ||
          (groupPlayDate.visibility === 'private' &&
            groupPlayDate.membership === 'invited' &&
            groupPlayDate.invitedFamilyIds.includes(currentFamilyId)))
    )
    .map<ConversationThread>((groupPlayDate) => {
      const messages = groupMessagesByPlayDate[groupPlayDate.id] ?? [];
      const lastMessage = messages[messages.length - 1];
      const isPendingInvite =
        groupPlayDate.visibility === 'private' &&
        groupPlayDate.membership === 'invited' &&
        groupPlayDate.invitedFamilyIds.includes(currentFamilyId);
      const lastSeenAt = activeParent
        ? groupConversationLastSeenAtByParent[activeParent.id]?.[groupPlayDate.id] ?? 0
        : 0;
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
      const unreadMessageCount = activeParent
        ? messages.filter((message) => message.senderParentId !== activeParent.id && message.createdAt > lastSeenAt).length
        : 0;
      const unreadCount =
        unreadMessageCount > 0
          ? unreadMessageCount
          : isPendingInvite && groupPlayDate.createdAt > lastSeenAt
            ? 1
            : 0;
      const lastMessageSenderName = lastMessage ? parentDirectory[lastMessage.senderParentId]?.name : undefined;

      return {
        id: groupPlayDate.id,
        kind: 'group' as const,
        title: groupPlayDate.title,
        subtitle: isPendingInvite
          ? `Invitation pending - ${groupPlayDate.dateLabel} - ${groupPlayDate.locationName}`
          : `${groupPlayDate.dateLabel} - ${groupPlayDate.locationName}`,
        lastMessagePreview: buildConversationPreview(
          lastMessage,
          isPendingInvite
            ? 'Invitation pending - open the group chat to see who is confirmed before you reply.'
            : 'No messages yet - open the group chat to start coordinating.',
          {
            includeSender: Boolean(lastMessageSenderName),
            senderName: lastMessageSenderName,
          }
        ),
        lastActivityAt: lastMessage?.createdAt ?? groupPlayDate.createdAt,
        route: `/group-chat/${groupPlayDate.id}`,
        badgeLabel: isPendingInvite ? 'Pending' : 'Group',
        badgeTone: isPendingInvite ? 'pending' : 'group',
        avatarNames,
        avatarUrls,
        participantCount: groupPlayDate.attendeeFamilyIds.length + (isPendingInvite ? 1 : 0),
        unreadCount,
      };
    });

  return [...directThreads, ...groupThreads].sort((left, right) => right.lastActivityAt - left.lastActivityAt);
};

export const getUnreadConversationThreadCount = (threads: ConversationThread[]) =>
  threads.filter((thread) => thread.unreadCount > 0).length;
