import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { PhotoStrip } from '@/components/ui/PhotoStrip';
import type { ChatClusterPosition } from '@/components/chat/chat-presenters';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

export function MessageBubble({
  avatarMode = 'none',
  clusterPosition = 'single',
  sender,
  senderAvatarUrl,
  body,
  photoUrls = [],
  mine = false,
  showSender = false,
  showTimestamp = false,
  timeLabel,
}: {
  avatarMode?: 'none' | 'spacer' | 'visible';
  clusterPosition?: ChatClusterPosition;
  sender: string;
  senderAvatarUrl?: string;
  body?: string;
  photoUrls?: string[];
  mine?: boolean;
  showSender?: boolean;
  showTimestamp?: boolean;
  timeLabel?: string;
}) {
  const avatarColumn =
    avatarMode === 'none' ? null : avatarMode === 'visible' ? (
      <Avatar name={sender} imageUrl={senderAvatarUrl} size={30} />
    ) : (
      <View style={styles.avatarSpacer} />
    );

  const bubbleShape = getBubbleShape(mine, clusterPosition);

  return (
    <View style={[styles.wrapper, mine ? styles.mineWrap : styles.theirsWrap]}>
      <View style={[styles.row, mine ? styles.mineRow : styles.theirsRow]}>
        {!mine ? avatarColumn : null}
        <View style={[styles.bubbleColumn, mine ? styles.mineColumn : styles.theirsColumn]}>
          {showSender ? <Text style={styles.sender}>{sender}</Text> : null}
          <View style={[styles.bubble, mine ? styles.mine : styles.theirs, bubbleShape]}>
            {body ? <Text style={[styles.body, mine ? styles.mineBody : null]}>{body}</Text> : null}
            {photoUrls.length > 0 ? <PhotoStrip photos={photoUrls} size={112} /> : null}
          </View>
        </View>
        {mine ? avatarColumn : null}
      </View>
      {showTimestamp ? (
        <Text
          style={[
            styles.timestamp,
            mine ? styles.mineTimestamp : styles.theirsTimestamp,
            !mine && avatarMode !== 'none' ? styles.timestampWithAvatar : null,
          ]}
        >
          {timeLabel}
        </Text>
      ) : null}
    </View>
  );
}

const getBubbleShape = (mine: boolean, clusterPosition: ChatClusterPosition) => {
  if (mine) {
    if (clusterPosition === 'top') {
      return styles.mineTop;
    }

    if (clusterPosition === 'middle') {
      return styles.mineMiddle;
    }

    if (clusterPosition === 'bottom') {
      return styles.mineBottom;
    }

    return styles.singleBubble;
  }

  if (clusterPosition === 'top') {
    return styles.theirsTop;
  }

  if (clusterPosition === 'middle') {
    return styles.theirsMiddle;
  }

  if (clusterPosition === 'bottom') {
    return styles.theirsBottom;
  }

  return styles.singleBubble;
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: spacing.xs,
  },
  mineWrap: {
    alignItems: 'flex-end',
  },
  theirsWrap: {
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    width: '100%',
  },
  mineRow: {
    justifyContent: 'flex-end',
  },
  theirsRow: {
    justifyContent: 'flex-start',
  },
  bubbleColumn: {
    gap: spacing.xs,
    maxWidth: '78%',
  },
  mineColumn: {
    alignItems: 'flex-end',
  },
  theirsColumn: {
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  mine: {
    backgroundColor: colors.primary,
  },
  theirs: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(227, 231, 227, 0.9)',
  },
  sender: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    paddingHorizontal: spacing.xs,
  },
  body: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
  },
  mineBody: {
    color: colors.surface,
  },
  avatarSpacer: {
    width: 30,
    height: 30,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textMuted,
  },
  mineTimestamp: {
    paddingRight: spacing.xs,
  },
  theirsTimestamp: {
    paddingLeft: spacing.xs,
  },
  timestampWithAvatar: {
    marginLeft: 38,
  },
  singleBubble: {
    borderRadius: radius.lg,
  },
  mineTop: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: spacing.sm,
  },
  mineMiddle: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: spacing.sm,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: spacing.sm,
  },
  mineBottom: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: spacing.sm,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  theirsTop: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderBottomLeftRadius: spacing.sm,
    borderBottomRightRadius: radius.lg,
  },
  theirsMiddle: {
    borderTopLeftRadius: spacing.sm,
    borderTopRightRadius: radius.lg,
    borderBottomLeftRadius: spacing.sm,
    borderBottomRightRadius: radius.lg,
  },
  theirsBottom: {
    borderTopLeftRadius: spacing.sm,
    borderTopRightRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
});
