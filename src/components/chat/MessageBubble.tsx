import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

export function MessageBubble({ sender, body, mine = false }: { sender: string; body: string; mine?: boolean }) {
  return (
    <View style={[styles.wrapper, mine ? styles.mineWrap : styles.theirsWrap]}>
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        <Text style={styles.sender}>{sender}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  mineWrap: {
    alignItems: 'flex-end',
  },
  theirsWrap: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '84%',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  mine: {
    backgroundColor: colors.primarySoft,
  },
  theirs: {
    backgroundColor: colors.surface,
  },
  sender: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
  },
});
