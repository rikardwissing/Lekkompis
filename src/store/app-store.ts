import { create } from 'zustand';

type Availability = 'Weekends' | 'Weekday afternoons' | 'Flexible mornings';

type Family = {
  id: string;
  parentName: string;
  avatarUrl: string;
  photoUrls: string[];
  area: string;
  summary: string;
  childSummary: string;
  childAgeLabel: string;
  childInterests: string[];
  parentInterests: string[];
  languages: string[];
  shared: string[];
  familyVibe: string[];
  meetupNote: string;
  availability: Availability[];
};

type Message = {
  id: string;
  sender: string;
  body: string;
};

type DraftProfile = {
  parentName: string;
  avatarUrl: string;
  photoUrls: string[];
  area: string;
  bio: string;
  familyVibe: string[];
  parentInterests: string[];
  languages: string[];
  childName: string;
  childAgeLabel: string;
  childInterests: string[];
};

type DiscoveryFilters = {
  area: string;
  availability: Availability | 'Any';
  selectedInterests: string[];
};

type AppState = {
  draftProfile: DraftProfile;
  families: Family[];
  likedFamilyIds: string[];
  passedFamilyIds: string[];
  matchedFamilyIds: string[];
  messagesByMatch: Record<string, Message[]>;
  discoveryFilters: DiscoveryFilters;
  updateDraftProfile: (patch: Partial<DraftProfile>) => void;
  toggleFamilyVibe: (value: string) => void;
  toggleParentInterest: (value: string) => void;
  toggleLanguage: (value: string) => void;
  toggleChildInterest: (value: string) => void;
  setDiscoveryArea: (area: string) => void;
  setDiscoveryAvailability: (availability: DiscoveryFilters['availability']) => void;
  toggleDiscoveryInterest: (value: string) => void;
  resetDiscoveryFilters: () => void;
  resetDemoState: () => void;
  likeFamily: (id: string) => void;
  passFamily: (id: string) => void;
  sendMessage: (matchId: string, sender: string, body: string) => void;
};

const defaultDraftProfile: DraftProfile = {
  parentName: 'Anna',
  avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  photoUrls: [
    'https://picsum.photos/seed/anna-playground/600/600',
    'https://picsum.photos/seed/anna-coffee/600/600',
    'https://picsum.photos/seed/anna-park/600/600',
  ],
  area: 'Vasastan',
  bio: 'Mamma to Leo. Looking for simple weekend meetups nearby, and parents we would genuinely enjoy seeing again.',
  familyVibe: ['Weekend meetups', 'Public place first', 'Outdoor-friendly'],
  parentInterests: ['Coffee walks', 'Playground hangs', 'Baking'],
  languages: ['Swedish', 'English'],
  childName: 'Leo',
  childAgeLabel: '4 years',
  childInterests: ['Dinosaurs', 'Playgrounds', 'Drawing'],
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
    summary: 'Parent to Maja, 4. Looking for easy weekend outdoor playdates and parent company that feels natural too.',
    childSummary: 'Maja, 4',
    childAgeLabel: '4 years',
    childInterests: ['Playgrounds', 'Drawing', 'Crafts'],
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
    summary: 'Parent to Nora, 3. Loves calm café-and-park mornings and easy conversation with other international families.',
    childSummary: 'Nora, 3',
    childAgeLabel: '3 years',
    childInterests: ['Animals', 'Books', 'Playgrounds'],
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
    summary: 'Parent to Elis, 5. Outdoor family, often free on Sundays, and hoping to click with both kids and parents.',
    childSummary: 'Elis, 5',
    childAgeLabel: '5 years',
    childInterests: ['Football', 'Playgrounds', 'Animals'],
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
    summary: 'Parent to Liv, 4. New in the area and looking for local family friends with shared parent interests too.',
    childSummary: 'Liv, 4',
    childAgeLabel: '4 years',
    childInterests: ['Drawing', 'Books', 'Crafts'],
    parentInterests: ['Museum outings', 'Baking', 'Board games'],
    languages: ['Swedish', 'English', 'German'],
    shared: ['Drawing', 'Similar age'],
    familyVibe: ['New in area', 'Warm', 'Weekday afternoons'],
    meetupNote: 'Often free after preschool and likes simple neighborhood meetups.',
    availability: ['Weekday afternoons'],
  },
];

const initialMessages: Record<string, Message[]> = {
  'sara-match': [
    { id: '1', sender: 'Sara', body: 'Hej! Nice to connect. Would Saturday morning work for a playground meetup?' },
    { id: '2', sender: 'Anna', body: 'Yes, that sounds perfect. We usually go to Vasaparken around 10.' },
    { id: '3', sender: 'Sara', body: 'Lovely — public place first works great for us too.' },
  ],
};

const defaultDiscoveryFilters = (draftProfile: DraftProfile): DiscoveryFilters => ({
  area: draftProfile.area,
  availability: 'Any',
  selectedInterests: draftProfile.childInterests.slice(0, 2),
});

const toggle = (values: string[], value: string) =>
  values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];

export const useAppStore = create<AppState>((set) => ({
  draftProfile: defaultDraftProfile,
  families: defaultFamilies,
  likedFamilyIds: [],
  passedFamilyIds: [],
  matchedFamilyIds: [],
  messagesByMatch: initialMessages,
  discoveryFilters: defaultDiscoveryFilters(defaultDraftProfile),
  updateDraftProfile: (patch) =>
    set((state) => {
      const nextDraft = { ...state.draftProfile, ...patch };
      return {
        draftProfile: nextDraft,
        discoveryFilters:
          patch.area || patch.childInterests
            ? {
                ...state.discoveryFilters,
                area: patch.area ?? state.discoveryFilters.area,
                selectedInterests: patch.childInterests ? patch.childInterests.slice(0, 2) : state.discoveryFilters.selectedInterests,
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
  toggleChildInterest: (value) =>
    set((state) => {
      const childInterests = toggle(state.draftProfile.childInterests, value);
      return {
        draftProfile: {
          ...state.draftProfile,
          childInterests,
        },
        discoveryFilters: {
          ...state.discoveryFilters,
          selectedInterests: childInterests.slice(0, 2),
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
  resetDiscoveryFilters: () =>
    set((state) => ({
      discoveryFilters: defaultDiscoveryFilters(state.draftProfile),
    })),
  resetDemoState: () =>
    set(() => ({
      draftProfile: defaultDraftProfile,
      likedFamilyIds: [],
      passedFamilyIds: [],
      matchedFamilyIds: [],
      messagesByMatch: initialMessages,
      discoveryFilters: defaultDiscoveryFilters(defaultDraftProfile),
    })),
  likeFamily: (id) =>
    set((state) => ({
      likedFamilyIds: state.likedFamilyIds.includes(id) ? state.likedFamilyIds : [...state.likedFamilyIds, id],
      matchedFamilyIds: id === 'sara' && !state.matchedFamilyIds.includes(id) ? [...state.matchedFamilyIds, id] : state.matchedFamilyIds,
    })),
  passFamily: (id) =>
    set((state) => ({
      passedFamilyIds: state.passedFamilyIds.includes(id) ? state.passedFamilyIds : [...state.passedFamilyIds, id],
    })),
  sendMessage: (matchId, sender, body) =>
    set((state) => ({
      messagesByMatch: {
        ...state.messagesByMatch,
        [matchId]: [
          ...(state.messagesByMatch[matchId] ?? []),
          { id: `${matchId}-${Date.now()}`, sender, body },
        ],
      },
    })),
}));
