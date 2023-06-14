import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from 'angularfire2/firestore';
import { firestore } from 'firebase/app';
import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import { NotificationEvent } from '../../enums/notification-event.enum';
import { AppAccountInfo } from '../../models/app-account-info.model';
import { Notification } from '../../models/notification.model';
import { Post } from '../../models/post.model';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private afStore: AngularFirestore) { }

  private mapNotifications(notifications$: Observable<DocumentChangeAction<any>[]>): Observable<Notification[]> {
    return notifications$.pipe(
      debounceTime(300),
      map(actions => {
        return actions.map(action => {
          return { id: action.payload.doc.id, ...action.payload.doc.data() } as Notification;
        }).map(notification => {
          notification.createdAt = (notification.createdAt as firestore.Timestamp).toDate();
          return notification;
        }).map(notification => {
          if (notification.event === NotificationEvent.Like) {
            notification.action = ' liked your video.';
            notification.icon = 'zmdi-favorite';
          } else if (notification.event === NotificationEvent.Comment) {
            notification.action = ' commented on your video.';
            notification.icon = 'zmdi-comment-alt';
          }

          return notification;
        });
      }),
    );
  }

  getNotifications() {
    const notifications$ = this.afStore.collection('notifications', ref => ref.orderBy('createdAt', 'desc')).snapshotChanges();
    return this.mapNotifications(notifications$);
  }

  async create(currentUserId: string, post: Post, event: NotificationEvent) {
    try {
      const currentAccountInfoDocument = await this.afStore.doc(`accounts/${currentUserId}`).get().toPromise();
      const currentAccountInfo: AppAccountInfo = currentAccountInfoDocument.data() as AppAccountInfo;

      const newNotification: Notification = {
        event,
        userId: currentAccountInfo.uid,
        userFullName: currentAccountInfo.name,
        userPhotoUrl: currentAccountInfo.photo,

        ownerUsername: post.username,

        postId: post.id,
        createdAt: new Date(),

        reads: {}
      };

      return await this.afStore.collection('notifications').add(newNotification);
    } catch (error) {
      console.error('NotificationService -> create -> error', error);
    }
  }
}
