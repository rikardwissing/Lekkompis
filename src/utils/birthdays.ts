type ChildLike = {
  birthDate: string;
  interests: string[];
  name: string;
};

export type ChildAgeMatch = {
  currentChildName: string;
  familyChildName: string;
  label: 'same' | 'close';
  monthsApart: number;
};

export type NextBirthdayInfo = {
  daysUntil: number;
  nextDateLabel: string;
  nextDateOnly: string;
  turningAge: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const parseParts = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
};

const toUtcDate = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month - 1, day));

const startOfTodayUtc = (today: Date) =>
  new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

const unique = (values: string[]) => [...new Set(values)];

const getAgeYears = (birthDate: string, today: Date) => {
  const parts = parseParts(birthDate);
  if (!parts) {
    return null;
  }

  let age = today.getFullYear() - parts.year;
  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > parts.month ||
    (today.getMonth() + 1 === parts.month && today.getDate() >= parts.day);

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age;
};

const getMonthDifference = (left: string, right: string) => {
  const leftParts = parseParts(left);
  const rightParts = parseParts(right);

  if (!leftParts || !rightParts) {
    return null;
  }

  const leftDate = toUtcDate(leftParts.year, leftParts.month, leftParts.day);
  const rightDate = toUtcDate(rightParts.year, rightParts.month, rightParts.day);

  return Math.abs(leftDate.getTime() - rightDate.getTime()) / (MS_PER_DAY * 30.4375);
};

export const isValidDateOnly = (value: string) => Boolean(parseParts(value));

export const dateOnlyToDate = (value: string) => {
  const parts = parseParts(value);
  return parts ? toUtcDate(parts.year, parts.month, parts.day) : null;
};

export const toDateOnlyString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const formatDateOnly = (value: string, includeYear = true) => {
  const parts = parseParts(value);
  if (!parts) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
  }).format(toUtcDate(parts.year, parts.month, parts.day));
};

export const formatAgeLabelFromBirthDate = (birthDate: string, today = new Date()) => {
  const age = getAgeYears(birthDate, today);
  if (age === null) {
    return 'Birthday not set';
  }

  return `${age} year${age === 1 ? '' : 's'}`;
};

export const getAllChildInterests = (children: ChildLike[] = []) =>
  unique(children.flatMap((child) => child.interests));

export const formatChildrenSummary = (children: ChildLike[] = [], today = new Date()) => {
  const items = children
    .filter((child) => child.name.trim().length > 0)
    .map((child) => {
      const age = getAgeYears(child.birthDate, today);
      return age === null ? child.name : `${child.name}, ${age}`;
    });

  return items.join(' · ');
};

export const getClosestChildAgeMatch = (
  currentChildren: ChildLike[] = [],
  familyChildren: ChildLike[] = [],
  today = new Date()
): ChildAgeMatch | null => {
  let bestMatch: ChildAgeMatch | null = null;

  currentChildren.forEach((currentChild) => {
    familyChildren.forEach((familyChild) => {
      const monthsApart = getMonthDifference(currentChild.birthDate, familyChild.birthDate);
      if (monthsApart === null || monthsApart > 12) {
        return;
      }

      const currentAge = getAgeYears(currentChild.birthDate, today);
      const familyAge = getAgeYears(familyChild.birthDate, today);
      const label = currentAge !== null && familyAge !== null && currentAge === familyAge ? 'same' : 'close';

      if (!bestMatch || monthsApart < bestMatch.monthsApart) {
        bestMatch = {
          currentChildName: currentChild.name,
          familyChildName: familyChild.name,
          label,
          monthsApart,
        };
      }
    });
  });

  return bestMatch;
};

export const getAgeGapSortValue = (currentChildren: ChildLike[] = [], familyChildren: ChildLike[] = []) => {
  const bestMatch = getClosestChildAgeMatch(currentChildren, familyChildren);
  return bestMatch ? bestMatch.monthsApart : Number.POSITIVE_INFINITY;
};

export const getNextBirthdayInfo = (birthDate: string, today = new Date()): NextBirthdayInfo | null => {
  const parts = parseParts(birthDate);
  if (!parts) {
    return null;
  }

  const todayUtc = startOfTodayUtc(today);
  let nextYear = todayUtc.getUTCFullYear();
  let nextBirthday = toUtcDate(nextYear, parts.month, parts.day);

  if (nextBirthday.getTime() < todayUtc.getTime()) {
    nextYear += 1;
    nextBirthday = toUtcDate(nextYear, parts.month, parts.day);
  }

  const daysUntil = Math.round((nextBirthday.getTime() - todayUtc.getTime()) / MS_PER_DAY);

  return {
    daysUntil,
    nextDateLabel: new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
    }).format(nextBirthday),
    nextDateOnly: `${nextYear}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`,
    turningAge: nextYear - parts.year,
  };
};

export const formatChildBirthdayLabel = (name: string, birthDate: string, today = new Date()) => {
  const info = getNextBirthdayInfo(birthDate, today);
  if (!info) {
    return null;
  }

  return `${name} turns ${info.turningAge} on ${info.nextDateLabel}`;
};

export const formatParentBirthdayLabel = (name: string, birthDate: string, today = new Date()) => {
  const info = getNextBirthdayInfo(birthDate, today);
  if (!info) {
    return null;
  }

  return `${name}'s birthday on ${info.nextDateLabel}`;
};
