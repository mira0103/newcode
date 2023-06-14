import { firestore } from 'firebase/app';

import { NotificationEvent } from '../enums/notification-event.enum';

export class Notification {
    id?: string;
    icon?: string;

    event: NotificationEvent;

    userId: string;
    userFullName: string;
    userPhotoUrl: string;

    ownerUsername: string;

    postId: string;
    createdAt: Date | firestore.Timestamp;

    /* Appends after full name like
     * 'Samantha Smith' + ' liked your video.'
     * 'Samantha Smith' + ' commented your video.'
     */
    action?: string;

    reads: { [key: string]: boolean };
}
