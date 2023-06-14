import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonSlides, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';
import { Post } from '../@shared/models/post.model';
import { AccountService } from '../@shared/services/account/account.service';
import { AuthService } from '../@shared/services/auth/auth.service';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { TimelineService } from '../@shared/services/timeline/timeline.service';
import { APP_CONFIG, AppConfig } from '../app.config';
import { CommentPage } from '../comment/comment.page';
import { TimelineEventsService } from '../@shared/services/timeline-events/timeline-events.service';
import { TimelineEvent } from '../@shared/enums/timeline-event.enum';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('followingVideos', { static: false }) followingVideos: IonSlides;
  @ViewChild('relatedVideos', { static: false }) relatedVideos: IonSlides;

  tab = 'related';
  favorite_icon = false;
  like = false;

  option1 = {
    loop: true,
    direction: 'vertical',
  };

  posts: Post[] = [];
  followingPosts: Post[] = [];

  postsSubscription: Subscription;
  followingPostsSubscription: Subscription;
  likesSubscription: Subscription;

  followingActiveIndex = 0;
  relatedActiveIndex = 0;

  currentUser: firebase.User;

  following: { [key: string]: boolean } = {};
  likes: { [key: string]: boolean } = {};

  constructor(
    @Inject(APP_CONFIG) public config: AppConfig,
    private route: Router,
    private modalController: ModalController,
    private timelineService: TimelineService,
    private authService: AuthService,
    private accountService: AccountService,
    private tempStorageService: TempStorageService,
    private changeDetectorRef: ChangeDetectorRef,
    private timelineEventsService: TimelineEventsService,
  ) {}

  ngOnInit() {
    this.timelineEventsService.get().subscribe(timelineEvent => {
      if (timelineEvent === TimelineEvent.Play) {
        if (this.tab === 'following') {
          const followingVideos: NodeListOf<HTMLVideoElement> = document.querySelectorAll('.followingVideoPlayer');
          followingVideos.item(this.followingActiveIndex).play();
        } else if (this.tab === 'related') {
          const relatedVideos: NodeListOf<HTMLVideoElement> = document.querySelectorAll('.relatedVideoPlayer');
          relatedVideos.item(this.relatedActiveIndex).play();
        }
      } else if (timelineEvent === TimelineEvent.Pause) {
        if (this.tab === 'following') {
          const followingVideos: NodeListOf<HTMLVideoElement> = document.querySelectorAll('.followingVideoPlayer');
          followingVideos.item(this.followingActiveIndex).pause();
        } else if (this.tab === 'related') {
          const relatedVideos: NodeListOf<HTMLVideoElement> = document.querySelectorAll('.relatedVideoPlayer');
          relatedVideos.item(this.relatedActiveIndex).pause();
        }
      }
    });
  }

  ionViewWillEnter() {
    this.currentUser = this.authService.currentUserSync();

    this.loadCurrentAccountFollowers();
    this.loadRelatedPosts();
    this.loadFollowingPosts();
  }

  ionViewWillLeave() {
    this.timelineEventsService.set(TimelineEvent.Pause);
    this.postsSubscription.unsubscribe();
    this.followingPostsSubscription.unsubscribe();
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

  // async onFollowingVideoChange() {
  //   try {
  //     this.followingActiveIndex = await this.followingVideos.getActiveIndex();
  //     const previousIndex = await this.followingVideos.getPreviousIndex();

  //     const followingVideos: NodeListOf<HTMLVideoElement> = document.querySelectorAll('.followingVideoPlayer');
  //     const currentVideo = followingVideos.item(this.followingActiveIndex);
  //     currentVideo.play();

  //     const previousVideo = followingVideos.item(previousIndex);
  //     previousVideo.pause();
  //   } catch (error) {
  //     console.error('HomePage -> onRelatedVideoChange -> error', error);
  //   }
  // }

  async onFollowingVideoChange() {
    try {
      this.followingActiveIndex = await this.followingVideos.getActiveIndex();
      const previousIndex = await this.followingVideos.getPreviousIndex();
  
      const followingVideos: NodeListOf<HTMLVideoElement> = document.querySelectorAll('.followingVideoPlayer');
      const currentVideo = followingVideos.item(this.followingActiveIndex);
  
      if (currentVideo) {
        currentVideo.play();
      }
  
      const previousVideo = followingVideos.item(previousIndex);
      if (previousVideo) {
        previousVideo.pause();
      }
    } catch (error) {
      console.error('HomePage -> onRelatedVideoChange -> error', error);
    }
  }

  async onRelatedVideoChange() {
    try {
      this.relatedActiveIndex = await this.relatedVideos.getActiveIndex();
      const previousIndex = await this.relatedVideos.getPreviousIndex();

      const relatedVideos: NodeListOf<HTMLVideoElement> = document.querySelectorAll('.relatedVideoPlayer');
      const currentVideo = relatedVideos.item(this.relatedActiveIndex);
      currentVideo.play();

      const previousVideo = relatedVideos.item(previousIndex);
      previousVideo.pause();
    } catch (error) {
      console.error('HomePage -> onRelatedVideoChange -> error', error);
    }
  }

  async loadRelatedPosts() {
    this.postsSubscription = this.timelineService.getRelatedPosts().subscribe(posts => {
      this.posts = posts;
    }, error => {
      console.error('HomePage -> ngOnInit -> error', error);
    });
  }

  async loadFollowingPosts() {
    const currentAccountInfo = await this.authService.getCurrentAccountInfo();
    this.followingPostsSubscription = this.timelineService.getFollowingPosts().subscribe(followingPosts => {
      this.followingPosts = followingPosts.filter(post => {
        return Object.keys(currentAccountInfo.following).indexOf(post.postBy) > -1;
      });
    });
  }

  onChange(tab: string) {
    console.log('HomePage -> onChange -> tab', tab);
    this.changeDetectorRef.detectChanges();

    console.log('HomePage -> onChange -> followingVideos', this.followingVideos);
    console.log('HomePage -> onChange -> relatedVideos', this.relatedVideos);

    if (tab === 'following') {
      this.relatedActiveIndex = null;
    } else if (tab === 'related') {
      this.followingActiveIndex = null;
    }
  }

  toggleFavorite_icon() {
    this.favorite_icon = !this.favorite_icon;
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

  async toggleFollow(post: Post) {
    const isFollowing = await this.accountService.isFollowing(this.currentUser.uid, post.postBy);
    if (this.currentUser.uid !== post.postBy) {
      if (!isFollowing) {
        await this.accountService.follow(this.currentUser.uid, post.postBy);
        this.following[post.postBy] = true;
      } else {
        await this.accountService.unfollow(this.currentUser.uid, post.postBy);
        delete this.following[post.postBy];
      }
    }
  }

  isFollowing(posterUserId: string): boolean {
    if (this.following[posterUserId]) {
      return true;
    }

    return false;
  }

  async addView(post: Post) {
    const isViewed = this.isViewed(post.views);
    if (this.currentUser.uid !== post.postBy) {
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

  user_profile(posterUserId: string) {
    this.tempStorageService.set(TempStorageKey.SelectedUserAccountId, posterUserId);
    this.route.navigate(['./user-profile']);
  }

  videos_list() {
    this.route.navigate(['./video-list']);
  }

  async sharePost(post: Post) {
    this.timelineEventsService.set(TimelineEvent.Pause);
    await this.tempStorageService.set(TempStorageKey.IsPostSharing, true);
    await this.tempStorageService.set(TempStorageKey.SelectedPostId, post.id);
    await this.tempStorageService.set(TempStorageKey.AddNewPostVideoUrl, post.videoUrl);
    await this.route.navigate([ '/filter' ]);
  }

  comment(postId: string) {
    console.log('HomePage -> comment -> postId', postId);
    this.modalController.create({ component: CommentPage, componentProps: { postId } }).then((modalElement) => {
      modalElement.present();
    });
  }

  buyAppAction() {
    window.open('http://bit.ly/cc2_qvid', '_system', 'location=no');
  }
}
