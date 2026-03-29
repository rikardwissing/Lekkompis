import {
  ANY_PUBLIC_EVENT_AGE,
  ANY_PUBLIC_EVENT_AUDIENCE,
  buildDirectMatchId,
  canParticipateInAudience,
  type ChildProfile,
  type ConversationThread,
  type DraftProfile,
  type ExpectingProfile,
  type Family,
  getActiveMatchedParentIds,
  getActiveParent,
  getDirectConversationLastSeenAtForActiveParent,
  getFamilyByParentId,
  type GroupPlayDateAudience,
  hasBornChildren,
  isExpectingFamily,
  type ParentAccount,
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
import { getDistanceBucketLabel, getDistanceKm, isWithinRadius } from '@/utils/location';

type ConversationThreadInput = {
  currentFamilyId: string;
  draftProfile: DraftProfile;
  directConversationLastSeenAtByParent: Record<string, Record<string, number>>;
  matchedParentIdsByParent: Record<string, string[]>;
  matchedAtByMatchId: Record<string, number>;
  groupConversationLastSeenAtByParent: Record<string, Record<string, number>>;
  families: Family[];
  messagesByMatch: Record<string, Message[]>;
  groupMessagesByPlayDate: Record<string, Message[]>;
  groupPlayDates: GroupPlayDate[];
};

type PlansInput = {
  currentFamilyId: string;
  draftProfile: DraftProfile;
  groupPlayDates: GroupPlayDate[];
};

type LinkedParentOverviewInput = {
  currentFamilyId: string;
  draftProfile: DraftProfile;
  matchedParentIdsByParent: Record<string, string[]>;
  families: Family[];
  messagesByMatch: Record<string, Message[]>;
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

export type PlansItem = {
  id: string;
  kind: 'private' | 'public';
  title: string;
  subtitle: string;
  statusLabel: string;
  note: string;
  route: string;
  attention: boolean;
  upcoming: boolean;
  hosting: boolean;
  sortValue: number;
};

export type LinkedParentOverview = {
  parentId: string;
  parentName: string;
  mutualMatches: Array<{ id: string; name: string }>;
  directChats: Array<{ id: string; name: string; lastActivityAt: number }>;
  plans: Array<{ id: string; title: string; status: string }>;
};

const unique = (values: string[]) => [...new Set(values)];
const MONTH_LOOKUP = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
} satisfies Record<string, number>;

const getFamilyPublicParent = (family: Family) => getPrimaryParent(family);
const getCurrentDiscoveryParent = (draftProfile: DraftProfile) => getActiveParent(draftProfile) ?? getPrimaryParent(draftProfile);
const getSharedValues = (left: string[] = [], right: string[] = []) => {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value));
};
const resolveParentEntry = (families: Family[], parentId: string) => {
  const family = getFamilyByParentId(families, parentId);
  const parent = family?.parents.find((entry) => entry.id === parentId) ?? null;

  if (!family || !parent) {
    return null;
  }

  return { family, parent };
};
const parseScheduleSortValue = (dateLabel: string, fallback = Number.POSITIVE_INFINITY) => {
  const match = dateLabel.match(/^[A-Za-z]{3}\s+(\d{1,2})\s+([A-Za-z]{3})$/);

  if (!match) {
    return fallback;
  }

  const [, dayToken, monthToken] = match;
  const month = MONTH_LOOKUP[monthToken as keyof typeof MONTH_LOOKUP];
  const day = Number.parseInt(dayToken, 10);

  if (month === undefined || Number.isNaN(day)) {
    return fallback;
  }

  const today = new Date();
  const candidate = new Date(today.getFullYear(), month, day, 12).getTime();
  return candidate >= today.getTime() ? candidate : new Date(today.getFullYear() + 1, month, day, 12).getTime();
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

export const getSharedParentInterests = (
  draftProfile: DraftProfile,
  family: Family,
  familyParent: ParentAccount | null = getFamilyPublicParent(family)
) => getSharedValues(getCurrentDiscoveryParent(draftProfile)?.interests ?? [], familyParent?.interests ?? []);

export const getSharedLanguages = (
  draftProfile: DraftProfile,
  family: Family,
  familyParent: ParentAccount | null = getFamilyPublicParent(family)
) => getSharedValues(getCurrentDiscoveryParent(draftProfile)?.languages ?? [], familyParent?.languages ?? []);

export const getSharedFamilyVibes = (draftProfile: DraftProfile, family: Family) =>
  getSharedValues(draftProfile.familyVibe ?? [], family.familyVibe ?? []);

export const getSharedParentInterestCount = (
  draftProfile: DraftProfile,
  family: Family,
  familyParent: ParentAccount | null = getFamilyPublicParent(family)
) => getSharedParentInterests(draftProfile, family, familyParent).length;

export const getSharedLanguageCount = (
  draftProfile: DraftProfile,
  family: Family,
  familyParent: ParentAccount | null = getFamilyPublicParent(family)
) => getSharedLanguages(draftProfile, family, familyParent).length;

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

export const getFamilyFitChips = (
  draftProfile: DraftProfile,
  family: Family,
  familyParent: ParentAccount | null = getFamilyPublicParent(family)
) => {
  const ageFit = getFamilyAgeFitLabel(draftProfile.children ?? [], family.children ?? []);
  const dueMonthFit = getDueMonthFitLabel(draftProfile.expecting, family.expecting);
  const parentFitChips = [
    getSharedParentInterestCount(draftProfile, family, familyParent) > 0 ? 'Shared parent interests' : null,
    getSharedLanguageCount(draftProfile, family, familyParent) > 0 ? 'Shared language' : null,
    getSharedFamilyVibeCount(draftProfile, family) > 0 ? 'Shared family vibe' : null,
  ].filter((value): value is string => Boolean(value));

  return unique([...(family.shared ?? []), ...(ageFit ? [ageFit] : []), ...(dueMonthFit ? [dueMonthFit] : []), ...parentFitChips]);
};

export const getFamilyDistanceKm = (draftProfile: DraftProfile, family: Family) =>
  getDistanceKm(draftProfile.homeLocation, family.homeLocation);

export const getFamilyDistanceLabel = (draftProfile: DraftProfile, family: Family) =>
  getDistanceBucketLabel(getFamilyDistanceKm(draftProfile, family));

export const getGroupDistanceKm = (draftProfile: DraftProfile, groupPlayDate: GroupPlayDate) =>
  getDistanceKm(draftProfile.homeLocation, groupPlayDate.location);

export const getGroupDistanceLabel = (draftProfile: DraftProfile, groupPlayDate: GroupPlayDate) =>
  getDistanceBucketLabel(getGroupDistanceKm(draftProfile, groupPlayDate));

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
}) => (audience === 'mixed' ? 'Private meetup' : audience === 'expecting' ? 'Expecting parents' : ageRange ?? 'Families with children');

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
  Boolean(parentId && groupPlayDate.accessibleParentIds.includes(parentId));

export const isGroupSharedWithActiveParent = (groupPlayDate: GroupPlayDate, draftProfile: DraftProfile) =>
  isGroupSharedWithParent(groupPlayDate, getActiveParent(draftProfile)?.id);

export const canActiveParentViewGroup = (groupPlayDate: GroupPlayDate, draftProfile: DraftProfile) =>
  groupPlayDate.membership === 'none' || isGroupSharedWithActiveParent(groupPlayDate, draftProfile);

export const getPrivateInvitations = (
  groupPlayDates: GroupPlayDate[],
  draftProfile: DraftProfile
) =>
  groupPlayDates.filter((groupPlayDate) => {
    const activeParentId = getActiveParent(draftProfile)?.id;

    return (
      Boolean(activeParentId) &&
      isGroupSharedWithActiveParent(groupPlayDate, draftProfile) &&
      groupPlayDate.visibility === 'private' &&
      groupPlayDate.membership === 'invited' &&
      groupPlayDate.invitedParentIds.includes(activeParentId)
    );
  });

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
      groupPlayDate.pendingRequestParentIds.length > 0
  );

export const getPendingGroupJoinRequestCount = (
  groupPlayDates: GroupPlayDate[],
  currentFamilyId: string,
  draftProfile: DraftProfile
) =>
  getHostedRequestGroups(groupPlayDates, currentFamilyId, draftProfile).reduce(
    (count, groupPlayDate) => count + groupPlayDate.pendingRequestParentIds.length,
    0
  );

export const getGroupAttentionCount = (
  groupPlayDates: GroupPlayDate[],
  currentFamilyId: string,
  draftProfile: DraftProfile
) =>
  getPrivateInvitations(groupPlayDates, draftProfile).length +
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
  groupPlayDates
    .map((groupPlayDate, index) => ({
      distanceKm: getDistanceKm(draftProfile.homeLocation, groupPlayDate.location),
      groupPlayDate,
      index,
    }))
    .filter(({ groupPlayDate }) => {
      if (groupPlayDate.visibility !== 'public') return false;
      if (groupPlayDate.audience === 'mixed') return false;
      if (groupPlayDate.hostFamilyId === currentFamilyId) return false;
      if (groupPlayDate.membership !== 'none' && groupPlayDate.membership !== 'requested') return false;
      if (!canParticipateInAudience(draftProfile, groupPlayDate.audience)) return false;
      if (!isWithinRadius(draftProfile.homeLocation, groupPlayDate.location, filters.radiusKm)) return false;
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
    })
    .sort((left, right) => {
      const leftDistance = left.distanceKm ?? Number.POSITIVE_INFINITY;
      const rightDistance = right.distanceKm ?? Number.POSITIVE_INFINITY;

      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }

      return left.index - right.index;
    })
    .map(({ groupPlayDate }) => groupPlayDate);

export const getConversationThreads = ({
  currentFamilyId,
  draftProfile,
  directConversationLastSeenAtByParent,
  matchedParentIdsByParent,
  matchedAtByMatchId,
  groupConversationLastSeenAtByParent,
  families,
  messagesByMatch,
  groupMessagesByPlayDate,
  groupPlayDates,
}: ConversationThreadInput): ConversationThread[] => {
  const activeParent = getActiveParent(draftProfile);
  const primaryParent = getPrimaryParent(draftProfile);
  const activeMatchedParentIds = getActiveMatchedParentIds(draftProfile, matchedParentIdsByParent);
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

  const directThreads = activeMatchedParentIds.reduce<ConversationThread[]>((threadsAccumulator, remoteParentId) => {
    if (!activeParent) {
      return threadsAccumulator;
    }

    const family = getFamilyByParentId(families, remoteParentId);
    const remoteParent = family ? family.parents.find((parent) => parent.id === remoteParentId) : null;
    const matchId = buildDirectMatchId(activeParent.id, remoteParentId);
    const messages = messagesByMatch[matchId] ?? [];

    if (!family || !remoteParent) {
      return threadsAccumulator;
    }

    const lastMessage = messages[messages.length - 1];
    const lastSeenAt = activeDirectConversationLastSeenAt[matchId] ?? 0;
    const unreadCount = messages.filter(
      (message) => message.senderParentId !== activeParent.id && message.createdAt > lastSeenAt
    ).length;

    threadsAccumulator.push({
      id: matchId,
      kind: 'direct',
      isNewMatch: messages.length === 0,
      title: remoteParent.firstName,
      subtitle: getFamilyChildrenSummary(family.children ?? [], family.expecting),
      lastMessagePreview:
        messages.length > 0 ? buildConversationPreview(lastMessage) : 'Mutual match - start the conversation.',
      lastActivityAt: messages.length > 0 ? lastMessage.createdAt : matchedAtByMatchId[matchId] ?? 0,
      route: `/chat/${matchId}`,
      badgeLabel: messages.length > 0 ? 'Direct' : 'New match',
      badgeTone: 'direct',
      avatarNames: [remoteParent.firstName],
      avatarUrls: remoteParent.avatarUrl ? [remoteParent.avatarUrl] : [],
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
            Boolean(activeParent?.id) &&
            groupPlayDate.invitedParentIds.includes(activeParent.id)))
    )
    .map<ConversationThread>((groupPlayDate) => {
      const messages = groupMessagesByPlayDate[groupPlayDate.id] ?? [];
      const lastMessage = messages[messages.length - 1];
      const isPendingInvite =
        groupPlayDate.visibility === 'private' &&
        groupPlayDate.membership === 'invited' &&
        Boolean(activeParent?.id) &&
        groupPlayDate.invitedParentIds.includes(activeParent.id);
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
        isNewMatch: false,
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

export const getInboxAttentionCount = (threads: ConversationThread[]) =>
  getUnreadConversationThreadCount(threads) + threads.filter((thread) => thread.isNewMatch).length;

const getGroupPlanStatusLabel = ({
  currentFamilyId,
  groupPlayDate,
  parentId,
}: {
  currentFamilyId: string;
  groupPlayDate: GroupPlayDate;
  parentId?: string;
}) => {
  const isPendingInvite =
    groupPlayDate.visibility === 'private' &&
    groupPlayDate.membership === 'invited' &&
    (parentId ? groupPlayDate.invitedParentIds.includes(parentId) : false);
  const isRequested =
    groupPlayDate.visibility === 'public' &&
    groupPlayDate.membership === 'requested' &&
    (parentId ? groupPlayDate.pendingRequestParentIds.includes(parentId) : false);

  if (isPendingInvite) {
    return 'Invitation pending';
  }

  if (groupPlayDate.membership === 'hosting') {
    return groupPlayDate.hostParentId === parentId ? 'Hosting' : 'Shared host access';
  }

  if (groupPlayDate.membership === 'going') {
    return 'Going';
  }

  if (isRequested) {
    return 'Request sent';
  }

  if (groupPlayDate.hostFamilyId === currentFamilyId && groupPlayDate.pendingRequestParentIds.length > 0) {
    return 'Needs review';
  }

  return groupPlayDate.visibility === 'public' ? 'Public plan' : 'Private plan';
};

export const getPlansItems = ({
  currentFamilyId,
  draftProfile,
  groupPlayDates,
}: PlansInput): PlansItem[] => {
  const activeParent = getActiveParent(draftProfile);

  return groupPlayDates
    .flatMap<PlansItem>((groupPlayDate) => {
      const activeParentId = activeParent?.id;
      const isPendingInvite =
        groupPlayDate.visibility === 'private' &&
        groupPlayDate.membership === 'invited' &&
        Boolean(activeParentId) &&
        groupPlayDate.invitedParentIds.includes(activeParentId);
      const isRequested =
        groupPlayDate.visibility === 'public' &&
        groupPlayDate.membership === 'requested' &&
        Boolean(activeParentId) &&
        groupPlayDate.pendingRequestParentIds.includes(activeParentId);
      const canSee =
        Boolean(activeParentId) &&
        groupPlayDate.accessibleParentIds.includes(activeParentId) &&
        (groupPlayDate.membership === 'hosting' || groupPlayDate.membership === 'going' || isPendingInvite || isRequested);

      if (!canSee) {
        return [];
      }

      const hosting = groupPlayDate.hostFamilyId === currentFamilyId;
      const attention = isPendingInvite || (hosting && groupPlayDate.pendingRequestParentIds.length > 0);

      return [
        {
          id: groupPlayDate.id,
          kind: groupPlayDate.visibility,
          title: groupPlayDate.title,
          subtitle: `${groupPlayDate.dateLabel} · ${groupPlayDate.locationName}`,
          statusLabel: getGroupPlanStatusLabel({
            currentFamilyId,
            groupPlayDate,
            parentId: activeParentId,
          }),
          note: groupPlayDate.note,
          route: `/group/${groupPlayDate.id}`,
          attention,
          upcoming: groupPlayDate.membership === 'hosting' || groupPlayDate.membership === 'going',
          hosting,
          sortValue: parseScheduleSortValue(groupPlayDate.dateLabel, groupPlayDate.createdAt),
        },
      ];
    })
    .sort((left, right) => left.sortValue - right.sortValue || left.title.localeCompare(right.title));
};

export const getPlansAttentionCount = ({ currentFamilyId, draftProfile, groupPlayDates }: PlansInput) =>
  getGroupAttentionCount(groupPlayDates, currentFamilyId, draftProfile);

export const getLinkedParentOverview = ({
  currentFamilyId,
  draftProfile,
  matchedParentIdsByParent,
  families,
  messagesByMatch,
  groupPlayDates,
}: LinkedParentOverviewInput): LinkedParentOverview[] => {
  const activeParent = getActiveParent(draftProfile);

  return draftProfile.parents
    .filter((parent) => parent.status === 'active' && parent.id !== activeParent?.id)
    .map((parent) => {
      const matchedParentIds = matchedParentIdsByParent[parent.id] ?? [];

      const mutualMatches = matchedParentIds
        .map((remoteParentId) => {
          const entry = resolveParentEntry(families, remoteParentId);

          if (!entry) {
            return null;
          }

          const matchId = buildDirectMatchId(parent.id, remoteParentId);
          const messages = messagesByMatch[matchId] ?? [];

          if (messages.length > 0) {
            return null;
          }

          return {
            id: matchId,
            name: entry.parent.firstName,
          };
        })
        .filter((item): item is { id: string; name: string } => Boolean(item));

      const directChats = matchedParentIds
        .map((remoteParentId) => {
          const entry = resolveParentEntry(families, remoteParentId);

          if (!entry) {
            return null;
          }

          const matchId = buildDirectMatchId(parent.id, remoteParentId);
          const messages = messagesByMatch[matchId] ?? [];
          const lastActivityAt = messages[messages.length - 1]?.createdAt;

          if (!lastActivityAt) {
            return null;
          }

          return {
            id: matchId,
            name: entry.parent.firstName,
            lastActivityAt,
          };
        })
        .filter((item): item is { id: string; name: string; lastActivityAt: number } => Boolean(item))
        .sort((left, right) => right.lastActivityAt - left.lastActivityAt);

      const plans = groupPlayDates
        .filter(
          (groupPlayDate) =>
            groupPlayDate.accessibleParentIds.includes(parent.id) &&
            groupPlayDate.membership !== 'none' &&
            (groupPlayDate.membership !== 'invited' || groupPlayDate.invitedParentIds.includes(parent.id))
        )
        .map((groupPlayDate) => ({
          id: groupPlayDate.id,
          title: groupPlayDate.title,
          status: getGroupPlanStatusLabel({
            currentFamilyId,
            groupPlayDate,
            parentId: parent.id,
          }),
          sortValue: parseScheduleSortValue(groupPlayDate.dateLabel, groupPlayDate.createdAt),
        }))
        .sort((left, right) => left.sortValue - right.sortValue || left.title.localeCompare(right.title))
        .map(({ sortValue: _sortValue, ...plan }) => plan);

      return {
        parentId: parent.id,
        parentName: parent.firstName,
        mutualMatches,
        directChats,
        plans,
      };
    });
};
