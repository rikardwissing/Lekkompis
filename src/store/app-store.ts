import { create } from 'zustand';
import { getAllChildInterests } from '@/utils/birthdays';

export type Availability = 'Weekends' | 'Weekday afternoons' | 'Flexible mornings';

export type ChildProfile = {
  id: string;
  name: string;
  birthDate: string;
  interests: string[];
};

export type ParentRole = 'primary' | 'coparent';
export type ParentStatus = 'active' | 'pending';

export type ParentAccount = {
  id: string;
  firstName: string;
  avatarUrl: string;
  birthDate?: string;
  interests: string[];
  languages: string[];
  role: ParentRole;
  status: ParentStatus;
};

type ParentContainer = {
  parents: ParentAccount[];
  primaryParentId: string;
};

export type Family = {
  id: string;
  parents: ParentAccount[];
  primaryParentId: string;
  photoUrls: string[];
  area: string;
  summary: string;
  children: ChildProfile[];
  shared: string[];
  familyVibe: string[];
  meetupNote: string;
  availability: Availability[];
};

export type MessageKind = 'message' | 'event';

export type Message = {
  id: string;
  senderFamilyId: string;
  senderParentId: string;
  kind?: MessageKind;
  body?: string;
  photoUrls?: string[];
  createdAt: number;
};

export type GroupPlayDateVisibility = 'private' | 'public';
export type GroupPlayDateMembership = 'hosting' | 'going' | 'invited' | 'requested' | 'none';

export type GroupPlayDate = {
  id: string;
  title: string;
  area: string;
  locationName: string;
  dateLabel: string;
  timeLabel: string;
  ageRange: string;
  activityTags: string[];
  vibeTags: string[];
  note: string;
  capacity: number;
  hostFamilyId: string;
  visibility: GroupPlayDateVisibility;
  membership: GroupPlayDateMembership;
  attendeeFamilyIds: string[];
  invitedFamilyIds: string[];
  includedParentIds: string[];
  pendingRequestFamilyIds: string[];
  createdAt: number;
};

export type CoParentInvite = {
  id: string;
  code: string;
  createdAt: number;
  shareUrl: string;
};

export type DraftProfile = {
  parents: ParentAccount[];
  primaryParentId: string;
  activeParentId: string;
  photoUrls: string[];
  area: string;
  bio: string;
  familyVibe: string[];
  children: ChildProfile[];
};

export type DiscoveryFilters = {
  area: string;
  availability: Availability | 'Any';
  selectedInterests: string[];
  similarAgeOnly: boolean;
};

export type PublicEventFilters = {
  area: string;
  ageRange: string;
  selectedActivityTags: string[];
};

export type CreateGroupPlayDateInput = {
  title: string;
  area: string;
  locationName: string;
  dateLabel: string;
  timeLabel: string;
  ageRange: string;
  activityTags: string[];
  vibeTags: string[];
  note: string;
  capacity: number;
  visibility: GroupPlayDateVisibility;
  invitedFamilyIds: string[];
};

export type ConversationThread = {
  id: string;
  kind: 'direct' | 'group';
  title: string;
  subtitle: string;
  lastMessagePreview: string;
  lastActivityAt: number;
  route: string;
  badgeLabel: string;
  badgeTone: 'direct' | 'group' | 'pending';
  avatarNames: string[];
  avatarUrls: string[];
  participantCount: number;
  unreadCount: number;
};

type ParentFamilyIdsByParent = Record<string, string[]>;
type ConversationLastSeenByParent = Record<string, Record<string, number>>;

type AppState = {
  currentFamilyId: string;
  draftProfile: DraftProfile;
  coParentInvite: CoParentInvite | null;
  families: Family[];
  likedFamilyIdsByParent: ParentFamilyIdsByParent;
  passedFamilyIdsByParent: ParentFamilyIdsByParent;
  matchedFamilyIdsByParent: ParentFamilyIdsByParent;
  directConversationLastSeenAtByParent: ConversationLastSeenByParent;
  groupConversationLastSeenAtByParent: Record<string, Record<string, number>>;
  messagesByMatch: Record<string, Message[]>;
  groupMessagesByPlayDate: Record<string, Message[]>;
  groupPlayDates: GroupPlayDate[];
  discoveryFilters: DiscoveryFilters;
  publicEventFilters: PublicEventFilters;
  updateDraftProfile: (patch: Partial<DraftProfile>) => void;
  updateDraftParent: (parentId: string, patch: Partial<ParentAccount>) => void;
  toggleFamilyVibe: (value: string) => void;
  toggleParentInterest: (value: string) => void;
  toggleLanguage: (value: string) => void;
  setActiveParent: (parentId: string) => void;
  createCoParentInvite: () => void;
  cancelCoParentInvite: () => void;
  acceptPendingCoParentInvite: () => void;
  unlinkCoParent: (parentId: string) => void;
  addDraftChild: () => void;
  removeDraftChild: (childId: string) => void;
  updateDraftChild: (childId: string, patch: Partial<ChildProfile>) => void;
  toggleDraftChildInterest: (childId: string, value: string) => void;
  setDiscoveryArea: (area: string) => void;
  setDiscoveryAvailability: (availability: DiscoveryFilters['availability']) => void;
  toggleDiscoveryInterest: (value: string) => void;
  toggleDiscoverySimilarAge: () => void;
  resetDiscoveryFilters: () => void;
  setPublicEventArea: (area: string) => void;
  setPublicEventAgeRange: (ageRange: string) => void;
  togglePublicEventActivity: (value: string) => void;
  resetPublicEventFilters: () => void;
  resetDemoState: () => void;
  likeFamily: (id: string) => void;
  passFamily: (id: string) => void;
  markDirectConversationRead: (conversationId: string, seenAt?: number) => void;
  markGroupConversationRead: (conversationId: string, seenAt?: number) => void;
  sendMessage: (matchId: string, body: string, photoUrls?: string[]) => void;
  sendGroupMessage: (groupId: string, body: string, photoUrls?: string[]) => void;
  respondToGroupPlayDateInvite: (id: string, response: 'going' | 'not-going') => void;
  addLinkedParentToGroup: (id: string, parentId: string) => void;
  requestToJoinGroupPlayDate: (id: string) => void;
  approveGroupJoinRequest: (id: string, familyId: string) => void;
  declineGroupJoinRequest: (id: string, familyId: string) => void;
  createGroupPlayDate: (input: CreateGroupPlayDateInput) => string;
};

const CURRENT_FAMILY_ID = 'anna';
const CURRENT_PRIMARY_PARENT_ID = 'anna-primary';
const FIXTURE_START = Date.parse('2026-03-22T09:00:00Z');
const DEMO_COPARENT: ParentAccount = {
  id: 'anna-coparent',
  firstName: 'Lukas',
  avatarUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
  birthDate: '1989-11-02',
  interests: ['Coffee walks', 'Cooking', 'Hiking'],
  languages: ['Swedish', 'English'],
  role: 'coparent',
  status: 'active',
};

export const ANY_PUBLIC_EVENT_AGE = 'Any age';

const atMinute = (minuteOffset: number) => FIXTURE_START + minuteOffset * 60_000;

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'group';

const buildInterestDefaults = (children: ChildProfile[] = []) => getAllChildInterests(children).slice(0, 2);

const createChild = (overrides: Partial<ChildProfile> = {}): ChildProfile => ({
  id: overrides.id ?? `child-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: overrides.name ?? '',
  birthDate: overrides.birthDate ?? '',
  interests: overrides.interests ?? [],
});

const createParent = (overrides: Partial<ParentAccount> = {}): ParentAccount => ({
  id: overrides.id ?? `parent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  firstName: overrides.firstName ?? '',
  avatarUrl: overrides.avatarUrl ?? '',
  birthDate: overrides.birthDate,
  interests: overrides.interests ?? [],
  languages: overrides.languages ?? [],
  role: overrides.role ?? 'coparent',
  status: overrides.status ?? 'active',
});

const getParentByIdInternal = (parents: ParentAccount[], parentId: string) =>
  parents.find((parent) => parent.id === parentId);

const getPrimaryParentInternal = <T extends ParentContainer>(value: T) =>
  getParentByIdInternal(value.parents, value.primaryParentId) ?? value.parents[0];

const getActiveParentInternal = (draftProfile: DraftProfile) =>
  getParentByIdInternal(draftProfile.parents, draftProfile.activeParentId) ?? getPrimaryParentInternal(draftProfile);

const isPrimaryParentSession = (draftProfile: DraftProfile) =>
  getActiveParentInternal(draftProfile)?.id === draftProfile.primaryParentId;

const updateParentList = (
  parents: ParentAccount[],
  parentId: string,
  updater: (parent: ParentAccount) => ParentAccount
) =>
  parents.map((parent) => (parent.id === parentId ? updater(parent) : parent));

const toggle = (values: string[], value: string) =>
  values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];

const buildInviteCode = () => `FAM-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const getFamilyIdsForParentInternal = (valuesByParent: ParentFamilyIdsByParent, parentId: string) =>
  valuesByParent[parentId] ?? [];

const getDirectSeenForParentInternal = (valuesByParent: ConversationLastSeenByParent, parentId: string) =>
  valuesByParent[parentId] ?? {};

const createGroupEventMessage = ({
  body,
  createdAt,
  groupId,
  senderFamilyId,
  senderParentId,
}: {
  body: string;
  createdAt: number;
  groupId: string;
  senderFamilyId: string;
  senderParentId: string;
}): Message => ({
  id: `${groupId}-event-${createdAt}`,
  senderFamilyId,
  senderParentId,
  kind: 'event',
  body,
  createdAt,
});

const defaultDraftProfile: DraftProfile = {
  parents: [
    createParent({
      id: CURRENT_PRIMARY_PARENT_ID,
      firstName: 'Anna',
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      birthDate: '1991-05-18',
      interests: ['Coffee walks', 'Playground hangs', 'Baking'],
      languages: ['Swedish', 'English'],
      role: 'primary',
      status: 'active',
    }),
  ],
  primaryParentId: CURRENT_PRIMARY_PARENT_ID,
  activeParentId: CURRENT_PRIMARY_PARENT_ID,
  photoUrls: [
    'https://picsum.photos/seed/anna-playground/600/600',
    'https://picsum.photos/seed/anna-coffee/600/600',
    'https://picsum.photos/seed/anna-park/600/600',
  ],
  area: 'Vasastan',
  bio: 'Mamma to Leo and Mila. Looking for simple weekend meetups nearby, and parents we would genuinely enjoy seeing again.',
  familyVibe: ['Weekend meetups', 'Public place first', 'Outdoor-friendly'],
  children: [
    createChild({
      id: 'anna-leo',
      name: 'Leo',
      birthDate: '2021-04-05',
      interests: ['Dinosaurs', 'Playgrounds', 'Drawing'],
    }),
    createChild({
      id: 'anna-mila',
      name: 'Mila',
      birthDate: '2023-02-18',
      interests: ['Animals', 'Books', 'Playgrounds'],
    }),
  ],
};

const defaultFamilies: Family[] = [
  {
    id: 'sara',
    primaryParentId: 'sara-primary',
    parents: [
      createParent({
        id: 'sara-primary',
        firstName: 'Sara',
        avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
        birthDate: '1990-04-12',
        interests: ['Coffee walks', 'Museum outings', 'Playground hangs'],
        languages: ['Swedish', 'English'],
        role: 'primary',
        status: 'active',
      }),
    ],
    photoUrls: [
      'https://picsum.photos/seed/sara-1/600/600',
      'https://picsum.photos/seed/sara-2/600/600',
      'https://picsum.photos/seed/sara-3/600/600',
    ],
    area: 'Vasastan',
    summary: 'Parent to Maja. Looking for easy weekend outdoor playdates and parent company that feels natural too.',
    children: [
      createChild({
        id: 'sara-maja',
        name: 'Maja',
        birthDate: '2021-03-29',
        interests: ['Playgrounds', 'Drawing', 'Crafts'],
      }),
    ],
    shared: ['Same area', 'Playgrounds', 'Weekend meetups'],
    familyVibe: ['Warm', 'Outdoor-friendly', 'Easygoing'],
    meetupNote: 'Usually starts with a public playground meetup and coffee nearby.',
    availability: ['Weekends', 'Flexible mornings'],
  },
  {
    id: 'fatima',
    primaryParentId: 'fatima-primary',
    parents: [
      createParent({
        id: 'fatima-primary',
        firstName: 'Fatima',
        avatarUrl: 'https://randomuser.me/api/portraits/women/79.jpg',
        interests: ['Coffee walks', 'Cooking', 'Board games'],
        languages: ['English', 'Arabic', 'Swedish'],
        role: 'primary',
        status: 'active',
      }),
    ],
    photoUrls: [
      'https://picsum.photos/seed/fatima-1/600/600',
      'https://picsum.photos/seed/fatima-2/600/600',
      'https://picsum.photos/seed/fatima-3/600/600',
    ],
    area: 'Södermalm',
    summary: 'Parent to Nora. Loves calm cafe-and-park mornings and easy conversation with other international families.',
    children: [
      createChild({
        id: 'fatima-nora',
        name: 'Nora',
        birthDate: '2022-11-02',
        interests: ['Animals', 'Books', 'Playgrounds'],
      }),
    ],
    shared: ['Animals', 'Public-place first'],
    familyVibe: ['Calm', 'Public-place first', 'Morning plans'],
    meetupNote: 'Prefers quiet first meetings and a short walk after.',
    availability: ['Flexible mornings'],
  },
  {
    id: 'johan',
    primaryParentId: 'johan-primary',
    parents: [
      createParent({
        id: 'johan-primary',
        firstName: 'Johan',
        avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        interests: ['Hiking', 'Fitness', 'Coffee walks'],
        languages: ['Swedish', 'English'],
        role: 'primary',
        status: 'active',
      }),
    ],
    photoUrls: [
      'https://picsum.photos/seed/johan-1/600/600',
      'https://picsum.photos/seed/johan-2/600/600',
      'https://picsum.photos/seed/johan-3/600/600',
    ],
    area: 'Vasastan',
    summary: 'Parent to Elis and Alba. Outdoor family, often free on Sundays, and hoping to click with both kids and parents.',
    children: [
      createChild({
        id: 'johan-elis',
        name: 'Elis',
        birthDate: '2020-09-18',
        interests: ['Football', 'Playgrounds', 'Animals'],
      }),
      createChild({
        id: 'johan-alba',
        name: 'Alba',
        birthDate: '2023-03-10',
        interests: ['Animals', 'Playgrounds', 'Books'],
      }),
    ],
    shared: ['Nearby', 'Outdoor play'],
    familyVibe: ['Energetic', 'Weekend plans', 'Playground regular'],
    meetupNote: 'Happy to meet at Vasaparken or another public playground.',
    availability: ['Weekends'],
  },
  {
    id: 'elin',
    primaryParentId: 'elin-primary',
    parents: [
      createParent({
        id: 'elin-primary',
        firstName: 'Elin',
        avatarUrl: 'https://randomuser.me/api/portraits/women/21.jpg',
        interests: ['Museum outings', 'Baking', 'Board games'],
        languages: ['Swedish', 'English', 'German'],
        role: 'primary',
        status: 'active',
      }),
    ],
    photoUrls: [
      'https://picsum.photos/seed/elin-1/600/600',
      'https://picsum.photos/seed/elin-2/600/600',
      'https://picsum.photos/seed/elin-3/600/600',
    ],
    area: 'Östermalm',
    summary: 'Parent to Liv. New in the area and looking for local family friends with shared parent interests too.',
    children: [
      createChild({
        id: 'elin-liv',
        name: 'Liv',
        birthDate: '2021-07-09',
        interests: ['Drawing', 'Books', 'Crafts'],
      }),
    ],
    shared: ['Drawing', 'Baking'],
    familyVibe: ['New in area', 'Warm', 'Weekday afternoons'],
    meetupNote: 'Often free after preschool and likes simple neighborhood meetups.',
    availability: ['Weekday afternoons'],
  },
];

const initialMessages: Record<string, Message[]> = {
  'sara-match': [
    {
      id: '1',
      senderFamilyId: 'sara',
      senderParentId: 'sara-primary',
      body: 'Hej! Nice to connect. Would Saturday morning work for a playground meetup?',
      createdAt: atMinute(6),
    },
    {
      id: '2',
      senderFamilyId: CURRENT_FAMILY_ID,
      senderParentId: CURRENT_PRIMARY_PARENT_ID,
      body: 'Yes, that sounds perfect. We usually go to Vasaparken around 10.',
      createdAt: atMinute(10),
    },
    {
      id: '3',
      senderFamilyId: 'sara',
      senderParentId: 'sara-primary',
      body: 'Lovely - public place first works great for us too. Sharing the playground corner we usually start at.',
      photoUrls: ['https://picsum.photos/seed/vasaparken-chat/720/480'],
      createdAt: atMinute(13),
    },
  ],
};

const initialGroupMessages: Record<string, Message[]> = {
  'animal-zoo-sunday': [
    {
      id: 'g1',
      senderFamilyId: CURRENT_FAMILY_ID,
      senderParentId: CURRENT_PRIMARY_PARENT_ID,
      body: 'Happy this group came together. Let’s keep it simple and meet by the hill entrance.',
      createdAt: atMinute(18),
    },
    {
      id: 'g2',
      senderFamilyId: 'sara',
      senderParentId: 'sara-primary',
      body: 'Perfect for us. Maja will bring her animal cards.',
      createdAt: atMinute(21),
    },
    {
      id: 'g3',
      senderFamilyId: 'johan',
      senderParentId: 'johan-primary',
      body: 'Here is the picnic spot we usually use if the weather stays nice.',
      photoUrls: ['https://picsum.photos/seed/group-picnic-spot/720/480'],
      createdAt: atMinute(24),
    },
  ],
  'vasaparken-saturday': [
    {
      id: 'g4',
      senderFamilyId: 'sara',
      senderParentId: 'sara-primary',
      body: 'If you join, we usually start near the sand area so the kids can ease into it.',
      photoUrls: ['https://picsum.photos/seed/group-sand-area/720/480'],
      createdAt: atMinute(8),
    },
  ],
};

const initialGroupPlayDates: GroupPlayDate[] = [
  {
    id: 'vasaparken-saturday',
    title: 'Saturday playground circle',
    area: 'Vasastan',
    locationName: 'Vasaparken playground',
    dateLabel: 'Sat 29 Mar',
    timeLabel: '10:00-11:30',
    ageRange: '3-5 years',
    activityTags: ['Playgrounds', 'Scooters'],
    vibeTags: ['Public place first', 'Outdoor-friendly'],
    note: 'Sara is hosting a low-key first meetup with coffee after if the kids click.',
    capacity: 4,
    hostFamilyId: 'sara',
    visibility: 'private',
    membership: 'invited',
    attendeeFamilyIds: ['sara'],
    invitedFamilyIds: [CURRENT_FAMILY_ID, 'johan'],
    includedParentIds: [CURRENT_PRIMARY_PARENT_ID],
    pendingRequestFamilyIds: [],
    createdAt: atMinute(4),
  },
  {
    id: 'animal-zoo-sunday',
    title: 'Sunday animal-themed park meetup',
    area: 'Vasastan',
    locationName: 'Observatorielunden',
    dateLabel: 'Sun 30 Mar',
    timeLabel: '09:30-11:00',
    ageRange: '4-6 years',
    activityTags: ['Animals', 'Picnic'],
    vibeTags: ['Weekend meetups', 'Bring snacks'],
    note: 'You are hosting this one for nearby matches who enjoy easy Sunday mornings.',
    capacity: 3,
    hostFamilyId: CURRENT_FAMILY_ID,
    visibility: 'public',
    membership: 'hosting',
    attendeeFamilyIds: [CURRENT_FAMILY_ID, 'sara'],
    invitedFamilyIds: [],
    includedParentIds: [CURRENT_PRIMARY_PARENT_ID],
    pendingRequestFamilyIds: ['johan'],
    createdAt: atMinute(16),
  },
  {
    id: 'story-garden-sunday',
    title: 'Sunday story garden meetup',
    area: 'Vasastan',
    locationName: 'Bellevue park garden',
    dateLabel: 'Sun 6 Apr',
    timeLabel: '10:30-12:00',
    ageRange: '3-5 years',
    activityTags: ['Books', 'Picnic'],
    vibeTags: ['Calm pace', 'Public place first'],
    note: 'A relaxed public meetup with blankets, picture books, and a simple snack stop after if the kids are still happy.',
    capacity: 4,
    hostFamilyId: 'sara',
    visibility: 'public',
    membership: 'none',
    attendeeFamilyIds: ['sara'],
    invitedFamilyIds: [],
    includedParentIds: [],
    pendingRequestFamilyIds: [],
    createdAt: atMinute(28),
  },
  {
    id: 'museum-crafts-saturday',
    title: 'Saturday museum craft hour',
    area: 'Östermalm',
    locationName: 'Humlegarden craft table',
    dateLabel: 'Sat 12 Apr',
    timeLabel: '14:00-15:30',
    ageRange: '4-6 years',
    activityTags: ['Crafts', 'Drawing'],
    vibeTags: ['Short first meetup', 'Public place first'],
    note: 'Already a full public event built around a short craft session and a quick park stop after.',
    capacity: 2,
    hostFamilyId: 'elin',
    visibility: 'public',
    membership: 'none',
    attendeeFamilyIds: ['elin', 'fatima'],
    invitedFamilyIds: [],
    includedParentIds: [],
    pendingRequestFamilyIds: [],
    createdAt: atMinute(32),
  },
];

const defaultDiscoveryFilters = (draftProfile: DraftProfile): DiscoveryFilters => ({
  area: draftProfile.area,
  availability: 'Any',
  selectedInterests: buildInterestDefaults(draftProfile.children),
  similarAgeOnly: false,
});

const defaultPublicEventFilters = (draftProfile: DraftProfile): PublicEventFilters => ({
  area: draftProfile.area,
  ageRange: ANY_PUBLIC_EVENT_AGE,
  selectedActivityTags: [],
});

const defaultMatchedFamilyIds = ['sara'];
const defaultLikedFamilyIdsByParent: ParentFamilyIdsByParent = {
  [CURRENT_PRIMARY_PARENT_ID]: [],
};
const defaultPassedFamilyIdsByParent: ParentFamilyIdsByParent = {
  [CURRENT_PRIMARY_PARENT_ID]: [],
};
const defaultMatchedFamilyIdsByParent: ParentFamilyIdsByParent = {
  [CURRENT_PRIMARY_PARENT_ID]: defaultMatchedFamilyIds,
};
const initialDirectConversationLastSeenAtByParent: ConversationLastSeenByParent = {
  [CURRENT_PRIMARY_PARENT_ID]: {
    'sara-match': atMinute(10),
  },
};
const initialGroupConversationLastSeenAtByParent: Record<string, Record<string, number>> = {
  [CURRENT_PRIMARY_PARENT_ID]: {
    'animal-zoo-sunday': atMinute(18),
  },
};

export const getParentById = (parents: ParentAccount[], parentId: string) =>
  getParentByIdInternal(parents, parentId);

export const getPrimaryParent = <T extends ParentContainer>(value: T) => getPrimaryParentInternal(value);

export const getActiveParent = (draftProfile: DraftProfile) => getActiveParentInternal(draftProfile);

export const isPrimaryActiveParent = (draftProfile: DraftProfile) => isPrimaryParentSession(draftProfile);

export const getActiveLikedFamilyIds = (
  draftProfile: DraftProfile,
  likedFamilyIdsByParent: ParentFamilyIdsByParent
) => {
  const activeParent = getActiveParentInternal(draftProfile);
  return activeParent ? getFamilyIdsForParentInternal(likedFamilyIdsByParent, activeParent.id) : [];
};

export const getActivePassedFamilyIds = (
  draftProfile: DraftProfile,
  passedFamilyIdsByParent: ParentFamilyIdsByParent
) => {
  const activeParent = getActiveParentInternal(draftProfile);
  return activeParent ? getFamilyIdsForParentInternal(passedFamilyIdsByParent, activeParent.id) : [];
};

export const getActiveMatchedFamilyIds = (
  draftProfile: DraftProfile,
  matchedFamilyIdsByParent: ParentFamilyIdsByParent
) => {
  const activeParent = getActiveParentInternal(draftProfile);
  return activeParent ? getFamilyIdsForParentInternal(matchedFamilyIdsByParent, activeParent.id) : [];
};

export const getLinkedParentMatchedFamilyIds = (
  draftProfile: DraftProfile,
  matchedFamilyIdsByParent: ParentFamilyIdsByParent
) => {
  const activeParent = getActiveParentInternal(draftProfile);
  const activeParentId = activeParent?.id;
  const nextValues = new Set<string>();

  draftProfile.parents.forEach((parent) => {
    if (parent.id === activeParentId || parent.status !== 'active') {
      return;
    }

    getFamilyIdsForParentInternal(matchedFamilyIdsByParent, parent.id).forEach((familyId) => {
      nextValues.add(familyId);
    });
  });

  return [...nextValues];
};

export const getDirectConversationLastSeenAtForActiveParent = (
  draftProfile: DraftProfile,
  directConversationLastSeenAtByParent: ConversationLastSeenByParent
) => {
  const activeParent = getActiveParentInternal(draftProfile);
  return activeParent ? getDirectSeenForParentInternal(directConversationLastSeenAtByParent, activeParent.id) : {};
};

export const useAppStore = create<AppState>((set) => ({
  currentFamilyId: CURRENT_FAMILY_ID,
  draftProfile: defaultDraftProfile,
  coParentInvite: null,
  families: defaultFamilies,
  likedFamilyIdsByParent: defaultLikedFamilyIdsByParent,
  passedFamilyIdsByParent: defaultPassedFamilyIdsByParent,
  matchedFamilyIdsByParent: defaultMatchedFamilyIdsByParent,
  directConversationLastSeenAtByParent: initialDirectConversationLastSeenAtByParent,
  groupConversationLastSeenAtByParent: initialGroupConversationLastSeenAtByParent,
  messagesByMatch: initialMessages,
  groupMessagesByPlayDate: initialGroupMessages,
  groupPlayDates: initialGroupPlayDates,
  discoveryFilters: defaultDiscoveryFilters(defaultDraftProfile),
  publicEventFilters: defaultPublicEventFilters(defaultDraftProfile),
  updateDraftProfile: (patch) =>
    set((state) => {
      const nextDraft = { ...state.draftProfile, ...patch };
      return {
        draftProfile: nextDraft,
        discoveryFilters:
          patch.area !== undefined || patch.children !== undefined
            ? {
                ...state.discoveryFilters,
                area: patch.area ?? state.discoveryFilters.area,
                selectedInterests: patch.children
                  ? buildInterestDefaults(nextDraft.children ?? [])
                  : state.discoveryFilters.selectedInterests,
              }
            : state.discoveryFilters,
        publicEventFilters:
          patch.area !== undefined
            ? {
                ...state.publicEventFilters,
                area: patch.area ?? state.publicEventFilters.area,
              }
            : state.publicEventFilters,
      };
    }),
  updateDraftParent: (parentId, patch) =>
    set((state) => ({
      draftProfile: {
        ...state.draftProfile,
        parents: updateParentList(state.draftProfile.parents, parentId, (parent) => ({
          ...parent,
          ...patch,
          interests: patch.interests ?? parent.interests,
          languages: patch.languages ?? parent.languages,
        })),
      },
    })),
  toggleFamilyVibe: (value) =>
    set((state) => ({
      draftProfile: {
        ...state.draftProfile,
        familyVibe: toggle(state.draftProfile.familyVibe, value),
      },
    })),
  toggleParentInterest: (value) =>
    set((state) => ({
      draftProfile: {
        ...state.draftProfile,
        parents: updateParentList(state.draftProfile.parents, state.draftProfile.primaryParentId, (parent) => ({
          ...parent,
          interests: toggle(parent.interests, value),
        })),
      },
    })),
  toggleLanguage: (value) =>
    set((state) => ({
      draftProfile: {
        ...state.draftProfile,
        parents: updateParentList(state.draftProfile.parents, state.draftProfile.primaryParentId, (parent) => ({
          ...parent,
          languages: toggle(parent.languages, value),
        })),
      },
    })),
  setActiveParent: (parentId) =>
    set((state) => {
      const nextParent = getParentByIdInternal(state.draftProfile.parents, parentId);
      if (!nextParent || nextParent.status !== 'active') {
        return state;
      }

      return {
        draftProfile: {
          ...state.draftProfile,
          activeParentId: parentId,
        },
      };
    }),
  createCoParentInvite: () =>
    set((state) => {
      if (!isPrimaryParentSession(state.draftProfile)) {
        return state;
      }

      const hasLinkedCoParent = state.draftProfile.parents.some((parent) => parent.role === 'coparent');
      if (hasLinkedCoParent) {
        return state;
      }

      const createdAt = Date.now();
      const code = buildInviteCode();

      return {
        coParentInvite: {
          id: `coparent-invite-${createdAt}`,
          code,
          createdAt,
          shareUrl: `lekkompis://family/${state.currentFamilyId}/coparent/${code}`,
        },
      };
    }),
  cancelCoParentInvite: () =>
    set(() => ({
      coParentInvite: null,
    })),
  acceptPendingCoParentInvite: () =>
    set((state) => {
      if (!state.coParentInvite) {
        return state;
      }

      const hasLinkedCoParent = state.draftProfile.parents.some((parent) => parent.role === 'coparent');
      if (hasLinkedCoParent) {
        return state;
      }

      const nextParents = [...state.draftProfile.parents, DEMO_COPARENT];
      return {
        coParentInvite: null,
        likedFamilyIdsByParent: {
          ...state.likedFamilyIdsByParent,
          [DEMO_COPARENT.id]: state.likedFamilyIdsByParent[DEMO_COPARENT.id] ?? [],
        },
        passedFamilyIdsByParent: {
          ...state.passedFamilyIdsByParent,
          [DEMO_COPARENT.id]: state.passedFamilyIdsByParent[DEMO_COPARENT.id] ?? [],
        },
        matchedFamilyIdsByParent: {
          ...state.matchedFamilyIdsByParent,
          [DEMO_COPARENT.id]: state.matchedFamilyIdsByParent[DEMO_COPARENT.id] ?? [],
        },
        directConversationLastSeenAtByParent: {
          ...state.directConversationLastSeenAtByParent,
          [DEMO_COPARENT.id]: state.directConversationLastSeenAtByParent[DEMO_COPARENT.id] ?? {},
        },
        draftProfile: {
          ...state.draftProfile,
          parents: nextParents,
          activeParentId: DEMO_COPARENT.id,
        },
      };
    }),
  unlinkCoParent: (parentId) =>
    set((state) => {
      const parent = getParentByIdInternal(state.draftProfile.parents, parentId);
      if (!parent || parent.role !== 'coparent') {
        return state;
      }

      const nextParents = state.draftProfile.parents.filter((entry) => entry.id !== parentId);
      const nextGroupSeenByParent = { ...state.groupConversationLastSeenAtByParent };
      const nextDirectSeenByParent = { ...state.directConversationLastSeenAtByParent };
      const nextLikedByParent = { ...state.likedFamilyIdsByParent };
      const nextPassedByParent = { ...state.passedFamilyIdsByParent };
      const nextMatchedByParent = { ...state.matchedFamilyIdsByParent };
      delete nextGroupSeenByParent[parentId];
      delete nextDirectSeenByParent[parentId];
      delete nextLikedByParent[parentId];
      delete nextPassedByParent[parentId];
      delete nextMatchedByParent[parentId];

      return {
        likedFamilyIdsByParent: nextLikedByParent,
        passedFamilyIdsByParent: nextPassedByParent,
        matchedFamilyIdsByParent: nextMatchedByParent,
        directConversationLastSeenAtByParent: nextDirectSeenByParent,
        groupConversationLastSeenAtByParent: nextGroupSeenByParent,
        draftProfile: {
          ...state.draftProfile,
          parents: nextParents,
          activeParentId:
            state.draftProfile.activeParentId === parentId
              ? state.draftProfile.primaryParentId
              : state.draftProfile.activeParentId,
        },
      };
    }),
  addDraftChild: () =>
    set((state) => {
      const children = [...(state.draftProfile.children ?? []), createChild()];
      return {
        draftProfile: {
          ...state.draftProfile,
          children,
        },
        discoveryFilters: {
          ...state.discoveryFilters,
          selectedInterests: buildInterestDefaults(children),
        },
      };
    }),
  removeDraftChild: (childId) =>
    set((state) => {
      const currentChildren = state.draftProfile.children ?? [];

      if (currentChildren.length <= 1) {
        return state;
      }

      const children = currentChildren.filter((child) => child.id !== childId);
      return {
        draftProfile: {
          ...state.draftProfile,
          children,
        },
        discoveryFilters: {
          ...state.discoveryFilters,
          selectedInterests: buildInterestDefaults(children),
        },
      };
    }),
  updateDraftChild: (childId, patch) =>
    set((state) => {
      const children = (state.draftProfile.children ?? []).map((child) =>
        child.id === childId
          ? {
              ...child,
              ...patch,
              interests: patch.interests ?? child.interests,
            }
          : child
      );

      return {
        draftProfile: {
          ...state.draftProfile,
          children,
        },
        discoveryFilters: {
          ...state.discoveryFilters,
          selectedInterests: buildInterestDefaults(children),
        },
      };
    }),
  toggleDraftChildInterest: (childId, value) =>
    set((state) => {
      const children = (state.draftProfile.children ?? []).map((child) =>
        child.id === childId
          ? {
              ...child,
              interests: toggle(child.interests, value),
            }
          : child
      );

      return {
        draftProfile: {
          ...state.draftProfile,
          children,
        },
        discoveryFilters: {
          ...state.discoveryFilters,
          selectedInterests: buildInterestDefaults(children),
        },
      };
    }),
  setDiscoveryArea: (area) =>
    set((state) => ({
      discoveryFilters: {
        ...state.discoveryFilters,
        area,
      },
    })),
  setDiscoveryAvailability: (availability) =>
    set((state) => ({
      discoveryFilters: {
        ...state.discoveryFilters,
        availability,
      },
    })),
  toggleDiscoveryInterest: (value) =>
    set((state) => ({
      discoveryFilters: {
        ...state.discoveryFilters,
        selectedInterests: toggle(state.discoveryFilters.selectedInterests, value),
      },
    })),
  toggleDiscoverySimilarAge: () =>
    set((state) => ({
      discoveryFilters: {
        ...state.discoveryFilters,
        similarAgeOnly: !state.discoveryFilters.similarAgeOnly,
      },
    })),
  resetDiscoveryFilters: () =>
    set((state) => ({
      discoveryFilters: defaultDiscoveryFilters(state.draftProfile),
    })),
  setPublicEventArea: (area) =>
    set((state) => ({
      publicEventFilters: {
        ...state.publicEventFilters,
        area,
      },
    })),
  setPublicEventAgeRange: (ageRange) =>
    set((state) => ({
      publicEventFilters: {
        ...state.publicEventFilters,
        ageRange,
      },
    })),
  togglePublicEventActivity: (value) =>
    set((state) => ({
      publicEventFilters: {
        ...state.publicEventFilters,
        selectedActivityTags: toggle(state.publicEventFilters.selectedActivityTags, value),
      },
    })),
  resetPublicEventFilters: () =>
    set((state) => ({
      publicEventFilters: defaultPublicEventFilters(state.draftProfile),
    })),
  resetDemoState: () =>
    set(() => ({
      currentFamilyId: CURRENT_FAMILY_ID,
      draftProfile: defaultDraftProfile,
      coParentInvite: null,
      likedFamilyIdsByParent: defaultLikedFamilyIdsByParent,
      passedFamilyIdsByParent: defaultPassedFamilyIdsByParent,
      matchedFamilyIdsByParent: defaultMatchedFamilyIdsByParent,
      directConversationLastSeenAtByParent: initialDirectConversationLastSeenAtByParent,
      groupConversationLastSeenAtByParent: initialGroupConversationLastSeenAtByParent,
      messagesByMatch: initialMessages,
      groupMessagesByPlayDate: initialGroupMessages,
      groupPlayDates: initialGroupPlayDates,
      discoveryFilters: defaultDiscoveryFilters(defaultDraftProfile),
      publicEventFilters: defaultPublicEventFilters(defaultDraftProfile),
    })),
  likeFamily: (id) =>
    set((state) => {
      const activeParent = getActiveParentInternal(state.draftProfile);

      if (!activeParent) {
        return state;
      }

      const activeLikedFamilyIds = getFamilyIdsForParentInternal(state.likedFamilyIdsByParent, activeParent.id);
      const activeMatchedFamilyIds = getFamilyIdsForParentInternal(state.matchedFamilyIdsByParent, activeParent.id);
      const alreadyMatchedByAnotherLinkedParent = state.draftProfile.parents.some(
        (parent) =>
          parent.id !== activeParent.id &&
          parent.status === 'active' &&
          getFamilyIdsForParentInternal(state.matchedFamilyIdsByParent, parent.id).includes(id)
      );
      const shouldMatch =
        alreadyMatchedByAnotherLinkedParent || (id === 'sara' && !activeMatchedFamilyIds.includes(id));

      return {
        likedFamilyIdsByParent: {
          ...state.likedFamilyIdsByParent,
          [activeParent.id]: activeLikedFamilyIds.includes(id) ? activeLikedFamilyIds : [...activeLikedFamilyIds, id],
        },
        matchedFamilyIdsByParent: {
          ...state.matchedFamilyIdsByParent,
          [activeParent.id]: shouldMatch ? unique([...activeMatchedFamilyIds, id]) : activeMatchedFamilyIds,
        },
      };
    }),
  passFamily: (id) =>
    set((state) => {
      const activeParent = getActiveParentInternal(state.draftProfile);

      if (!activeParent) {
        return state;
      }

      const activePassedFamilyIds = getFamilyIdsForParentInternal(state.passedFamilyIdsByParent, activeParent.id);

      return {
        passedFamilyIdsByParent: {
          ...state.passedFamilyIdsByParent,
          [activeParent.id]: activePassedFamilyIds.includes(id) ? activePassedFamilyIds : [...activePassedFamilyIds, id],
        },
      };
    }),
  markDirectConversationRead: (conversationId, seenAt = Date.now()) =>
    set((state) => {
      const activeParent = getActiveParentInternal(state.draftProfile);

      if (!activeParent) {
        return state;
      }

      return {
        directConversationLastSeenAtByParent: {
          ...state.directConversationLastSeenAtByParent,
          [activeParent.id]: {
            ...(state.directConversationLastSeenAtByParent[activeParent.id] ?? {}),
            [conversationId]: Math.max(
              state.directConversationLastSeenAtByParent[activeParent.id]?.[conversationId] ?? 0,
              seenAt
            ),
          },
        },
      };
    }),
  markGroupConversationRead: (conversationId, seenAt = Date.now()) =>
    set((state) => {
      const activeParent = getActiveParentInternal(state.draftProfile);
      if (!activeParent) {
        return state;
      }

      return {
        groupConversationLastSeenAtByParent: {
          ...state.groupConversationLastSeenAtByParent,
          [activeParent.id]: {
            ...(state.groupConversationLastSeenAtByParent[activeParent.id] ?? {}),
            [conversationId]: Math.max(
              state.groupConversationLastSeenAtByParent[activeParent.id]?.[conversationId] ?? 0,
              seenAt
            ),
          },
        },
      };
    }),
  sendMessage: (matchId, body, photoUrls = []) =>
    set((state) => {
      const activeParent = getActiveParentInternal(state.draftProfile);
      if (!activeParent) {
        return state;
      }

      const createdAt = Date.now();
      return {
        directConversationLastSeenAtByParent: {
          ...state.directConversationLastSeenAtByParent,
          [activeParent.id]: {
            ...(state.directConversationLastSeenAtByParent[activeParent.id] ?? {}),
            [matchId]: createdAt,
          },
        },
        messagesByMatch: {
          ...state.messagesByMatch,
          [matchId]: [
            ...(state.messagesByMatch[matchId] ?? []),
            {
              id: `${matchId}-${createdAt}`,
              senderFamilyId: state.currentFamilyId,
              senderParentId: activeParent.id,
              body,
              photoUrls,
              createdAt,
            },
          ],
        },
      };
    }),
  sendGroupMessage: (groupId, body, photoUrls = []) =>
    set((state) => {
      const activeParent = getActiveParentInternal(state.draftProfile);
      if (!activeParent) {
        return state;
      }

      const createdAt = Date.now();
      return {
        groupConversationLastSeenAtByParent: {
          ...state.groupConversationLastSeenAtByParent,
          [activeParent.id]: {
            ...(state.groupConversationLastSeenAtByParent[activeParent.id] ?? {}),
            [groupId]: createdAt,
          },
        },
        groupMessagesByPlayDate: {
          ...state.groupMessagesByPlayDate,
          [groupId]: [
            ...(state.groupMessagesByPlayDate[groupId] ?? []),
            {
              id: `${groupId}-${createdAt}`,
              senderFamilyId: state.currentFamilyId,
              senderParentId: activeParent.id,
              body,
              photoUrls,
              createdAt,
            },
          ],
        },
      };
    }),
  addLinkedParentToGroup: (id, parentId) =>
    set((state) => {
      const activeParent = getActiveParentInternal(state.draftProfile);
      const linkedParent = getParentByIdInternal(state.draftProfile.parents, parentId);

      if (
        !activeParent ||
        !linkedParent ||
        linkedParent.status !== 'active' ||
        linkedParent.id === activeParent.id
      ) {
        return state;
      }

      const createdAt = Date.now();
      let added = false;

      const nextGroupPlayDates = state.groupPlayDates.map((groupPlayDate) => {
        const canShareIntoChat =
          groupPlayDate.membership === 'hosting' ||
          groupPlayDate.membership === 'going' ||
          (groupPlayDate.visibility === 'private' && groupPlayDate.membership === 'invited');

        if (
          groupPlayDate.id !== id ||
          !canShareIntoChat ||
          !groupPlayDate.includedParentIds.includes(activeParent.id) ||
          groupPlayDate.includedParentIds.includes(linkedParent.id)
        ) {
          return groupPlayDate;
        }

        added = true;

        return {
          ...groupPlayDate,
          includedParentIds: [...groupPlayDate.includedParentIds, linkedParent.id],
        };
      });

      if (!added) {
        return state;
      }

      return {
        groupConversationLastSeenAtByParent: {
          ...state.groupConversationLastSeenAtByParent,
          [activeParent.id]: {
            ...(state.groupConversationLastSeenAtByParent[activeParent.id] ?? {}),
            [id]: createdAt,
          },
        },
        groupPlayDates: nextGroupPlayDates,
        groupMessagesByPlayDate: {
          ...state.groupMessagesByPlayDate,
          [id]: [
            ...(state.groupMessagesByPlayDate[id] ?? []),
            createGroupEventMessage({
              body: `${activeParent.firstName} added ${linkedParent.firstName} to this group.`,
              createdAt,
              groupId: id,
              senderFamilyId: state.currentFamilyId,
              senderParentId: activeParent.id,
            }),
          ],
        },
      };
    }),
  respondToGroupPlayDateInvite: (id, response) =>
    set((state) => {
      const activeParent = getActiveParentInternal(state.draftProfile);

      if (!activeParent) {
        return state;
      }

      return {
        groupPlayDates: state.groupPlayDates.map((groupPlayDate) => {
          if (groupPlayDate.id !== id || groupPlayDate.visibility !== 'private' || groupPlayDate.membership !== 'invited') {
            return groupPlayDate;
          }

          if (response === 'not-going') {
            return {
              ...groupPlayDate,
              membership: 'none',
              invitedFamilyIds: groupPlayDate.invitedFamilyIds.filter((familyId) => familyId !== state.currentFamilyId),
              includedParentIds: [],
            };
          }

          return {
            ...groupPlayDate,
            membership: 'going',
            attendeeFamilyIds: groupPlayDate.attendeeFamilyIds.includes(state.currentFamilyId)
              ? groupPlayDate.attendeeFamilyIds
              : [...groupPlayDate.attendeeFamilyIds, state.currentFamilyId],
            invitedFamilyIds: groupPlayDate.invitedFamilyIds.filter((familyId) => familyId !== state.currentFamilyId),
            includedParentIds: unique([...groupPlayDate.includedParentIds, activeParent.id]),
          };
        }),
      };
    }),
  requestToJoinGroupPlayDate: (id) =>
    set((state) => {
      const activeParent = getActiveParentInternal(state.draftProfile);

      if (!activeParent) {
        return state;
      }

      return {
        groupPlayDates: state.groupPlayDates.map((groupPlayDate) => {
          const isFull = groupPlayDate.attendeeFamilyIds.length >= groupPlayDate.capacity;

          if (
            groupPlayDate.id !== id ||
            groupPlayDate.visibility !== 'public' ||
            groupPlayDate.membership !== 'none' ||
            groupPlayDate.hostFamilyId === state.currentFamilyId ||
            isFull
          ) {
            return groupPlayDate;
          }

          return {
            ...groupPlayDate,
            membership: 'requested',
            includedParentIds: unique([...groupPlayDate.includedParentIds, activeParent.id]),
            pendingRequestFamilyIds: groupPlayDate.pendingRequestFamilyIds.includes(state.currentFamilyId)
              ? groupPlayDate.pendingRequestFamilyIds
              : [...groupPlayDate.pendingRequestFamilyIds, state.currentFamilyId],
          };
        }),
      };
    }),
  approveGroupJoinRequest: (id, familyId) =>
    set((state) => ({
      groupPlayDates: state.groupPlayDates.map((groupPlayDate) => {
        const isHostOwned = groupPlayDate.hostFamilyId === state.currentFamilyId;
        const isFull = groupPlayDate.attendeeFamilyIds.length >= groupPlayDate.capacity;

        if (
          groupPlayDate.id !== id ||
          groupPlayDate.visibility !== 'public' ||
          !isHostOwned ||
          !groupPlayDate.pendingRequestFamilyIds.includes(familyId) ||
          isFull
        ) {
          return groupPlayDate;
        }

        return {
          ...groupPlayDate,
          membership: familyId === state.currentFamilyId ? 'going' : groupPlayDate.membership,
          attendeeFamilyIds: groupPlayDate.attendeeFamilyIds.includes(familyId)
            ? groupPlayDate.attendeeFamilyIds
            : [...groupPlayDate.attendeeFamilyIds, familyId],
          pendingRequestFamilyIds: groupPlayDate.pendingRequestFamilyIds.filter((entry) => entry !== familyId),
        };
      }),
    })),
  declineGroupJoinRequest: (id, familyId) =>
    set((state) => ({
      groupPlayDates: state.groupPlayDates.map((groupPlayDate) => {
        const isHostOwned = groupPlayDate.hostFamilyId === state.currentFamilyId;

        if (
          groupPlayDate.id !== id ||
          groupPlayDate.visibility !== 'public' ||
          !isHostOwned ||
          !groupPlayDate.pendingRequestFamilyIds.includes(familyId)
        ) {
          return groupPlayDate;
        }

        return {
          ...groupPlayDate,
          membership: familyId === state.currentFamilyId ? 'none' : groupPlayDate.membership,
          pendingRequestFamilyIds: groupPlayDate.pendingRequestFamilyIds.filter((entry) => entry !== familyId),
        };
      }),
    })),
  createGroupPlayDate: (input) => {
    const createdAt = Date.now();
    const id = `${slugify(input.title)}-${createdAt}`;

    set((state) => ({
      groupConversationLastSeenAtByParent: (() => {
        const activeParent = getActiveParentInternal(state.draftProfile);

        if (!activeParent) {
          return state.groupConversationLastSeenAtByParent;
        }

        return {
          ...state.groupConversationLastSeenAtByParent,
          [activeParent.id]: {
            ...(state.groupConversationLastSeenAtByParent[activeParent.id] ?? {}),
            [id]: createdAt,
          },
        };
      })(),
      groupPlayDates: [
        {
          id,
          title: input.title,
          area: input.area,
          locationName: input.locationName,
          dateLabel: input.dateLabel,
          timeLabel: input.timeLabel,
          ageRange: input.ageRange,
          activityTags: input.activityTags,
          vibeTags: input.vibeTags,
          note: input.note,
          capacity: input.capacity,
          hostFamilyId: state.currentFamilyId,
          visibility: input.visibility,
          membership: 'hosting',
          attendeeFamilyIds: [state.currentFamilyId],
          invitedFamilyIds:
            input.visibility === 'private'
              ? input.invitedFamilyIds.filter((familyId) => familyId !== state.currentFamilyId)
              : [],
          includedParentIds: [getActiveParentInternal(state.draftProfile)?.id ?? state.draftProfile.primaryParentId],
          pendingRequestFamilyIds: [],
          createdAt,
        },
        ...state.groupPlayDates,
      ],
      groupMessagesByPlayDate: {
        ...state.groupMessagesByPlayDate,
        [id]: [],
      },
    }));

    return id;
  },
}));

function unique(values: string[]) {
  return [...new Set(values)];
}
