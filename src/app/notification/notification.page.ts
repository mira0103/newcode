import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as firebase from 'firebase/app';

import { AppAccountInfo } from '../@shared/models/app-account-info.model';
import { Notification } from '../@shared/models/notification.model';
import { AuthService } from '../@shared/services/auth/auth.service';
import { NotificationService } from '../@shared/services/notification/notification.service';
import { ModalController } from '@ionic/angular';
import { SearchUserPage } from '../search-user/search-user.page';
import { Chat } from '../@shared/models/chat.model';
import { ChatService } from '../@shared/services/chat/chat.service';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {
  tab = 'notifications';

  currentUser: firebase.User;

  notifications: Notification[] = [];
  notificationsSubscription: Subscription;

  chats: Chat[] = [];
  chatsSubscription: Subscription;

  constructor(
    private route: Router,
    private modalController: ModalController,
    private authService: AuthService,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private tempStorageService: TempStorageService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.currentUser = this.authService.currentUserSync();
    this.init();
  }

  ionViewDidLeave() {
    this.notifications = [];
    this.chats = [];
    this.notificationsSubscription.unsubscribe();
    this.chatsSubscription.unsubscribe();
  }

  async init() {
    const currentAccountInfo: AppAccountInfo = await this.authService.getCurrentAccountInfo();
    this.notificationsSubscription = this.notificationService.getNotifications().subscribe((notifications: Notification[]) => {
      this.notifications = notifications.filter(notification => {
        return currentAccountInfo.following[notification.userId] && notification;
      });
    });

    this.chatsSubscription = this.chatService.getChats(currentAccountInfo.uid).subscribe((chats: Chat[]) => {
      this.chats = chats;
    });
  }

  async searchUser() {
    const modal = await this.modalController.create({ component: SearchUserPage });
    await modal.present();
  }

  async viewChat(chatId: string) {
    await this.tempStorageService.set(TempStorageKey.SelectedChatId, chatId);
    this.route.navigate([ '/chat' ]);
  }
}
