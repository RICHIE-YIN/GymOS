export enum ThreadType {
  CLIENT_TRAINER = 'CLIENT_TRAINER',
  SUPPORT = 'SUPPORT',
  GROUP = 'GROUP',
}

export enum SenderType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  AI = 'AI',
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export enum AttachmentType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  WORKOUT_PLAN = 'WORKOUT_PLAN',
  MEAL_PLAN = 'MEAL_PLAN',
  CHECK_IN = 'CHECK_IN',
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  attachmentType: AttachmentType;
  url: string;
  fileName?: string | null;
  fileSizeBytes?: number | null;
  mimeType?: string | null;
  referenceId?: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderType: SenderType;
  content: string;
  status: MessageStatus;
  isEdited: boolean;
  editedAt?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  replyToMessageId?: string | null;
  readAt?: string | null;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
  attachments?: MessageAttachment[];
}

export interface MessageThread {
  id: string;
  threadType: ThreadType;
  clientId?: string | null;
  trainerId?: string | null;
  subject?: string | null;
  lastMessageAt?: string | null;
  lastMessagePreview?: string | null;
  isArchived: boolean;
  clientUnreadCount: number;
  trainerUnreadCount: number;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}
