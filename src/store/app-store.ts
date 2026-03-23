import { create } from 'zustand';
import { getAllChildInterests } from '@/utils/birthdays';

export type Availability = 'Weekends' | 'Weekday afternoons' | 'Flexible mornings';

export type ChildProfile = {
  id: string;
  name: string;
  birthDate: string;
  interests: string[];
};

export type Family = {
  id: string;
  parentName: string;
  avatarUrl: string;
  photoUrls: string[];
  area: string;
  summary: string;
  parentBirthDate?: string;
  children: ChildProfile[];
  parentInterests: string[];
  languages: string[];
  shared: string[];
  familyVibe: string[];
  meetupNote: string;
  availability: Availability[];
};

export type Message = {
  id: string;
  sender: string;
  body?: string;
  photoUrls?: string[];
  createdAt: number;
};

export type GroupPlayDateStatus = 'invited' | 'going' | 'hosting';

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
  attendeeFamilyIds: string[];
  invitedFamilyIds: string[];
  status: GroupPlayDateStatus;
  createdAt: number;
};

export type DraftProfile = {
  parentName: string;
  avatarUrl: string;
  photoUrls: string[];
  area: string;
  bio: string;
  parentBirthDate?: string;
  familyVibe: string[];
  parentInterests: string[];
  languages: string[];
  children: ChildProfile[];
};

export type DiscoveryFilters = {
  area: string;
  availability: Availability | 'Any';
  selectedInterests: string[];
  similarAgeOnly: boolean;
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

type AppState = {
  currentFamilyId: string;
  draftProfile: DraftProfile;
  families: Family[];
  likedFamilyIds: string[];
  passedFamilyIds: string[];
  matchedFamilyIds: string[];
  conversationLastSeenAt: Record<string, number>;
  messagesByMatch: Record<string, Message[]>;
  groupMessagesByPlayDate: Record<string, Message[]>;
  groupPlayDates: GroupPlayDate[];
  discoveryFilters: DiscoveryFilters;
  updateDraftProfile: (patch: Partial<DraftProfile>) => void;
  toggleFamilyVibe: (value: string) => void;
  toggleParentInterest: (value: string) => void;
  toggleLanguage: (value: string) => void;
  addDraftChild: () => void;
  removeDraftChild: (childId: string) => void;
  updateDraftChild: (childId: string, patch: Partial<ChildProfile>) => void;
  toggleDraftChildInterest: (childId: string, value: string) => void;
  setDiscoveryArea: (area: string) => void;
  setDiscoveryAvailability: (availability: DiscoveryFilters['availability']) => void;
  toggleDiscoveryInterest: (value: string) => void;
  toggleDiscoverySimilarAge: () => void;
  resetDiscoveryFilters: () => void;
  resetDemoState: () => void;
  likeFamily: (id: string) => void;
  passFamily: (id: string) => void;
  markConversationRead: (conversationId: string, seenAt?: number) => void;
  sendMessage: (matchId: string, sender: string, body: string, photoUrls?: string[]) => void;
  sendGroupMessage: (groupId: string, sender: string, body: string, photoUrls?: string[]) => void;
  respondToGroupPlayDateInvite: (id: string, response: 'going' | 'not-going') => void;
  createGroupPlayDate: (input: CreateGroupPlayDateInput) => string;
};

const CURRENT_FAMILY_ID = 'anna';
const FIXTURE_START = Date.parse('2026-03-22T09:00:00Z');

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

const defaultDraftProfile: DraftProfile = {
  parentName: 'Anna',
  avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  photoUrls: [
    'https://picsum.photos/seed/anna-playground/600/600',
    'https://picsum.photos/seed/anna-coffee/600/600',
    'https://picsum.photos/seed/anna-park/600/600',
  ],
  area: 'Vasastan',
  bio: 'Mamma to Leo and Mila. Looking for simple weekend meetups nearby, and parents we would genuinely enjoy seeing again.',
  parentBirthDate: '1991-05-18',
  familyVibe: ['Weekend meetups', 'Public place first', 'Outdoor-friendly'],
  parentInterests: ['Coffee walks', 'Playground hangs', 'Baking'],
  languages: ['Swedish', 'English'],
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
    parentName: 'Sara',
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    photoUrls: [
      'https://picsum.photos/seed/sara-1/600/600',
      'https://picsum.photos/seed/sara-2/600/600',
      'https://picsum.photos/seed/sara-3/600/600',
    ],
    area: 'Vasastan',
    summary: 'Parent to Maja. Looking for easy weekend outdoor playdates and parent company that feels natural too.',
    parentBirthDate: '1990-04-12',
    children: [
      createChild({
        id: 'sara-maja',
        name: 'Maja',
        birthDate: '2021-03-29',
        interests: ['Playgrounds', 'Drawing', 'Crafts'],
      }),
    ],
    parentInterests: ['Coffee walks', 'Museum outings', 'Playground hangs'],
    languages: ['Swedish', 'English'],
    shared: ['Same area', 'Playgrounds', 'Weekend meetups'],
    familyVibe: ['Warm', 'Outdoor-friendly', 'Easygoing'],
    meetupNote: 'Usually starts with a public playground meetup and coffee nearby.',
    availability: ['Weekends', 'Flexible mornings'],
  },
  {
    id: 'fatima',
    parentName: 'Fatima',
    avatarUrl: 'https://randomuser.me/api/portraits/women/79.jpg',
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
    parentInterests: ['Coffee walks', 'Cooking', 'Board games'],
    languages: ['English', 'Arabic', 'Swedish'],
    shared: ['Animals', 'Public-place first'],
    familyVibe: ['Calm', 'Public-place first', 'Morning plans'],
    meetupNote: 'Prefers quiet first meetings and a short walk after.',
    availability: ['Flexible mornings'],
  },
  {
    id: 'johan',
    parentName: 'Johan',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
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
    parentInterests: ['Hiking', 'Fitness', 'Coffee walks'],
    languages: ['Swedish', 'English'],
    shared: ['Nearby', 'Outdoor play'],
    familyVibe: ['Energetic', 'Weekend plans', 'Playground regular'],
    meetupNote: 'Happy to meet at Vasaparken or another public playground.',
    availability: ['Weekends'],
  },
  {
    id: 'elin',
    parentName: 'Elin',
    avatarUrl: 'https://randomuser.me/api/portraits/women/21.jpg',
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
    parentInterests: ['Museum outings', 'Baking', 'Board games'],
    languages: ['Swedish', 'English', 'German'],
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
      sender: 'Sara',
      body: 'Hej! Nice to connect. Would Saturday morning work for a playground meetup?',
      createdAt: atMinute(6),
    },
    {
      id: '2',
      sender: 'Anna',
      body: 'Yes, that sounds perfect. We usually go to Vasaparken around 10.',
      createdAt: atMinute(10),
    },
    {
      id: '3',
      sender: 'Sara',
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
      sender: 'Anna',
      body: 'Happy this group came together. Let’s keep it simple and meet by the hill entrance.',
      createdAt: atMinute(18),
    },
    {
      id: 'g2',
      sender: 'Sara',
      body: 'Perfect for us. Maja will bring her animal cards.',
      createdAt: atMinute(21),
    },
    {
      id: 'g3',
      sender: 'Johan',
      body: 'Here is the picnic spot we usually use if the weather stays nice.',
      photoUrls: ['https://picsum.photos/seed/group-picnic-spot/720/480'],
      createdAt: atMinute(24),
    },
  ],
  'vasaparken-saturday': [
    {
      id: 'g4',
      sender: 'Sara',
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
    attendeeFamilyIds: ['sara'],
    invitedFamilyIds: [CURRENT_FAMILY_ID, 'johan'],
    status: 'invited',
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
    attendeeFamilyIds: [CURRENT_FAMILY_ID, 'sara'],
    invitedFamilyIds: ['johan'],
    status: 'hosting',
    createdAt: atMinute(16),
  },
];

const defaultDiscoveryFilters = (draftProfile: DraftProfile): DiscoveryFilters => ({
  area: draftProfile.area,
  availability: 'Any',
  selectedInterests: buildInterestDefaults(draftProfile.children),
  similarAgeOnly: false,
});

const toggle = (values: string[], value: string) =>
  values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];

const defaultMatchedFamilyIds = ['sara'];
const initialConversationLastSeenAt: Record<string, number> = {
  'sara-match': atMinute(10),
  'animal-zoo-sunday': atMinute(18),
};

export const useAppStore = create<AppState>((set) => ({
  currentFamilyId: CURRENT_FAMILY_ID,
  draftProfile: defaultDraftProfile,
  families: defaultFamilies,
  likedFamilyIds: [],
  passedFamilyIds: [],
  matchedFamilyIds: defaultMatchedFamilyIds,
  conversationLastSeenAt: initialConversationLastSeenAt,
  messagesByMatch: initialMessages,
  groupMessagesByPlayDate: initialGroupMessages,
  groupPlayDates: initialGroupPlayDates,
  discoveryFilters: defaultDiscoveryFilters(defaultDraftProfile),
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
                selectedInterests: patch.children ? buildInterestDefaults(nextDraft.children ?? []) : state.discoveryFilters.selectedInterests,
              }
            : state.discoveryFilters,
      };
    }),
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
        parentInterests: toggle(state.draftProfile.parentInterests, value),
      },
    })),
  toggleLanguage: (value) =>
    set((state) => ({
      draftProfile: {
        ...state.draftProfile,
        languages: toggle(state.draftProfile.languages, value),
      },
    })),
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
  resetDemoState: () =>
    set(() => ({
      currentFamilyId: CURRENT_FAMILY_ID,
      draftProfile: defaultDraftProfile,
      likedFamilyIds: [],
      passedFamilyIds: [],
      matchedFamilyIds: defaultMatchedFamilyIds,
      conversationLastSeenAt: initialConversationLastSeenAt,
      messagesByMatch: initialMessages,
      groupMessagesByPlayDate: initialGroupMessages,
      groupPlayDates: initialGroupPlayDates,
      discoveryFilters: defaultDiscoveryFilters(defaultDraftProfile),
    })),
  likeFamily: (id) =>
    set((state) => ({
      likedFamilyIds: state.likedFamilyIds.includes(id) ? state.likedFamilyIds : [...state.likedFamilyIds, id],
      matchedFamilyIds:
        id === 'sara' && !state.matchedFamilyIds.includes(id) ? [...state.matchedFamilyIds, id] : state.matchedFamilyIds,
    })),
  passFamily: (id) =>
    set((state) => ({
      passedFamilyIds: state.passedFamilyIds.includes(id) ? state.passedFamilyIds : [...state.passedFamilyIds, id],
    })),
  markConversationRead: (conversationId, seenAt = Date.now()) =>
    set((state) => ({
      conversationLastSeenAt: {
        ...state.conversationLastSeenAt,
        [conversationId]: Math.max(state.conversationLastSeenAt[conversationId] ?? 0, seenAt),
      },
    })),
  sendMessage: (matchId, sender, body, photoUrls = []) =>
    set((state) => {
      const createdAt = Date.now();
      return {
        conversationLastSeenAt:
          sender === state.draftProfile.parentName
            ? {
                ...state.conversationLastSeenAt,
                [matchId]: createdAt,
              }
            : state.conversationLastSeenAt,
        messagesByMatch: {
          ...state.messagesByMatch,
          [matchId]: [
            ...(state.messagesByMatch[matchId] ?? []),
            { id: `${matchId}-${createdAt}`, sender, body, photoUrls, createdAt },
          ],
        },
      };
    }),
  sendGroupMessage: (groupId, sender, body, photoUrls = []) =>
    set((state) => {
      const createdAt = Date.now();
      return {
        conversationLastSeenAt:
          sender === state.draftProfile.parentName
            ? {
                ...state.conversationLastSeenAt,
                [groupId]: createdAt,
              }
            : state.conversationLastSeenAt,
        groupMessagesByPlayDate: {
          ...state.groupMessagesByPlayDate,
          [groupId]: [
            ...(state.groupMessagesByPlayDate[groupId] ?? []),
            { id: `${groupId}-${createdAt}`, sender, body, photoUrls, createdAt },
          ],
        },
      };
    }),
  respondToGroupPlayDateInvite: (id, response) =>
    set((state) => ({
      groupPlayDates: state.groupPlayDates
        .map((groupPlayDate) => {
          if (groupPlayDate.id !== id || groupPlayDate.status !== 'invited') {
            return groupPlayDate;
          }

          if (response === 'not-going') {
            return null;
          }

          return {
            ...groupPlayDate,
            status: 'going',
            attendeeFamilyIds: groupPlayDate.attendeeFamilyIds.includes(state.currentFamilyId)
              ? groupPlayDate.attendeeFamilyIds
              : [...groupPlayDate.attendeeFamilyIds, state.currentFamilyId],
            invitedFamilyIds: groupPlayDate.invitedFamilyIds.filter((familyId) => familyId !== state.currentFamilyId),
          };
        })
        .filter((groupPlayDate): groupPlayDate is GroupPlayDate => groupPlayDate !== null),
    })),
  createGroupPlayDate: (input) => {
    const createdAt = Date.now();
    const id = `${slugify(input.title)}-${createdAt}`;

    set((state) => ({
      conversationLastSeenAt: {
        ...state.conversationLastSeenAt,
        [id]: createdAt,
      },
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
          attendeeFamilyIds: [state.currentFamilyId],
          invitedFamilyIds: input.invitedFamilyIds.filter((familyId) => familyId !== state.currentFamilyId),
          status: 'hosting',
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
