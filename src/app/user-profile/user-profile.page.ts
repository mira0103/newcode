import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ScrollDetail } from '@ionic/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subscription } from 'rxjs';

import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';
import { AppAccountInfo } from '../@shared/models/app-account-info.model';
import { Post } from '../@shared/models/post.model';
import { AccountService } from '../@shared/services/account/account.service';
import { AuthService } from '../@shared/services/auth/auth.service';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { TimelineService } from '../@shared/services/timeline/timeline.service';
import { VideoviewPage } from '../videoview/videoview.page';
import { ChatService } from '../@shared/services/chat/chat.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage implements OnInit { 
  showToolbar = false;

  viewType: string;

  appAccountInfo: AppAccountInfo = new AppAccountInfo();
  isLoading = true;

  selectedTab = 'home';
  userPosts: Post[] = [];
  bookmarkedPosts: Post[] = [];

  likedPosts = 0;

  userPostsSubscription: Subscription;
  bookmarkedPostsSubscription: Subscription;
  likedPostsSubscription: Subscription;

  currentAccountInfo: AppAccountInfo;
  selectedUserAccountId: string;

  constructor(
    private route: Router,
    private modalController: ModalController,
    private afStore: AngularFirestore,
    private tempStorageService: TempStorageService,
    private timelineService: TimelineService,
    private accountService: AccountService,
    private authService: AuthService,
    private chatService: ChatService,
  ) {
    this.appAccountInfo.photo = null;
    this.appAccountInfo.name = '-';
    this.appAccountInfo.username = '-';
    this.appAccountInfo.bio = '-';
    this.appAccountInfo.followers = {};
    this.appAccountInfo.following = {};
  }

  ngOnInit() {
    this.authService.getCurrentAccountInfoObservable().subscribe(currentUser => {
      this.currentAccountInfo = currentUser;
    }, error => {
      console.error('UserProfilePage -> ngOnInit -> error', error);
    });
  }

  ionViewWillEnter() {
    (async () => {
      this.selectedUserAccountId = this.tempStorageService.get(TempStorageKey.SelectedUserAccountId);
      const accountInfoDocument = this.afStore.collection('accounts').doc(this.selectedUserAccountId);
      const accountInfoSnapshot = await accountInfoDocument.get().toPromise();

      if (accountInfoSnapshot.exists) {
        this.appAccountInfo = accountInfoSnapshot.data() as AppAccountInfo;
        this.isLoading = false;
      }

      this.userPostsSubscription = this.timelineService.getUserPosts(this.selectedUserAccountId).subscribe(posts => this.userPosts = posts);
      this.bookmarkedPostsSubscription = this.timelineService.getBookmarkedPosts(this.selectedUserAccountId).subscribe(posts => {
        this.bookmarkedPosts = posts;
      });
      this.likedPostsSubscription = this.timelineService.getLikedPosts(this.selectedUserAccountId).subscribe(posts => {
        this.likedPosts = posts.length;
      });
    })();
  }

  ionViewDidLeave() {
    this.userPosts = [];
    this.bookmarkedPosts = [];
    this.likedPosts = 0;
    this.userPostsSubscription.unsubscribe();
    this.bookmarkedPostsSubscription.unsubscribe();
    this.likedPostsSubscription.unsubscribe();
  }

  getLength(obj: object): number {
    return Object.keys(obj).length;
  }

  isTabSelected(tab: string) {
    return this.selectedTab === tab;
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  openSocialMedia(socialMedia: string, id: string) {
    window.open(`https://${socialMedia}.com/${id}`, '_blank');
  }

  onScroll($event: CustomEvent<ScrollDetail>) {
    if ($event && $event.detail && $event.detail.scrollTop) {
      const scrollTop = $event.detail.scrollTop;
      this.showToolbar = scrollTop >= 250;
    }
  }

  async chat() {
    const recipient = await this.accountService.getAccountInfoById(this.selectedUserAccountId);
    const chatId = await this.chatService.addChatAsync(recipient, this.currentAccountInfo);
    console.log('UserProfilePage -> chat -> chatId', chatId);
    await this.tempStorageService.set(TempStorageKey.SelectedChatId, chatId);
    this.route.navigate(['./chat']);
  }

  followers() {
    this.route.navigate(['./followers']);
  }

  async toggleFollow() {
    const isFollowing = await this.accountService.isFollowing(this.currentAccountInfo.uid, this.selectedUserAccountId);
    if (this.currentAccountInfo.uid !== this.selectedUserAccountId) {
      if (!isFollowing) {
        await this.accountService.follow(this.currentAccountInfo.uid, this.selectedUserAccountId);
      } else {
        await this.accountService.unfollow(this.currentAccountInfo.uid, this.selectedUserAccountId);
      }
    }
  }

  get isFollowed(): boolean {
    if (this.currentAccountInfo) {
      if (this.currentAccountInfo.following && this.currentAccountInfo.following[this.selectedUserAccountId]) {
        return true;
      }
    }

    return false;
  }

  video_view(){
    this.modalController.create({ component: VideoviewPage }).then((modalElement) => {
      modalElement.present();
    });
  }
}
