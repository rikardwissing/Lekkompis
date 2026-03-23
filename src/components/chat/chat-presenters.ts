import type { Message } from '@/store/app-store';

export type ChatClusterPosition = 'single' | 'top' | 'middle' | 'bottom';

export type ChatDateSeparatorItem = {
  id: string;
  kind: 'separator';
  label: string;
};

export type ChatMessageItem = {
  avatarMode: 'none' | 'spacer' | 'visible';
  clusterPosition: ChatClusterPosition;
  id: string;
  kind: 'message';
  mine: boolean;
  photoUrls: string[];
  sender: string;
  senderAvatarUrl?: string;
  showSender: boolean;
  showTimestamp: boolean;
  text?: string;
  timeLabel: string;
};

export type ChatRenderableItem = ChatDateSeparatorItem | ChatMessageItem;

type BuildChatRenderableItemsInput = {
  avatarBySender?: Record<string, string | undefined>;
  currentSenderName: string;
  messages: Message[];
  threadKind: 'direct' | 'group';
};

const sameDay = (left: number, right: number) => {
  const leftDate = new Date(left);
  const rightDate = new Date(right);

  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  );
};

const formatDayLabel = (timestamp: number) =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(timestamp));

const formatTimeLabel = (timestamp: number) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));

const getClusterPosition = (hasPreviousSibling: boolean, hasNextSibling: boolean): ChatClusterPosition => {
  if (hasPreviousSibling && hasNextSibling) {
    return 'middle';
  }

  if (hasPreviousSibling) {
    return 'bottom';
  }

  if (hasNextSibling) {
    return 'top';
  }

  return 'single';
};

export const buildChatRenderableItems = ({
  avatarBySender = {},
  currentSenderName,
  messages,
  threadKind,
}: BuildChatRenderableItemsInput): ChatRenderableItem[] => {
  const items: ChatRenderableItem[] = [];

  messages.forEach((message, index) => {
    const previousMessage = messages[index - 1];
    const nextMessage = messages[index + 1];

    if (!previousMessage || !sameDay(previousMessage.createdAt, message.createdAt)) {
      items.push({
        id: `separator-${message.id}`,
        kind: 'separator',
        label: formatDayLabel(message.createdAt),
      });
    }

    const mine = message.sender === currentSenderName;
    const sameSenderAsPrevious =
      Boolean(previousMessage) &&
      previousMessage.sender === message.sender &&
      sameDay(previousMessage.createdAt, message.createdAt);
    const sameSenderAsNext =
      Boolean(nextMessage) &&
      nextMessage.sender === message.sender &&
      sameDay(nextMessage.createdAt, message.createdAt);
    const isGroup = threadKind === 'group';

    items.push({
      avatarMode: !isGroup || mine ? 'none' : sameSenderAsNext ? 'spacer' : 'visible',
      clusterPosition: getClusterPosition(sameSenderAsPrevious, sameSenderAsNext),
      id: message.id,
      kind: 'message',
      mine,
      photoUrls: message.photoUrls ?? [],
      sender: message.sender,
      senderAvatarUrl: avatarBySender[message.sender],
      showSender: isGroup && !mine && !sameSenderAsPrevious,
      showTimestamp: !sameSenderAsNext,
      text: message.body,
      timeLabel: formatTimeLabel(message.createdAt),
    });
  });

  return items;
};
