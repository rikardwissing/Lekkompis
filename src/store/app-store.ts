import { create } from 'zustand';
import { DEFAULT_DISCOVERY_RADIUS_KM, getLocationPresetById } from '@/constants/locations';
import { getAllChildInterests, isValidDateOnly, isValidMonthOnly } from '@/utils/birthdays';
import type { DistanceRadiusKm, SavedLocation } from '@/utils/location';

export type { DistanceRadiusKm, SavedLocation } from '@/utils/location';

export type Availability = 'Weekends' | 'Weekday afternoons' | 'Flexible mornings';

export type ChildProfile = {
  id: string;
  name: string;
  birthDate: string;
  interests: string[];
};

export type ExpectingProfile = {
  dueMonth: string;
};

export type ParentRole = 'primary' | 'coparent';
export type ParentStatus = 'active' | 'pending';

export type ParentAccount = {
  id: string;
  firstName: string;
  avatarUrl: string;
  birthDate?: string;
  intro: string;
  isDiscoverable: boolean;
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
  homeLocation: SavedLocation;
  familySummary: string;
  children: ChildProfile[];
  expecting: ExpectingProfile | null;
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
export type GroupPlayDateAudience = 'children' | 'expecting' | 'mixed';

export type GroupPlayDate = {
  id: string;
  title: string;
  location: SavedLocation;
  locationName: string;
  dateLabel: string;
  timeLabel: string;
  ageRange?: string;
  audience: GroupPlayDateAudience;
  activityTags: string[];
  vibeTags: string[];
  note: string;
  capacity: number;
  hostFamilyId: string;
  hostParentId: string;
  visibility: GroupPlayDateVisibility;
  membership: GroupPlayDateMembership;
  attendeeFamilyIds: string[];
  attendingParentIds: string[];
  invitedParentIds: string[];
  accessibleParentIds: string[];
  pendingRequestParentIds: string[];
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
  homeLocation: SavedLocation | null;
  familySummary: string;
  familyVibe: string[];
  children: ChildProfile[];
  expecting: ExpectingProfile | null;
};

export type DiscoveryFilters = {
  radiusKm: DistanceRadiusKm;
  availability: Availability | 'Any';
  selectedInterests: string[];
  similarAgeOnly: boolean;
  familyStage: 'all' | 'expecting';
};

export type PublicEventFilters = {
  radiusKm: DistanceRadiusKm;
  ageRange: string;
  audience: 'all' | Exclude<GroupPlayDateAudience, 'mixed'>;
  selectedActivityTags: string[];
};

export type CreateGroupPlayDateInput = {
  title: string;
  location: SavedLocation;
  locationName: string;
  dateLabel: string;
  timeLabel: string;
  ageRange?: string;
  audience: GroupPlayDateAudience;
  activityTags: string[];
  vibeTags: string[];
  note: string;
  capacity: number;
  visibility: GroupPlayDateVisibility;
  invitedParentIds: string[];
};

export type ConversationThread = {
  id: string;
  kind: 'direct' | 'group';
  isNewMatch: boolean;
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

type ParentIdsByParent = Record<string, string[]>;
type ConversationLastSeenByParent = Record<string, Record<string, number>>;

type AppState = {
  currentFamilyId: string;
  draftProfile: DraftProfile;
  coParentInvite: CoParentInvite | null;
  families: Family[];
  likedParentIdsByParent: ParentIdsByParent;
  passedParentIdsByParent: ParentIdsByParent;
  matchedParentIdsByParent: ParentIdsByParent;
  matchedAtByMatchId: Record<string, number>;
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
  setDiscoveryRadius: (radiusKm: DistanceRadiusKm) => void;
  setDiscoveryAvailability: (availability: DiscoveryFilters['availability']) => void;
  setDiscoveryFamilyStage: (familyStage: DiscoveryFilters['familyStage']) => void;
  toggleDiscoveryInterest: (value: string) => void;
  toggleDiscoverySimilarAge: () => void;
  resetDiscoveryFilters: () => void;
  setPublicEventRadius: (radiusKm: DistanceRadiusKm) => void;
  setPublicEventAudience: (audience: PublicEventFilters['audience']) => void;
  setPublicEventAgeRange: (ageRange: string) => void;
  togglePublicEventActivity: (value: string) => void;
  resetPublicEventFilters: () => void;
  resetDemoState: () => void;
  likeParent: (id: string) => void;
  passParent: (id: string) => void;
  markDirectConversationRead: (conversationId: string, seenAt?: number) => void;
  markGroupConversationRead: (conversationId: string, seenAt?: number) => void;
  sendMessage: (matchId: string, body: string, photoUrls?: string[]) => void;
  sendGroupMessage: (groupId: string, body: string, photoUrls?: string[]) => void;
  respondToGroupPlayDateInvite: (id: string, response: 'going' | 'not-going') => void;
  addLinkedParentToGroup: (id: string, parentId: string) => void;
  requestToJoinGroupPlayDate: (id: string) => void;
  approveGroupJoinRequest: (id: string, parentId: string) => void;
  declineGroupJoinRequest: (id: string, parentId: string) => void;
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
  intro: 'I am usually the one suggesting an easy coffee-and-playground first meetup and keeping things low pressure.',
  isDiscoverable: false,
  interests: ['Coffee walks', 'Cooking', 'Hiking'],
  languages: ['Swedish', 'English'],
  role: 'coparent',
  status: 'active',
};

export const ANY_PUBLIC_EVENT_AGE = 'Any age';
export const ANY_PUBLIC_EVENT_AUDIENCE = 'all';

const atMinute = (minuteOffset: number) => FIXTURE_START + minuteOffset * 60_000;

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'group';

const buildInterestDefaults = (children: ChildProfile[] = []) => getAllChildInterests(children).slice(0, 2);

const hasChildrenInternal = (children: ChildProfile[] = []) =>
  children.some((child) => child.name.trim().length > 0 && isValidDateOnly(child.birthDate));
const hasExpectingProfileInternal = (expecting?: ExpectingProfile | null) =>
  Boolean(expecting?.dueMonth && isValidMonthOnly(expecting.dueMonth));
const canParticipateInAudienceInternal = (
  value: { children?: ChildProfile[]; expecting?: ExpectingProfile | null },
  audience: GroupPlayDateAudience
) =>
  audience === 'mixed'
    ? true
    : audience === 'children'
      ? hasChildrenInternal(value.children)
      : hasExpectingProfileInternal(value.expecting);

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
  intro: overrides.intro ?? '',
  isDiscoverable: overrides.isDiscoverable ?? false,
  interests: overrides.interests ?? [],
  languages: overrides.languages ?? [],
  role: overrides.role ?? 'coparent',
  status: overrides.status ?? 'active',
});

const getParentByIdInternal = (parents: ParentAccount[], parentId: string) =>
  parents.find((parent) => parent.id === parentId);

const getFamilyByParentIdInternal = (families: Family[], parentId: string) =>
  families.find((family) => family.parents.some((parent) => parent.id === parentId));

const getFamilyIdForParentIdInternal = (families: Family[], parentId: string) =>
  getFamilyByParentIdInternal(families, parentId)?.id;

const buildDirectMatchIdInternal = (localParentId: string, remoteParentId: string) =>
  `${localParentId}__${remoteParentId}`;

const parseDirectMatchIdInternal = (matchId: string) => {
  const [localParentId, remoteParentId] = matchId.split('__');

  if (!localParentId || !remoteParentId) {
    return null;
  }

  return { localParentId, remoteParentId };
};

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

const getIdsForParentInternal = (valuesByParent: ParentIdsByParent, parentId: string) =>
  valuesByParent[parentId] ?? [];

const getDirectSeenForParentInternal = (valuesByParent: ConversationLastSeenByParent, parentId: string) =>
  valuesByParent[parentId] ?? {};

const requireLocation = (id: string) => {
  const location = getLocationPresetById(id);

  if (!location) {
    throw new Error(`Missing location preset: ${id}`);
  }

  return location;
};

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
      intro: 'I love warm, nearby meetups that feel easy for both kids and parents right from the start.',
      isDiscoverable: true,
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
  homeLocation: requireLocation('vasastan'),
  familySummary:
    'Family with Leo and Mila, and another baby due in September. We are looking for simple nearby meetups that feel easy for both the kids and the grown-ups.',
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
  expecting: {
    dueMonth: '2026-09',
  },
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
        intro: 'I love easy weekend outdoor plans and parent company that feels natural from the first meetup.',
        isDiscoverable: true,
        interests: ['Coffee walks', 'Museum outings', 'Playground hangs'],
        languages: ['Swedish', 'English'],
        role: 'primary',
        status: 'active',
      }),
      createParent({
        id: 'sara-coparent',
        firstName: 'Erik',
        avatarUrl: 'https://randomuser.me/api/portraits/men/54.jpg',
        birthDate: '1988-08-21',
        intro: 'I am usually the one suggesting park meetups, coffee afterwards, and a calm first hello for everyone.',
        isDiscoverable: true,
        interests: ['Coffee walks', 'Hiking', 'Board games'],
        languages: ['Swedish', 'English'],
        role: 'coparent',
        status: 'active',
      }),
    ],
    photoUrls: [
      'https://picsum.photos/seed/sara-1/600/600',
      'https://picsum.photos/seed/sara-2/600/600',
      'https://picsum.photos/seed/sara-3/600/600',
    ],
    homeLocation: requireLocation('hagastaden'),
    familySummary: 'Family with Maja. We like easy local outdoor plans and simple first meetups that can stay short if needed.',
    children: [
      createChild({
        id: 'sara-maja',
        name: 'Maja',
        birthDate: '2021-03-29',
        interests: ['Playgrounds', 'Drawing', 'Crafts'],
      }),
    ],
    expecting: null,
    shared: ['Nearby', 'Playgrounds', 'Weekend meetups'],
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
        intro: 'I enjoy calm cafe-and-park mornings and easy conversation with other international parents.',
        isDiscoverable: true,
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
    homeLocation: requireLocation('sodermalm'),
    familySummary: 'Family with Nora. We prefer calm local meetups and a gentle pace that works well for quieter kids.',
    children: [
      createChild({
        id: 'fatima-nora',
        name: 'Nora',
        birthDate: '2022-11-02',
        interests: ['Animals', 'Books', 'Playgrounds'],
      }),
    ],
    expecting: null,
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
        intro: 'I am up for outdoor play, active kids, and quick local plans that do not need much ceremony.',
        isDiscoverable: true,
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
    homeLocation: requireLocation('norrmalm'),
    familySummary:
      'Family with Elis and Alba, plus another baby due in October. We are outdoors a lot and hoping to click with both kids and parents.',
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
    expecting: {
      dueMonth: '2026-10',
    },
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
        intro: 'I am new in the area and would love local parent connections that feel warm, thoughtful, and easy to repeat.',
        isDiscoverable: true,
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
    homeLocation: requireLocation('ostermalm'),
    familySummary: 'Family with Liv. We are new nearby and looking for local families we would genuinely enjoy seeing again.',
    children: [
      createChild({
        id: 'elin-liv',
        name: 'Liv',
        birthDate: '2021-07-09',
        interests: ['Drawing', 'Books', 'Crafts'],
      }),
    ],
    expecting: null,
    shared: ['Drawing', 'Baking'],
    familyVibe: ['New in area', 'Warm', 'Weekday afternoons'],
    meetupNote: 'Often free after preschool and likes simple neighborhood meetups.',
    availability: ['Weekday afternoons'],
  },
  {
    id: 'mira',
    primaryParentId: 'mira-primary',
    parents: [
      createParent({
        id: 'mira-primary',
        firstName: 'Mira',
        avatarUrl: 'https://randomuser.me/api/portraits/women/34.jpg',
        birthDate: '1992-09-08',
        intro: 'I would love to meet nearby parents before the newborn blur starts, ideally over coffee or a short walk.',
        isDiscoverable: true,
        interests: ['Coffee walks', 'Baking', 'Books'],
        languages: ['Swedish', 'English'],
        role: 'primary',
        status: 'active',
      }),
    ],
    photoUrls: [
      'https://picsum.photos/seed/mira-1/600/600',
      'https://picsum.photos/seed/mira-2/600/600',
      'https://picsum.photos/seed/mira-3/600/600',
    ],
    homeLocation: requireLocation('vasastan'),
    familySummary: 'Expecting a first baby in late summer and hoping to build a few local family connections before things get blurry.',
    children: [],
    expecting: {
      dueMonth: '2026-08',
    },
    shared: ['Nearby', 'Warm'],
    familyVibe: ['Public place first', 'Calm pace', 'Weekend meetups'],
    meetupNote: 'Usually prefers a short coffee or walk meetup somewhere easy to reach.',
    availability: ['Weekends', 'Flexible mornings'],
  },
];

const initialMessages: Record<string, Message[]> = {
  [buildDirectMatchIdInternal(CURRENT_PRIMARY_PARENT_ID, 'sara-primary')]: [
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
  [buildDirectMatchIdInternal(CURRENT_PRIMARY_PARENT_ID, 'mira-primary')]: [
    {
      id: 'mira-1',
      senderFamilyId: 'mira',
      senderParentId: 'mira-primary',
      body: 'Hej! Happy to connect. A simple coffee or short walk next week could be lovely.',
      createdAt: atMinute(34),
    },
    {
      id: 'mira-2',
      senderFamilyId: CURRENT_FAMILY_ID,
      senderParentId: CURRENT_PRIMARY_PARENT_ID,
      body: 'That sounds really nice. Late morning is usually easiest for us.',
      createdAt: atMinute(38),
    },
    {
      id: 'mira-3',
      senderFamilyId: 'mira',
      senderParentId: 'mira-primary',
      body: 'Perfect. Public place first suits us too, and we are very happy to keep it short and easy.',
      createdAt: atMinute(42),
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
  'due-date-coffee-circle': [
    {
      id: 'g5',
      senderFamilyId: 'mira',
      senderParentId: 'mira-primary',
      body: 'You can peek at the chat before deciding. I booked a quiet corner so everyone can come and go easily.',
      createdAt: atMinute(14),
    },
  ],
};

const initialGroupPlayDates: GroupPlayDate[] = [
  {
    id: 'vasaparken-saturday',
    title: 'Saturday playground circle',
    location: requireLocation('vasastan'),
    locationName: 'Vasaparken playground',
    dateLabel: 'Sat 29 Mar',
    timeLabel: '10:00-11:30',
    audience: 'mixed',
    activityTags: [],
    vibeTags: [],
    note: 'Sara is hosting a low-key first meetup with coffee after if the kids click.',
    capacity: 3,
    hostFamilyId: 'sara',
    hostParentId: 'sara-primary',
    visibility: 'private',
    membership: 'invited',
    attendeeFamilyIds: ['sara'],
    attendingParentIds: ['sara-primary'],
    invitedParentIds: [CURRENT_PRIMARY_PARENT_ID, 'johan-primary'],
    accessibleParentIds: [CURRENT_PRIMARY_PARENT_ID],
    pendingRequestParentIds: [],
    createdAt: atMinute(4),
  },
  {
    id: 'animal-zoo-sunday',
    title: 'Sunday animal-themed park meetup',
    location: requireLocation('norrmalm'),
    locationName: 'Observatorielunden',
    dateLabel: 'Sun 30 Mar',
    timeLabel: '09:30-11:00',
    ageRange: '4-6 years',
    audience: 'children',
    activityTags: ['Animals', 'Picnic'],
    vibeTags: ['Weekend meetups', 'Bring snacks'],
    note: 'You are hosting this one for nearby matches who enjoy easy Sunday mornings.',
    capacity: 3,
    hostFamilyId: CURRENT_FAMILY_ID,
    hostParentId: CURRENT_PRIMARY_PARENT_ID,
    visibility: 'public',
    membership: 'hosting',
    attendeeFamilyIds: [CURRENT_FAMILY_ID, 'sara'],
    attendingParentIds: [CURRENT_PRIMARY_PARENT_ID, 'sara-primary'],
    invitedParentIds: [],
    accessibleParentIds: [CURRENT_PRIMARY_PARENT_ID],
    pendingRequestParentIds: ['johan-primary'],
    createdAt: atMinute(16),
  },
  {
    id: 'story-garden-sunday',
    title: 'Sunday story garden meetup',
    location: requireLocation('hagastaden'),
    locationName: 'Bellevue park garden',
    dateLabel: 'Sun 6 Apr',
    timeLabel: '10:30-12:00',
    ageRange: '3-5 years',
    audience: 'children',
    activityTags: ['Books', 'Picnic'],
    vibeTags: ['Calm pace', 'Public place first'],
    note: 'A relaxed public meetup with blankets, picture books, and a simple snack stop after if the kids are still happy.',
    capacity: 4,
    hostFamilyId: 'sara',
    hostParentId: 'sara-primary',
    visibility: 'public',
    membership: 'none',
    attendeeFamilyIds: ['sara'],
    attendingParentIds: ['sara-primary'],
    invitedParentIds: [],
    accessibleParentIds: [],
    pendingRequestParentIds: [],
    createdAt: atMinute(28),
  },
  {
    id: 'museum-crafts-saturday',
    title: 'Saturday museum craft hour',
    location: requireLocation('ostermalm'),
    locationName: 'Humlegarden craft table',
    dateLabel: 'Sat 12 Apr',
    timeLabel: '14:00-15:30',
    ageRange: '4-6 years',
    audience: 'children',
    activityTags: ['Crafts', 'Drawing'],
    vibeTags: ['Short first meetup', 'Public place first'],
    note: 'Already a full public event built around a short craft session and a quick park stop after.',
    capacity: 2,
    hostFamilyId: 'elin',
    hostParentId: 'elin-primary',
    visibility: 'public',
    membership: 'none',
    attendeeFamilyIds: ['elin', 'fatima'],
    attendingParentIds: ['elin-primary', 'fatima-primary'],
    invitedParentIds: [],
    accessibleParentIds: [],
    pendingRequestParentIds: [],
    createdAt: atMinute(32),
  },
  {
    id: 'due-date-coffee-circle',
    title: 'Due date coffee circle',
    location: requireLocation('hagastaden'),
    locationName: 'Norrtull cafe corner',
    dateLabel: 'Thu 3 Apr',
    timeLabel: '10:30-11:45',
    audience: 'mixed',
    activityTags: [],
    vibeTags: [],
    note: 'Mira is keeping this one easy: coffee first, then a short walk if everyone still has energy.',
    capacity: 2,
    hostFamilyId: 'mira',
    hostParentId: 'mira-primary',
    visibility: 'private',
    membership: 'invited',
    attendeeFamilyIds: ['mira'],
    attendingParentIds: ['mira-primary'],
    invitedParentIds: [CURRENT_PRIMARY_PARENT_ID],
    accessibleParentIds: [CURRENT_PRIMARY_PARENT_ID],
    pendingRequestParentIds: [],
    createdAt: atMinute(12),
  },
  {
    id: 'expecting-brunch-sunday',
    title: 'Sunday expecting parents brunch',
    location: requireLocation('kungsholmen'),
    locationName: 'Ralambshov cafe terrace',
    dateLabel: 'Sun 13 Apr',
    timeLabel: '11:00-12:30',
    audience: 'expecting',
    activityTags: ['Brunch', 'Tea'],
    vibeTags: ['Short first meetup', 'Calm pace'],
    note: 'A relaxed expecting-parents meetup with plenty of sit-down time and no pressure to stay the whole time.',
    capacity: 5,
    hostFamilyId: 'mira',
    hostParentId: 'mira-primary',
    visibility: 'public',
    membership: 'none',
    attendeeFamilyIds: ['mira'],
    attendingParentIds: ['mira-primary'],
    invitedParentIds: [],
    accessibleParentIds: [],
    pendingRequestParentIds: [],
    createdAt: atMinute(36),
  },
];

const defaultDiscoveryFilters = (draftProfile: DraftProfile): DiscoveryFilters => ({
  radiusKm: DEFAULT_DISCOVERY_RADIUS_KM,
  availability: 'Any',
  selectedInterests: buildInterestDefaults(draftProfile.children),
  similarAgeOnly: false,
  familyStage: 'all',
});

const defaultPublicEventFilters = (): PublicEventFilters => ({
  radiusKm: DEFAULT_DISCOVERY_RADIUS_KM,
  ageRange: ANY_PUBLIC_EVENT_AGE,
  audience: ANY_PUBLIC_EVENT_AUDIENCE,
  selectedActivityTags: [],
});

const defaultMatchedParentIds = ['sara-primary', 'mira-primary'];
const defaultLikedParentIdsByParent: ParentIdsByParent = {
  [CURRENT_PRIMARY_PARENT_ID]: [],
};
const defaultPassedParentIdsByParent: ParentIdsByParent = {
  [CURRENT_PRIMARY_PARENT_ID]: [],
};
const defaultMatchedParentIdsByParent: ParentIdsByParent = {
  [CURRENT_PRIMARY_PARENT_ID]: [...defaultMatchedParentIds, 'elin-primary'],
};
const initialMatchedAtByMatchId: Record<string, number> = {
  [buildDirectMatchIdInternal(CURRENT_PRIMARY_PARENT_ID, 'sara-primary')]: atMinute(5),
  [buildDirectMatchIdInternal(CURRENT_PRIMARY_PARENT_ID, 'mira-primary')]: atMinute(33),
  [buildDirectMatchIdInternal(CURRENT_PRIMARY_PARENT_ID, 'elin-primary')]: atMinute(44),
  [buildDirectMatchIdInternal(DEMO_COPARENT.id, 'sara-coparent')]: atMinute(26),
};
const initialDirectConversationLastSeenAtByParent: ConversationLastSeenByParent = {
  [CURRENT_PRIMARY_PARENT_ID]: {
    [buildDirectMatchIdInternal(CURRENT_PRIMARY_PARENT_ID, 'sara-primary')]: atMinute(10),
    [buildDirectMatchIdInternal(CURRENT_PRIMARY_PARENT_ID, 'mira-primary')]: atMinute(38),
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

export const getFamilyByParentId = (families: Family[], parentId: string) =>
  getFamilyByParentIdInternal(families, parentId);

export const buildDirectMatchId = (localParentId: string, remoteParentId: string) =>
  buildDirectMatchIdInternal(localParentId, remoteParentId);

export const parseDirectMatchId = (matchId: string) => parseDirectMatchIdInternal(matchId);

export const isPrimaryActiveParent = (draftProfile: DraftProfile) => isPrimaryParentSession(draftProfile);

export const hasBornChildren = (value: { children?: ChildProfile[] }) => hasChildrenInternal(value.children);

export const isExpectingFamily = (value: { expecting?: ExpectingProfile | null }) =>
  hasExpectingProfileInternal(value.expecting);

export const canParticipateInAudience = (
  value: { children?: ChildProfile[]; expecting?: ExpectingProfile | null },
  audience: GroupPlayDateAudience
) => canParticipateInAudienceInternal(value, audience);

export const getActiveLikedParentIds = (
  draftProfile: DraftProfile,
  likedParentIdsByParent: ParentIdsByParent
) => {
  const activeParent = getActiveParentInternal(draftProfile);
  return activeParent ? getIdsForParentInternal(likedParentIdsByParent, activeParent.id) : [];
};

export const getActivePassedParentIds = (
  draftProfile: DraftProfile,
  passedParentIdsByParent: ParentIdsByParent
) => {
  const activeParent = getActiveParentInternal(draftProfile);
  return activeParent ? getIdsForParentInternal(passedParentIdsByParent, activeParent.id) : [];
};

export const getActiveMatchedParentIds = (
  draftProfile: DraftProfile,
  matchedParentIdsByParent: ParentIdsByParent
) => {
  const activeParent = getActiveParentInternal(draftProfile);
  return activeParent ? getIdsForParentInternal(matchedParentIdsByParent, activeParent.id) : [];
};

export const getLinkedParentMatchedParentIds = (
  draftProfile: DraftProfile,
  matchedParentIdsByParent: ParentIdsByParent
) => {
  const activeParent = getActiveParentInternal(draftProfile);
  const activeParentId = activeParent?.id;
  const nextValues = new Set<string>();

  draftProfile.parents.forEach((parent) => {
    if (parent.id === activeParentId || parent.status !== 'active') {
      return;
    }

    getIdsForParentInternal(matchedParentIdsByParent, parent.id).forEach((parentId) => {
      nextValues.add(parentId);
    });
  });

  return [...nextValues];
};

const getUniqueFamilyIdsForParentIds = (families: Family[], parentIds: string[]) =>
  [...new Set(parentIds.map((parentId) => getFamilyIdForParentIdInternal(families, parentId)).filter((value): value is string => Boolean(value)))];

export const getActiveLikedFamilyIds = (
  draftProfile: DraftProfile,
  likedParentIdsByParent: ParentIdsByParent,
  families: Family[]
) => getUniqueFamilyIdsForParentIds(families, getActiveLikedParentIds(draftProfile, likedParentIdsByParent));

export const getActiveMatchedFamilyIds = (
  draftProfile: DraftProfile,
  matchedParentIdsByParent: ParentIdsByParent,
  families: Family[]
) => getUniqueFamilyIdsForParentIds(families, getActiveMatchedParentIds(draftProfile, matchedParentIdsByParent));

export const getLinkedParentMatchedFamilyIds = (
  draftProfile: DraftProfile,
  matchedParentIdsByParent: ParentIdsByParent,
  families: Family[]
) => getUniqueFamilyIdsForParentIds(families, getLinkedParentMatchedParentIds(draftProfile, matchedParentIdsByParent));

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
  likedParentIdsByParent: defaultLikedParentIdsByParent,
  passedParentIdsByParent: defaultPassedParentIdsByParent,
  matchedParentIdsByParent: defaultMatchedParentIdsByParent,
  matchedAtByMatchId: initialMatchedAtByMatchId,
  directConversationLastSeenAtByParent: initialDirectConversationLastSeenAtByParent,
  groupConversationLastSeenAtByParent: initialGroupConversationLastSeenAtByParent,
  messagesByMatch: initialMessages,
  groupMessagesByPlayDate: initialGroupMessages,
  groupPlayDates: initialGroupPlayDates,
  discoveryFilters: defaultDiscoveryFilters(defaultDraftProfile),
  publicEventFilters: defaultPublicEventFilters(),
  updateDraftProfile: (patch) =>
    set((state) => {
      const nextDraft = { ...state.draftProfile, ...patch };
      return {
        draftProfile: nextDraft,
        discoveryFilters:
          patch.children !== undefined
            ? {
                ...state.discoveryFilters,
                selectedInterests: patch.children
                  ? buildInterestDefaults(nextDraft.children ?? [])
                  : state.discoveryFilters.selectedInterests,
              }
            : state.discoveryFilters,
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
        parents: updateParentList(state.draftProfile.parents, state.draftProfile.activeParentId, (parent) => ({
          ...parent,
          interests: toggle(parent.interests, value),
        })),
      },
    })),
  toggleLanguage: (value) =>
    set((state) => ({
      draftProfile: {
        ...state.draftProfile,
        parents: updateParentList(state.draftProfile.parents, state.draftProfile.activeParentId, (parent) => ({
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
        likedParentIdsByParent: {
          ...state.likedParentIdsByParent,
          [DEMO_COPARENT.id]: state.likedParentIdsByParent[DEMO_COPARENT.id] ?? [],
        },
        passedParentIdsByParent: {
          ...state.passedParentIdsByParent,
          [DEMO_COPARENT.id]: state.passedParentIdsByParent[DEMO_COPARENT.id] ?? [],
        },
        matchedParentIdsByParent: {
          ...state.matchedParentIdsByParent,
          [DEMO_COPARENT.id]: state.matchedParentIdsByParent[DEMO_COPARENT.id] ?? ['sara-coparent'],
        },
        matchedAtByMatchId: {
          ...state.matchedAtByMatchId,
          [buildDirectMatchIdInternal(DEMO_COPARENT.id, 'sara-coparent')]:
            state.matchedAtByMatchId[buildDirectMatchIdInternal(DEMO_COPARENT.id, 'sara-coparent')] ?? atMinute(26),
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
      const nextLikedByParent = { ...state.likedParentIdsByParent };
      const nextPassedByParent = { ...state.passedParentIdsByParent };
      const nextMatchedByParent = { ...state.matchedParentIdsByParent };
      delete nextGroupSeenByParent[parentId];
      delete nextDirectSeenByParent[parentId];
      delete nextLikedByParent[parentId];
      delete nextPassedByParent[parentId];
      delete nextMatchedByParent[parentId];

      return {
        likedParentIdsByParent: nextLikedByParent,
        passedParentIdsByParent: nextPassedByParent,
        matchedParentIdsByParent: nextMatchedByParent,
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

      if (currentChildren.length <= 1 && !hasExpectingProfileInternal(state.draftProfile.expecting)) {
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
  setDiscoveryRadius: (radiusKm) =>
    set((state) => ({
      discoveryFilters: {
        ...state.discoveryFilters,
        radiusKm,
      },
    })),
  setDiscoveryAvailability: (availability) =>
    set((state) => ({
      discoveryFilters: {
        ...state.discoveryFilters,
        availability,
      },
    })),
  setDiscoveryFamilyStage: (familyStage) =>
    set((state) => ({
      discoveryFilters: {
        ...state.discoveryFilters,
        familyStage,
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
  setPublicEventRadius: (radiusKm) =>
    set((state) => ({
      publicEventFilters: {
        ...state.publicEventFilters,
        radiusKm,
      },
    })),
  setPublicEventAudience: (audience) =>
    set((state) => ({
      publicEventFilters: {
        ...state.publicEventFilters,
        audience,
        ageRange: audience === 'children' ? state.publicEventFilters.ageRange : ANY_PUBLIC_EVENT_AGE,
        selectedActivityTags: [],
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
    set(() => ({
      publicEventFilters: defaultPublicEventFilters(),
    })),
  resetDemoState: () =>
    set(() => ({
      currentFamilyId: CURRENT_FAMILY_ID,
      draftProfile: defaultDraftProfile,
      coParentInvite: null,
      families: defaultFamilies,
      likedParentIdsByParent: defaultLikedParentIdsByParent,
      passedParentIdsByParent: defaultPassedParentIdsByParent,
      matchedParentIdsByParent: defaultMatchedParentIdsByParent,
      matchedAtByMatchId: initialMatchedAtByMatchId,
      directConversationLastSeenAtByParent: initialDirectConversationLastSeenAtByParent,
      groupConversationLastSeenAtByParent: initialGroupConversationLastSeenAtByParent,
      messagesByMatch: initialMessages,
      groupMessagesByPlayDate: initialGroupMessages,
      groupPlayDates: initialGroupPlayDates,
      discoveryFilters: defaultDiscoveryFilters(defaultDraftProfile),
      publicEventFilters: defaultPublicEventFilters(),
    })),
  likeParent: (id) =>
    set((state) => {
      const activeParent = getActiveParentInternal(state.draftProfile);

      if (!activeParent) {
        return state;
      }

      const activeLikedParentIds = getIdsForParentInternal(state.likedParentIdsByParent, activeParent.id);
      const activeMatchedParentIds = getIdsForParentInternal(state.matchedParentIdsByParent, activeParent.id);
      const shouldMatch = ['sara-primary', 'sara-coparent', 'mira-primary', 'elin-primary'].includes(id) && !activeMatchedParentIds.includes(id);
      const matchId = buildDirectMatchIdInternal(activeParent.id, id);

      return {
        likedParentIdsByParent: {
          ...state.likedParentIdsByParent,
          [activeParent.id]: activeLikedParentIds.includes(id) ? activeLikedParentIds : [...activeLikedParentIds, id],
        },
        matchedParentIdsByParent: {
          ...state.matchedParentIdsByParent,
          [activeParent.id]: shouldMatch ? unique([...activeMatchedParentIds, id]) : activeMatchedParentIds,
        },
        matchedAtByMatchId: shouldMatch
          ? {
              ...state.matchedAtByMatchId,
              [matchId]: state.matchedAtByMatchId[matchId] ?? Date.now(),
            }
          : state.matchedAtByMatchId,
      };
    }),
  passParent: (id) =>
    set((state) => {
      const activeParent = getActiveParentInternal(state.draftProfile);

      if (!activeParent) {
        return state;
      }

      const activePassedParentIds = getIdsForParentInternal(state.passedParentIdsByParent, activeParent.id);

      return {
        passedParentIdsByParent: {
          ...state.passedParentIdsByParent,
          [activeParent.id]: activePassedParentIds.includes(id) ? activePassedParentIds : [...activePassedParentIds, id],
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
          !groupPlayDate.accessibleParentIds.includes(activeParent.id) ||
          groupPlayDate.accessibleParentIds.includes(linkedParent.id)
        ) {
          return groupPlayDate;
        }

        added = true;

        return {
          ...groupPlayDate,
          accessibleParentIds: [...groupPlayDate.accessibleParentIds, linkedParent.id],
          attendingParentIds:
            groupPlayDate.membership === 'hosting' || groupPlayDate.membership === 'going'
              ? unique([...groupPlayDate.attendingParentIds, linkedParent.id])
              : groupPlayDate.attendingParentIds,
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

      const createdAt = Date.now();
      let didRespond = false;

      return {
        groupConversationLastSeenAtByParent: {
          ...state.groupConversationLastSeenAtByParent,
          [activeParent.id]: {
            ...(state.groupConversationLastSeenAtByParent[activeParent.id] ?? {}),
            [id]: createdAt,
          },
        },
        groupPlayDates: state.groupPlayDates.map((groupPlayDate) => {
          if (
            groupPlayDate.id !== id ||
            groupPlayDate.visibility !== 'private' ||
            groupPlayDate.membership !== 'invited' ||
            !groupPlayDate.invitedParentIds.includes(activeParent.id)
          ) {
            return groupPlayDate;
          }

          didRespond = true;

          if (response === 'not-going') {
            return {
              ...groupPlayDate,
              membership: 'none',
              invitedParentIds: groupPlayDate.invitedParentIds.filter((parentId) => parentId !== activeParent.id),
              accessibleParentIds: groupPlayDate.accessibleParentIds.filter((parentId) => parentId !== activeParent.id),
              attendingParentIds: groupPlayDate.attendingParentIds.filter((parentId) => parentId !== activeParent.id),
            };
          }

          if (!canParticipateInAudienceInternal(state.draftProfile, groupPlayDate.audience)) {
            return groupPlayDate;
          }

          const localAccessibleParents = groupPlayDate.accessibleParentIds.filter(
            (parentId) => getFamilyIdForParentIdInternal(state.families, parentId) === state.currentFamilyId
          );

          return {
            ...groupPlayDate,
            membership: 'going',
            attendeeFamilyIds: groupPlayDate.attendeeFamilyIds.includes(state.currentFamilyId)
              ? groupPlayDate.attendeeFamilyIds
              : [...groupPlayDate.attendeeFamilyIds, state.currentFamilyId],
            invitedParentIds: groupPlayDate.invitedParentIds.filter((parentId) => parentId !== activeParent.id),
            accessibleParentIds: unique([...groupPlayDate.accessibleParentIds, activeParent.id]),
            attendingParentIds: unique([...groupPlayDate.attendingParentIds, ...localAccessibleParents, activeParent.id]),
          };
        }),
        groupMessagesByPlayDate: didRespond
          ? {
              ...state.groupMessagesByPlayDate,
              [id]: [
                ...(state.groupMessagesByPlayDate[id] ?? []),
                createGroupEventMessage({
                  body: `${activeParent.firstName} ${response === 'going' ? 'accepted' : 'declined'} the invitation.`,
                  createdAt,
                  groupId: id,
                  senderFamilyId: state.currentFamilyId,
                  senderParentId: activeParent.id,
                }),
              ],
            }
          : state.groupMessagesByPlayDate,
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
            isFull ||
            !canParticipateInAudienceInternal(state.draftProfile, groupPlayDate.audience)
          ) {
            return groupPlayDate;
          }

          return {
            ...groupPlayDate,
            membership: 'requested',
            accessibleParentIds: unique([...groupPlayDate.accessibleParentIds, activeParent.id]),
            pendingRequestParentIds: groupPlayDate.pendingRequestParentIds.includes(activeParent.id)
              ? groupPlayDate.pendingRequestParentIds
              : [...groupPlayDate.pendingRequestParentIds, activeParent.id],
          };
        }),
      };
    }),
  approveGroupJoinRequest: (id, parentId) =>
    set((state) => {
      const activeParent = getActiveParentInternal(state.draftProfile);
      const requesterFamily = getFamilyByParentIdInternal(state.families, parentId);
      const requesterParent = requesterFamily?.parents.find((parent) => parent.id === parentId) ?? null;
      const requesterName =
        requesterParent?.firstName ??
        (requesterFamily ? getPrimaryParentInternal(requesterFamily)?.firstName : null) ??
        'a parent';

      if (!activeParent) {
        return state;
      }

      const createdAt = Date.now();
      let approved = false;

      return {
        groupPlayDates: state.groupPlayDates.map((groupPlayDate) => {
          const isHostOwned = groupPlayDate.hostFamilyId === state.currentFamilyId;
          const requesterFamilyId = requesterFamily?.id ?? null;
          const isNewFamilySeat = requesterFamilyId
            ? !groupPlayDate.attendeeFamilyIds.includes(requesterFamilyId)
            : false;
          const isFull = groupPlayDate.attendeeFamilyIds.length >= groupPlayDate.capacity && isNewFamilySeat;

          if (
            groupPlayDate.id !== id ||
            groupPlayDate.visibility !== 'public' ||
            !isHostOwned ||
            !groupPlayDate.pendingRequestParentIds.includes(parentId) ||
            isFull
          ) {
            return groupPlayDate;
          }

          approved = true;

          return {
            ...groupPlayDate,
            membership: requesterFamilyId === state.currentFamilyId ? 'going' : groupPlayDate.membership,
            attendeeFamilyIds: !requesterFamilyId || groupPlayDate.attendeeFamilyIds.includes(requesterFamilyId)
              ? groupPlayDate.attendeeFamilyIds
              : [...groupPlayDate.attendeeFamilyIds, requesterFamilyId],
            attendingParentIds: unique([...groupPlayDate.attendingParentIds, parentId]),
            accessibleParentIds:
              requesterFamilyId === state.currentFamilyId
                ? unique([...groupPlayDate.accessibleParentIds, parentId])
                : groupPlayDate.accessibleParentIds,
            pendingRequestParentIds: groupPlayDate.pendingRequestParentIds.filter((entry) => entry !== parentId),
          };
        }),
        groupMessagesByPlayDate: approved
          ? {
              ...state.groupMessagesByPlayDate,
              [id]: [
                ...(state.groupMessagesByPlayDate[id] ?? []),
                createGroupEventMessage({
                  body: `${activeParent.firstName} approved ${requesterName}'s request to join.`,
                  createdAt,
                  groupId: id,
                  senderFamilyId: state.currentFamilyId,
                  senderParentId: activeParent.id,
                }),
              ],
            }
          : state.groupMessagesByPlayDate,
      };
    }),
  declineGroupJoinRequest: (id, parentId) =>
    set((state) => {
      const activeParent = getActiveParentInternal(state.draftProfile);
      const requesterFamily = getFamilyByParentIdInternal(state.families, parentId);
      const requesterParent = requesterFamily?.parents.find((parent) => parent.id === parentId) ?? null;
      const requesterName =
        requesterParent?.firstName ??
        (requesterFamily ? getPrimaryParentInternal(requesterFamily)?.firstName : null) ??
        'a parent';

      if (!activeParent) {
        return state;
      }

      const createdAt = Date.now();
      let declined = false;

      return {
        groupPlayDates: state.groupPlayDates.map((groupPlayDate) => {
          const isHostOwned = groupPlayDate.hostFamilyId === state.currentFamilyId;

          if (
            groupPlayDate.id !== id ||
            groupPlayDate.visibility !== 'public' ||
            !isHostOwned ||
            !groupPlayDate.pendingRequestParentIds.includes(parentId)
          ) {
            return groupPlayDate;
          }

          declined = true;

          const requesterFamilyId = requesterFamily?.id ?? null;

          return {
            ...groupPlayDate,
            membership: requesterFamilyId === state.currentFamilyId ? 'none' : groupPlayDate.membership,
            accessibleParentIds:
              requesterFamilyId === state.currentFamilyId
                ? groupPlayDate.accessibleParentIds.filter((entry) => entry !== parentId)
                : groupPlayDate.accessibleParentIds,
            pendingRequestParentIds: groupPlayDate.pendingRequestParentIds.filter((entry) => entry !== parentId),
          };
        }),
        groupMessagesByPlayDate: declined
          ? {
              ...state.groupMessagesByPlayDate,
              [id]: [
                ...(state.groupMessagesByPlayDate[id] ?? []),
                createGroupEventMessage({
                  body: `${activeParent.firstName} declined ${requesterName}'s request to join.`,
                  createdAt,
                  groupId: id,
                  senderFamilyId: state.currentFamilyId,
                  senderParentId: activeParent.id,
                }),
              ],
            }
          : state.groupMessagesByPlayDate,
      };
    }),
  createGroupPlayDate: (input) => {
    const createdAt = Date.now();
    const id = `${slugify(input.title)}-${createdAt}`;

    set((state) => {
      const activeParent = getActiveParentInternal(state.draftProfile);
      const activeParentId = activeParent?.id ?? state.draftProfile.primaryParentId;
      const invitedParentIds =
        input.visibility === 'private'
          ? input.invitedParentIds.filter(
              (parentId) =>
                parentId !== activeParentId && getFamilyIdForParentIdInternal(state.families, parentId) !== state.currentFamilyId
            )
          : [];
      const invitedFamilyCount = unique(
        invitedParentIds
          .map((parentId) => getFamilyIdForParentIdInternal(state.families, parentId))
          .filter((familyId): familyId is string => Boolean(familyId))
      ).length;

      return {
        groupConversationLastSeenAtByParent: activeParent
          ? {
              ...state.groupConversationLastSeenAtByParent,
              [activeParent.id]: {
                ...(state.groupConversationLastSeenAtByParent[activeParent.id] ?? {}),
                [id]: createdAt,
              },
            }
          : state.groupConversationLastSeenAtByParent,
        groupPlayDates: [
          {
            id,
            title: input.title,
            location: input.location,
            locationName: input.locationName,
            dateLabel: input.dateLabel,
            timeLabel: input.timeLabel,
            audience: input.visibility === 'private' ? 'mixed' : input.audience,
            ageRange: input.visibility === 'private' ? undefined : input.ageRange,
            activityTags: input.visibility === 'private' ? [] : input.activityTags,
            vibeTags: input.visibility === 'private' ? [] : input.vibeTags,
            note: input.note,
            capacity: input.visibility === 'private' ? invitedFamilyCount + 1 : input.capacity,
            hostFamilyId: state.currentFamilyId,
            hostParentId: activeParentId,
            visibility: input.visibility,
            membership: 'hosting',
            attendeeFamilyIds: [state.currentFamilyId],
            attendingParentIds: [activeParentId],
            invitedParentIds,
            accessibleParentIds: [activeParentId],
            pendingRequestParentIds: [],
            createdAt,
          },
          ...state.groupPlayDates,
        ],
        groupMessagesByPlayDate: {
          ...state.groupMessagesByPlayDate,
          [id]: [],
        },
      };
    });

    return id;
  },
}));

function unique(values: string[]) {
  return [...new Set(values)];
}
