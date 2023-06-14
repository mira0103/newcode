import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AppAccountInfo } from '../@shared/models/app-account-info.model';
import { AccountService } from '../@shared/services/account/account.service';
import { AuthService } from '../@shared/services/auth/auth.service';
import { ChatService } from '../@shared/services/chat/chat.service';

@Component({
  selector: 'app-search-user',
  templateUrl: './search-user.page.html',
  styleUrls: ['./search-user.page.scss'],
})
export class SearchUserPage implements OnInit {
  tempAccounts: AppAccountInfo[] = [];
  accounts: AppAccountInfo[] = [];
  accountsSubscription: Subscription;

  constructor(
    private modalCtrl: ModalController,
    private authService: AuthService,
    private chatService: ChatService,
    private accountService: AccountService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    const currentUser = this.authService.currentUserSync();
    this.accountsSubscription = this.accountService.getAllAccounts().subscribe((accounts: AppAccountInfo[]) => {
      const filteredAccounts = accounts.filter(account => account.uid !== currentUser.uid);
      this.tempAccounts = [...filteredAccounts];
    });
  }

  ionViewDidLeave() {
    this.accounts = [];
    this.tempAccounts = [];
    this.accountsSubscription.unsubscribe();
  }

  search(searchValue: string) {
    this.accounts = this.tempAccounts.filter((tempAccount: AppAccountInfo) => {
        return tempAccount.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
    });
  }

  async addChat(recipient: AppAccountInfo) {
    const currentAccount = await this.authService.getCurrentAccountInfo();
    await this.chatService.addChat(recipient, currentAccount);
    await this.modalCtrl.dismiss();
  }
}
