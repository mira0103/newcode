import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { flatten, uniq } from 'lodash';
import { Subscription } from 'rxjs';

import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';
import { GroupedPost } from '../@shared/models/grouped-post.model';
import { Post } from '../@shared/models/post.model';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { TimelineService } from '../@shared/services/timeline/timeline.service';
import { VideoviewPage } from '../videoview/videoview.page';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.page.html',
  styleUrls: ['./video-list.page.scss'],
})
export class VideoListPage implements OnInit {
  groupedPost: GroupedPost = new GroupedPost();

  postsSubscription: Subscription;

  constructor(
    private modalController: ModalController,
    private tempStorageService: TempStorageService,
    private timelineService: TimelineService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    const hashtagSelected: string = this.tempStorageService.get(TempStorageKey.Hashtags);

    this.postsSubscription = this.timelineService.getRelatedPosts().subscribe((posts: Post[]) => {
      const hashtags: Array<string[]> = posts.map(tempPost => tempPost.hashtags);
      const flattenedHashtags: string[] = flatten(hashtags);
      const uniqHashtags: string[] = uniq(flattenedHashtags);
      const groupedPosts = uniqHashtags.map(hashtag => {
        return {
          hashtag,
          posts: posts.filter(tempPost => {
            if (tempPost.hashtags.find(tempPostHashtag => tempPostHashtag === hashtag)) {
              return true;
            }

            return null;
          }),
        };
      });
      this.groupedPost = groupedPosts.find(groupedPost => groupedPost.hashtag === hashtagSelected);
    }, error => {
      console.error('ExplorePage -> ngOnInit -> error', error);
    });
  }

  ionViewDidLeave() {
    this.tempStorageService.set(TempStorageKey.Hashtags, null);
    this.postsSubscription.unsubscribe();
  }

  video_view() {
    this.modalController.create({ component: VideoviewPage }).then((modalElement) => {
      modalElement.present();
    });
  }
}
