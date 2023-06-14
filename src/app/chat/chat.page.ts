import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as firebase from 'firebase/app';

import { Chat } from '../@shared/models/chat.model';
import { ChatService } from '../@shared/services/chat/chat.service';
import { AuthService } from '../@shared/services/auth/auth.service';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  chat: Chat = new Chat();
  chatsSubscription: Subscription;

  selectedChatId: string;
  currentUser: firebase.User;

  data = { text: '' };

  constructor(
    private route: Router,
    private authService: AuthService,
    private chatService: ChatService,
    private tempStorageService: TempStorageService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.selectedChatId = this.tempStorageService.get(TempStorageKey.SelectedChatId);
    this.currentUser = this.authService.currentUserSync();
    this.chatsSubscription = this.chatService.readMessages(this.selectedChatId, this.currentUser.uid).subscribe((chat: Chat) => {
      this.chat = chat;
    });
  }

  ionViewDidLeave() {
    this.chat = new Chat();
    this.chatsSubscription.unsubscribe();
  }

  user_profile() {
    this.route.navigate(['./user-profile']);
  }

  async sendMessage() {
    await this.chatService.sendMessage(this.selectedChatId, this.currentUser.uid, this.data.text);
    this.data.text = '';
  }
}
