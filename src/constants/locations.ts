import type { DistanceRadiusKm, SavedLocation } from '@/utils/location';

export const stockholmLocationPresets: SavedLocation[] = [
  {
    id: 'vasastan',
    address: 'Dalagatan 16, Stockholm',
    latitude: 59.3431,
    longitude: 18.0396,
    city: 'Stockholm',
  },
  {
    id: 'hagastaden',
    address: 'Torsplan 8, Stockholm',
    latitude: 59.3475,
    longitude: 18.0328,
    city: 'Stockholm',
  },
  {
    id: 'norrmalm',
    address: 'Sveavägen 52, Stockholm',
    latitude: 59.3369,
    longitude: 18.0485,
    city: 'Stockholm',
  },
  {
    id: 'ostermalm',
    address: 'Karlavägen 70, Stockholm',
    latitude: 59.3385,
    longitude: 18.0884,
    city: 'Stockholm',
  },
  {
    id: 'kungsholmen',
    address: 'Hantverkargatan 44, Stockholm',
    latitude: 59.3314,
    longitude: 18.0282,
    city: 'Stockholm',
  },
  {
    id: 'sodermalm',
    address: 'Götgatan 54, Stockholm',
    latitude: 59.3176,
    longitude: 18.0718,
    city: 'Stockholm',
  },
  {
    id: 'liljeholmen',
    address: 'Liljeholmstorget 32, Stockholm',
    latitude: 59.3108,
    longitude: 18.0236,
    city: 'Stockholm',
  },
];

export const distanceRadiusOptions: DistanceRadiusKm[] = [2, 5, 10, 25, null];

export const DEFAULT_DISCOVERY_RADIUS_KM: Exclude<DistanceRadiusKm, null> = 10;

export const getLocationPresetById = (id: string) =>
  stockholmLocationPresets.find((location) => location.id === id);
