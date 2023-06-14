import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import { firestore } from 'firebase/app';

import { Chat, ChatMessage } from '../../models/chat.model';
import { AppAccountInfo } from '../../models/app-account-info.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private afStore: AngularFirestore) { }

  private mapChats(posts$: Observable<DocumentChangeAction<any>[]>): Observable<Chat[]> {
    return posts$.pipe(
      debounceTime(300),
      map(actions => {
        return actions.map(action => {
          return { id: action.payload.doc.id, ...action.payload.doc.data() } as Chat;
        }).map(chat => {
          if (chat.messages.length > 0) {
            const lastMessage = chat.messages[chat.messages.length - 1];
            chat.lastMessage = {
              text: lastMessage.text,
              createdAt: (lastMessage.createdAt as firestore.Timestamp).toDate(),
            };
          } else {
            chat.lastMessage = {
              text: '',
              createdAt: null,
            };
          }

          return chat;
        });
      }),
    );
  }

  getChats(currentUserId: string): Observable<Chat[]> {
    const messages$ = this.afStore.collection('chats', ref => ref.where('users.' + currentUserId, '==', true)).snapshotChanges();
    return this.mapChats(messages$);
  }

  addChat(recipient: AppAccountInfo, sender: AppAccountInfo) {
    const chatActions$ = this.afStore.collection('chats', ref => {
      return ref
        .where(`users.${recipient.uid}`, '==', true)
        .where(`users.${sender.uid}`, '==', true);
    }).snapshotChanges();
    const chats$ = this.mapChats(chatActions$);

    chats$.subscribe(chats => {
      if (chats.length === 0) {
        const newChat: Chat = {
          createdByUserId: sender.uid,

          recipientName: recipient.name,
          recipientPhotoUrl: recipient.photo,

          senderName: sender.name,
          senderPhotoUrl: sender.photo,

          messages: [],

          users: {
            [recipient.uid]: true,
            [sender.uid]: true,
          }

        };
        this.afStore.collection('chats').add(newChat);
      }
    });
  }

  addChatAsync(recipient: AppAccountInfo, sender: AppAccountInfo): Promise<string> {
    const chatActions$ = this.afStore.collection('chats', ref => {
      return ref
        .where(`users.${recipient.uid}`, '==', true)
        .where(`users.${sender.uid}`, '==', true);
    }).snapshotChanges();
    const chats$ = this.mapChats(chatActions$);


    return new Promise((resolve, reject) => {
      chats$.subscribe(chats => {
        if (chats.length === 0) {
          const newChat: Chat = {
            createdByUserId: sender.uid,

            recipientName: recipient.name,
            recipientPhotoUrl: recipient.photo,

            senderName: sender.name,
            senderPhotoUrl: sender.photo,

            messages: [],

            users: {
              [recipient.uid]: true,
              [sender.uid]: true,
            }

          };

          this.afStore.collection('chats').add(newChat).then(doc => {
            resolve(doc.id);
          }, error => {
            reject(error);
          });
        }
      }, error => {
        reject(error);
      });
    });
  }

  async sendMessage(chatId: string, currentUserId: string, text: string) {
    try {
      const chatDocument = await this.afStore.doc(`chats/${chatId}`).get().toPromise();
      const chat: Chat = chatDocument.data() as Chat;

      const newMessage: ChatMessage = {
        createdAt: new Date(),
        text,
        unread: true,
        userId: currentUserId,
      };
      chat.messages.push(newMessage);

      return await this.afStore.collection('chats').doc(chatId).update({ messages: chat.messages });
    } catch (error) {
      console.error('ChatService -> sendMessage -> error', error);
    }
  }

  readMessages(chatId: string, currentUserId: string): Observable<Chat> {
    const chat$: Observable<Chat> = this.afStore.doc(`chats/${chatId}`).valueChanges() as Observable<Chat>;
    chat$.pipe(
      tap((chat: Chat) => {
        const messages: ChatMessage[] = chat.messages.filter((message: ChatMessage) => {
          return message.userId !== currentUserId;
        }).map((message: ChatMessage) => {
          message.unread = false;
          return message;
        });

        if (messages.length > 0) {
          this.afStore.doc(`chats/${chatId}`).update({ messages });
        }
      })
    );
    return chat$.pipe(
      map(chat => {
        chat.messages = chat.messages.map(message => {
          message.createdAt = (message.createdAt as firestore.Timestamp).toDate();
          return message;
        });
        return chat;
      })
    );
  }
}
