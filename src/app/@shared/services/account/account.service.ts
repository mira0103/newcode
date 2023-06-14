import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

import { AppAccountInfo } from '../../models/app-account-info.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(
    private afStore: AngularFirestore,
  ) { }

  getAllAccounts(): Observable<AppAccountInfo[]> {
    return this.afStore.collection('accounts').valueChanges() as Observable<AppAccountInfo[]>;
  }

  async getAccountInfoById(uid: string): Promise<AppAccountInfo> {
    try {
      const accountInfoDocument = await this.afStore.doc(`accounts/${uid}`).get().toPromise();
      return accountInfoDocument.data() as AppAccountInfo;
    } catch (error) {
      return null;
    }
  }

  async isFollowing(currentUserId: string, postedByUserId: string): Promise<boolean> {
    const accountInfo = await this.getAccountInfoById(postedByUserId);

    if (accountInfo.followers) {
      if (accountInfo.followers[currentUserId]) {
        return true;
      }
    }

    return false;
  }

  async follow(followerUserId: string, followeeUserId: string) {
    try {
      const accountInfo: AppAccountInfo = (await this.afStore.doc(`accounts/${followeeUserId}`).get().toPromise()).data() as AppAccountInfo;
      const followers = { [followerUserId]: true, ...accountInfo.followers };
      await this.afStore.doc('accounts/' + followeeUserId).update({ followers });

      const following = { [followeeUserId]: true, ...accountInfo.followers };
      await this.afStore.doc('accounts/' + followerUserId).update({ following });
    } catch (error) {
      console.error('AccountService -> follow -> error', error);
    }
  }

  async unfollow(followerUserId: string, followeeUserId: string) {
    try {
      const followedAccountInfo = (await this.afStore.doc(`accounts/${followeeUserId}`).get().toPromise()).data() as AppAccountInfo;
      delete followedAccountInfo.followers[followerUserId];
      await this.afStore.doc('accounts/' + followeeUserId).update({ followers: followedAccountInfo.followers });

      const currentAccountInfo = (await this.afStore.doc(`accounts/${followeeUserId}`).get().toPromise()).data() as AppAccountInfo;
      delete currentAccountInfo.followers[followeeUserId];
      await this.afStore.doc('accounts/' + followeeUserId).update({ following: currentAccountInfo.followers });

    } catch (error) {
      console.error('AccountService -> unfollow -> error', error);
    }
  }
}
