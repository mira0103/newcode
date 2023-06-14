import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';
import { AppAccountInfo } from '../@shared/models/app-account-info.model';
import { Post, PostShareType } from '../@shared/models/post.model';
import { AuthService } from '../@shared/services/auth/auth.service';
import { LoadingService } from '../@shared/services/loading/loading';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { TimelineService } from '../@shared/services/timeline/timeline.service';
import { UploadService } from '../@shared/services/upload/upload.service';
import { FilterEventsService } from '../@shared/services/filter-events/filter-events.service';
import { TimelineEvent } from '../@shared/enums/timeline-event.enum';

@Component({
  selector: 'app-post-info',
  templateUrl: './post-info.page.html',
  styleUrls: ['./post-info.page.scss'],
})
export class PostInfoPage implements OnInit {
  data: Post = {
    username: '',
    postBy: '',
    posterPhoto: '',
    description: '',
    videoUrl: '',
    shareWith: PostShareType.Public,
    canComment: true,
    hashtags: [],
    createdAt: new Date(),

    likes: {},
    bookmarks: {},
    views: {},
    sharing: {},
    comments: [],
  };

  currentAccountInfo: AppAccountInfo = new AppAccountInfo();

  isPostSharing = false;
  selectedPostId = null;

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private loadingService: LoadingService,
    private tempStorageService: TempStorageService,
    private uploadService: UploadService,
    private timelineService: TimelineService,
    private filterEventsService: FilterEventsService,
  ) { }

  ngOnInit() {
    (async () => {
      this.currentAccountInfo = await this.authService.getCurrentAccountInfo();
      this.isPostSharing = this.tempStorageService.get(TempStorageKey.IsPostSharing);
      this.selectedPostId = this.tempStorageService.get(TempStorageKey.SelectedPostId);

      if (this.isPostSharing) {
        const post = await this.timelineService.getPostPromise(this.selectedPostId);
        this.data = {
          id: this.selectedPostId,
          username: this.currentAccountInfo.username,
          postBy: this.currentAccountInfo.uid,
          posterPhoto: this.currentAccountInfo.photo,
          description: post.description,
          videoUrl: post.videoUrl,
          shareWith: post.shareWith,
          canComment: post.canComment,
          hashtags: post.hashtags,
          createdAt: new Date(),

          likes: {},
          bookmarks: {},
          views: {},
          sharing: { [this.currentAccountInfo.uid]: true, ...post.sharing },
          comments: [],
        };
      }
    })();
  }

  ionViewDidLeave() {
    this.filterEventsService.set(TimelineEvent.Play);
  }

  async post() {

    try {
      if (!this.isPostSharing) {
        await this.loadingService.show('Uploading video...');
        const videoUrl = this.tempStorageService.get(TempStorageKey.AddNewPostVideoUrl);

        this.data.createdAt = new Date();
        this.data.username = this.currentAccountInfo.username;
        this.data.posterPhoto = this.currentAccountInfo.photo;
        this.data.postBy = this.currentAccountInfo.uid;
        this.data.hashtags = this.getAllHashtags(this.data.description);
        this.data.videoUrl = await this.uploadService.uploadVideo((this.currentAccountInfo).uid, videoUrl);

        await this.loadingService.show('Saving post...');
        const result = await this.timelineService.addPost(this.data);
        await this.timelineService.initializePostLikes(result.id);

        if (result) {
          await this.loadingService.hide();
          this.navCtrl.navigateRoot(['./tabs']);
        }
      } else {
        await this.loadingService.show('Uploading video...');
        await this.timelineService.sharePost(this.data);
        await this.loadingService.hide();
        this.navCtrl.navigateRoot(['./tabs']);
      }
    } catch (error) {
      console.error('PostInfoPage -> post -> error', error);
    }
  }

  getAllHashtags(inputString) {
    const regex = /(^|\s)(#[a-z\d-]+)/gi;
    return inputString.split(regex).filter(str => str.startsWith('#'));
  }
}
