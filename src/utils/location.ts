export type SavedLocation = {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
};

export type DistanceRadiusKm = 2 | 5 | 10 | 25 | null;

const EARTH_RADIUS_KM = 6371;

const toRadians = (value: number) => (value * Math.PI) / 180;

const getSearchLabel = (location: SavedLocation) =>
  `${location.address} ${location.city} ${location.id.replace(/-/g, ' ')}`.toLowerCase();

export const getDistanceKm = (
  left: SavedLocation | null | undefined,
  right: SavedLocation | null | undefined
) => {
  if (!left || !right) {
    return null;
  }

  const latitudeDelta = toRadians(right.latitude - left.latitude);
  const longitudeDelta = toRadians(right.longitude - left.longitude);
  const leftLatitude = toRadians(left.latitude);
  const rightLatitude = toRadians(right.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(leftLatitude) * Math.cos(rightLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return EARTH_RADIUS_KM * arc;
};

export const isWithinRadius = (
  left: SavedLocation | null | undefined,
  right: SavedLocation | null | undefined,
  radiusKm: DistanceRadiusKm
) => {
  if (radiusKm === null) {
    return true;
  }

  const distanceKm = getDistanceKm(left, right);
  return distanceKm !== null && distanceKm <= radiusKm;
};

export const getDistanceBucketLabel = (distanceKm: number | null | undefined) => {
  if (distanceKm === null || distanceKm === undefined) {
    return null;
  }

  if (distanceKm <= 2) {
    return 'Under 2 km away';
  }

  if (distanceKm <= 5) {
    return 'Within 5 km';
  }

  if (distanceKm <= 10) {
    return 'Within 10 km';
  }

  if (distanceKm <= 25) {
    return 'Within 25 km';
  }

  return 'Farther away';
};

export const getPublicLocationLabel = (location: SavedLocation | null | undefined) =>
  location?.city ?? 'Location not set';

export const getPrivateLocationLabel = (location: SavedLocation | null | undefined) =>
  location?.address ?? 'Address not set';

export const searchLocationSuggestions = (query: string, locations: SavedLocation[]) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return [...locations];
  }

  return [...locations]
    .map((location) => {
      const searchLabel = getSearchLabel(location);
      const prefixScore = searchLabel.startsWith(normalizedQuery) ? 0 : 1;
      const containsScore = searchLabel.includes(normalizedQuery) ? 0 : 1;

      return {
        location,
        containsScore,
        prefixScore,
      };
    })
    .filter((entry) => entry.containsScore === 0)
    .sort(
      (left, right) =>
        left.prefixScore - right.prefixScore ||
        left.location.address.localeCompare(right.location.address) ||
        left.location.city.localeCompare(right.location.city)
    )
    .map((entry) => entry.location);
};
