import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';
import { Post } from '../@shared/models/post.model';
import { AccountService } from '../@shared/services/account/account.service';
import { AuthService } from '../@shared/services/auth/auth.service';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { TimelineService } from '../@shared/services/timeline/timeline.service';
import { CommentPage } from '../comment/comment.page';

@Component({
  selector: 'app-videoview',
  templateUrl: './videoview.page.html',
  styleUrls: ['./videoview.page.scss'],
})
export class VideoviewPage implements OnInit {
  favorite_icon = false;
  option1 = {
    loop: true,
    direction: 'vertical'
  };
  currentUser: firebase.User;

  postId = '';
  post: Post = new Post();

  postSubscription: Subscription;
  likesSubscription: Subscription;

  following: { [key: string]: boolean } = {};
  likes: { [key: string]: boolean } = {};

  constructor(
    private route: Router,
    private modalController: ModalController,
    private tempStorageService: TempStorageService,
    private timelineService: TimelineService,
    private authService: AuthService,
    private accountService: AccountService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.currentUser = this.authService.currentUserSync();
    this.postId = this.tempStorageService.get(TempStorageKey.SelectedPostId);
    this.postSubscription = this.timelineService.getPost(this.postId).subscribe(post => this.post = post);

    this.loadCurrentAccountFollowers();
  }

  ionViewWillLeave() {
    this.post = new Post();
    this.postSubscription.unsubscribe();
    this.likesSubscription.unsubscribe();
  }

  async loadCurrentAccountFollowers() {
    const currentAccountInfo = await this.authService.getCurrentAccountInfo();
    this.following = currentAccountInfo.following;

    this.likesSubscription = this.timelineService.getLikes().subscribe(likes => {
      console.log('HomePage -> loadCurrentAccountFollowers -> likes', likes);
      this.likes = likes;
    }, error => {
      console.log('HomePage -> loadCurrentAccountFollowers -> error', error);
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async toggleLike(post: Post) {
    const isLiked = this.isLiked(post.id);
    if (!isLiked) {
      await this.timelineService.likePost(post.id, this.currentUser.uid);
    } else {
      await this.timelineService.dislikePost(post.id, this.currentUser.uid);
    }
  }

  isLiked(postId: string): boolean {
    if (this.likes) {
      if (this.likes[postId] && this.likes[postId][this.currentUser.uid]) {
        return true;
      }
    }

    return false;
  }

  async toggleFollow(post: Post) {
    const isFollowing = await this.accountService.isFollowing(this.currentUser.uid, post.postBy);
    if (this.currentUser.uid !== post.postBy) {
      if (!isFollowing) {
        await this.accountService.follow(this.currentUser.uid, post.postBy);
      } else {
        await this.accountService.unfollow(this.currentUser.uid, post.postBy);
      }
    }
  }

  async toggleBookmark(post: Post) {
    const isBookmarked = this.isBookmarked(post.bookmarks);
    if (!isBookmarked) {
      await this.timelineService.bookmarkPost(post.id, this.currentUser.uid);
    } else {
      await this.timelineService.undoBookmarkPost(post.id, this.currentUser.uid);
    }
  }

  isBookmarked(bookmarks: { [key: string]: boolean }): boolean {
    if (bookmarks) {
      if (bookmarks[this.currentUser.uid]) {
        return true;
      }
    }

    return false;
  }

  countBookmarks(bookmarks: { [key: string]: boolean }) {
    return Object.keys(bookmarks).length;
  }

  async addView(post: Post) {
    const isViewed = this.isViewed(post.views);
    if (post && this.currentUser.uid !== post.postBy) {
      if (!isViewed) {
        await this.timelineService.viewPost(post.id, post.postBy);
      }
    }
  }

  isViewed(views: { [key: string]: boolean }): boolean {
    if (views) {
      if (views[this.currentUser.uid]) {
        return true;
      }
    }

    return false;
  }

  toggleFavorite_icon() {
    this.favorite_icon = !this.favorite_icon;
  }

  user_profile() {
    this.modalController.dismiss();
    this.route.navigate(['./user-profile']);
  }

  videos_list() {
    this.modalController.dismiss();
    this.route.navigate(['./video-list']);
  }

  comment(postId: string) {
    this.modalController.create({ component: CommentPage, componentProps: { postId } }).then((modalElement) => {
      modalElement.present();
    });
  }

  async sharePost(post: Post) {
    await this.tempStorageService.set(TempStorageKey.IsPostSharing, true);
    await this.tempStorageService.set(TempStorageKey.SelectedPostId, post.id);
    await this.tempStorageService.set(TempStorageKey.AddNewPostVideoUrl, post.videoUrl);
    await this.route.navigate([ '/filter' ]);
  }
}
