import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MessageBubble } from '@/components/chat/MessageBubble';
import type { ChatRenderableItem } from '@/components/chat/chat-presenters';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

export type ChatToolItem = {
  id: string;
  label: string;
  onPress: () => void;
  selected?: boolean;
};

export type ChatToolSection = {
  id: string;
  items: ChatToolItem[];
  title: string;
};

type ChatThreadProps = {
  attachmentSummaryLabel?: string;
  canSend: boolean;
  context: ReactNode;
  draft: string;
  items: ChatRenderableItem[];
  onChangeDraft: (value: string) => void;
  onSend: () => void;
  onToggleTools: () => void;
  placeholder: string;
  statusBanner?: ReactNode;
  toolSections: ChatToolSection[];
  toolsOpen: boolean;
};

export function ChatThread({
  attachmentSummaryLabel,
  canSend,
  context,
  draft,
  items,
  onChangeDraft,
  onSend,
  onToggleTools,
  placeholder,
  statusBanner,
  toolSections,
  toolsOpen,
}: ChatThreadProps) {
  const listItems = useMemo(() => [...items].reverse(), [items]);

  return (
    <View style={styles.container}>
      <View style={styles.threadChrome}>
        {context}
        {statusBanner}
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={listItems}
        inverted
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.id}
        maintainVisibleContentPosition={{
          autoscrollToTopThreshold: 40,
          minIndexForVisible: 0,
        }}
        renderItem={({ item }) =>
          item.kind === 'separator' ? (
            <View style={styles.separatorRow}>
              <Text style={styles.separatorText}>{item.label}</Text>
            </View>
          ) : item.kind === 'event' ? (
            <View style={styles.eventRow}>
              <View style={styles.eventPill}>
                <Text style={styles.eventText}>{item.label}</Text>
                <Text style={styles.eventTime}>{item.timeLabel}</Text>
              </View>
            </View>
          ) : (
            <MessageBubble
              avatarMode={item.avatarMode}
              clusterPosition={item.clusterPosition}
              body={item.text}
              mine={item.mine}
              photoUrls={item.photoUrls}
              sender={item.sender}
              senderAvatarUrl={item.senderAvatarUrl}
              showSender={item.showSender}
              showTimestamp={item.showTimestamp}
              timeLabel={item.timeLabel}
            />
          )
        }
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />

      <View style={styles.composerDock}>
        {toolsOpen ? (
          <View style={styles.toolTray}>
            {toolSections.map((section) => (
              <View key={section.id} style={styles.toolSection}>
                <Text style={styles.toolSectionTitle}>{section.title}</Text>
                <View style={styles.toolRow}>
                  {section.items.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={item.onPress}
                      style={({ pressed }) => [
                        styles.toolChip,
                        item.selected ? styles.toolChipSelected : null,
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <Text style={[styles.toolChipText, item.selected ? styles.toolChipTextSelected : null]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {attachmentSummaryLabel ? (
          <View style={styles.attachmentSummary}>
            <Ionicons color={colors.primary} name="images-outline" size={14} />
            <Text style={styles.attachmentSummaryText}>{attachmentSummaryLabel}</Text>
          </View>
        ) : null}

        <View style={styles.composerRow}>
          <Pressable
            accessibilityLabel={toolsOpen ? 'Hide composer tools' : 'Show composer tools'}
            accessibilityRole="button"
            onPress={onToggleTools}
            style={({ pressed }) => [
              styles.toolToggle,
              toolsOpen ? styles.toolToggleActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons color={toolsOpen ? colors.surface : colors.primary} name={toolsOpen ? 'close' : 'add'} size={20} />
          </Pressable>

          <View style={styles.inputShell}>
            <TextInput
              multiline
              onChangeText={onChangeDraft}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              textAlignVertical="center"
              value={draft}
            />
          </View>

          <Pressable
            accessibilityLabel="Send message"
            accessibilityRole="button"
            disabled={!canSend}
            onPress={onSend}
            style={({ pressed }) => [
              styles.sendButton,
              canSend ? styles.sendButtonEnabled : styles.sendButtonDisabled,
              pressed && canSend ? styles.pressed : null,
            ]}
          >
            <Ionicons color={canSend ? colors.surface : colors.textMuted} name="arrow-up" size={18} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EA',
  },
  threadChrome: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  separatorRow: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  separatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    overflow: 'hidden',
  },
  eventRow: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  eventPill: {
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  eventText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  eventTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  composerDock: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(227, 231, 227, 0.9)',
    backgroundColor: 'rgba(249, 246, 240, 0.98)',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  toolTray: {
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(227, 231, 227, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: spacing.md,
  },
  toolSection: {
    gap: spacing.sm,
  },
  toolSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  toolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  toolChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  toolChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  toolChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  toolChipTextSelected: {
    color: colors.primary,
  },
  attachmentSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  attachmentSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  toolToggle: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolToggleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  inputShell: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    justifyContent: 'center',
  },
  input: {
    maxHeight: 96,
    fontSize: 15,
    lineHeight: 20,
    color: colors.text,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonEnabled: {
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(220, 233, 225, 0.8)',
  },
  pressed: {
    opacity: 0.84,
  },
});
