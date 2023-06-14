import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { ScrollDetail } from '@ionic/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subscription } from 'rxjs';

import { ProfileSaveType } from '../@shared/enums/profile-save-type.enum';
import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';
import { AppAccountInfo } from '../@shared/models/app-account-info.model';
import { Post } from '../@shared/models/post.model';
import { AuthService } from '../@shared/services/auth/auth.service';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { TimelineService } from '../@shared/services/timeline/timeline.service';
import { APP_CONFIG, AppConfig } from '../app.config';
import { VideoviewPage } from '../videoview/videoview.page';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],
})
export class MyProfilePage implements OnInit {
  viewType: string;
  showToolbar = false;

  appAccountInfo: AppAccountInfo = new AppAccountInfo();
  isLoading = true;

  selectedTab = 'home';
  userPosts: Post[] = [];
  bookmarkedPosts: Post[] = [];

  likedPosts: any[] = [];

  userPostsSubscription: Subscription;
  bookmarkedPostsSubscription: Subscription;
  likesSubscription: Subscription;

  constructor(
    @Inject(APP_CONFIG) public config: AppConfig,
    private route: Router,
    private modalController: ModalController,
    private navCtrl: NavController,
    private afStore: AngularFirestore,
    private authService: AuthService,
    private tempStorageService: TempStorageService,
    private timelineService: TimelineService,
  ) {
    this.appAccountInfo.photo = null;
    this.appAccountInfo.name = '-';
    this.appAccountInfo.username = '-';
    this.appAccountInfo.bio = '-';
    this.appAccountInfo.followers = {};
    this.appAccountInfo.following = {};
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    (async () => {
      const user = await this.authService.currentUser();
      const accountInfoDocument = this.afStore.collection('accounts').doc(user.uid);
      const accountInfoSnapshot = await accountInfoDocument.get().toPromise();

      if (accountInfoSnapshot.exists) {
        this.appAccountInfo = accountInfoSnapshot.data() as AppAccountInfo;
        this.isLoading = false;
      }

      this.userPostsSubscription = this.timelineService.getUserPosts(user.uid).subscribe(posts => this.userPosts = posts);
      this.bookmarkedPostsSubscription = this.timelineService.getBookmarkedPosts(user.uid).subscribe(posts => this.bookmarkedPosts = posts);
      this.likesSubscription = this.timelineService.getLikedPosts2(user.uid).subscribe(likedPosts => this.likedPosts = likedPosts);
    })();
  }

  ionViewDidLeave() {
    this.userPosts = [];
    this.bookmarkedPosts = [];
    this.likedPosts = [];
    this.userPostsSubscription.unsubscribe();
    this.bookmarkedPostsSubscription.unsubscribe();
    this.likesSubscription.unsubscribe();
  }

  onScroll($event: CustomEvent<ScrollDetail>) {
    if ($event && $event.detail && $event.detail.scrollTop) {
      const scrollTop = $event.detail.scrollTop;
      this.showToolbar = scrollTop >= 250;
    }
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
    if (socialMedia) {
      window.open(`https://${socialMedia}.com/${id}`, '_blank');
    }
  }

  setViewType(vt) {
    this.viewType = vt;
  }

  edit_profile() {
    this.tempStorageService.set(TempStorageKey.ProfileSaveType, ProfileSaveType.Update);
    this.route.navigate(['./edit-profile']);
  }

  help() {
    this.route.navigate(['./help']);
  }

  terms_conditions() {
    this.route.navigate(['./terms-conditions']);
  }

  select_language() {
    this.route.navigate(['./select-language']);
  }

  async log_out() {
    this.authService.signOut();
    this.navCtrl.navigateRoot(['./sign-in']);
  }

  video_view() {
    this.modalController.create({ component: VideoviewPage }).then((modalElement) => {
      modalElement.present();
    });
  }

  buyAppAction() {
    window.open('http://bit.ly/cc2_qvid', '_system', 'location=no');
  }
}
