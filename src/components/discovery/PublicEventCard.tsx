import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type PublicEventCardProps = {
  audienceLabel: string;
  attendeeCount: number;
  capacity: number;
  ctaDisabled?: boolean;
  ctaLabel: string;
  dateLabel: string;
  distanceLabel?: string | null;
  hostAvatarUrl?: string;
  hostName: string;
  locationName: string;
  note: string;
  onPressCta?: () => void;
  onPressOpen: () => void;
  primaryVariant?: 'primary' | 'secondary';
  timeLabel: string;
  title: string;
  topActivity?: string;
};

export function PublicEventCard({
  audienceLabel,
  attendeeCount,
  capacity,
  ctaDisabled = false,
  ctaLabel,
  dateLabel,
  distanceLabel,
  hostAvatarUrl,
  hostName,
  locationName,
  note,
  onPressCta,
  onPressOpen,
  primaryVariant = 'primary',
  timeLabel,
  title,
  topActivity,
}: PublicEventCardProps) {
  return (
    <Card>
      <View style={styles.metaRow}>
        <Text style={styles.eventMeta}>
          {dateLabel} · {timeLabel}
        </Text>
        <Chip label="Public" />
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.hostRow}>
        <Avatar imageUrl={hostAvatarUrl} name={hostName} size={40} />
        <View style={styles.hostCopy}>
          <Text style={styles.hostName}>Hosted by {hostName}</Text>
          <Text style={styles.locationLine}>{locationName}</Text>
        </View>
      </View>

      <Text numberOfLines={2} style={styles.note}>
        {note}
      </Text>

      <View style={styles.chips}>
        <Chip label={audienceLabel} />
        {distanceLabel ? <Chip label={distanceLabel} /> : null}
        {topActivity ? <Chip label={topActivity} /> : null}
        <Chip label={`${attendeeCount}/${capacity} families`} />
      </View>

      <View style={styles.actions}>
        <View style={styles.flex}>
          <Button label="Details" onPress={onPressOpen} variant="secondary" />
        </View>
        <View style={styles.flex}>
          <Button disabled={ctaDisabled} label={ctaLabel} onPress={onPressCta} variant={primaryVariant} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  eventMeta: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
    color: colors.text,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  hostCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  hostName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  locationLine: {
    fontSize: 14,
    color: colors.textMuted,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
});
