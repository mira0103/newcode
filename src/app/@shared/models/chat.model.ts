import { firestore } from 'firebase/app';

export class Chat {
    id?: string;

    createdByUserId: string;

    recipientName: string;
    recipientPhotoUrl: string;

    senderName: string;
    senderPhotoUrl: string;

    messages: ChatMessage[];
    users: { [key: string]: boolean; };

    lastMessage?: {
        text?: string;
        createdAt: Date;
    };
}

export class ChatMessage {
    createdAt: Date | firestore.Timestamp;
    text: string;
    unread: boolean;
    userId: string;
}
