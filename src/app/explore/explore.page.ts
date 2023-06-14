import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Subscription } from 'rxjs';
import { flatten, uniq } from 'lodash';

import { Post } from '../@shared/models/post.model';
import { TimelineService } from '../@shared/services/timeline/timeline.service';
import { VideoviewPage } from '../videoview/videoview.page';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';
import { GroupedPost } from '../@shared/models/grouped-post.model';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
})
export class ExplorePage implements OnInit {
  tempPosts: Post[] = [];
  searchedPosts: Post[] = [];
  groupedPosts: Array<GroupedPost> = [];

  postsSubscription: Subscription;

  isSearching = false;

  constructor(
    private route: Router,
    private modalController: ModalController,
    private timelineService: TimelineService,
    private keyboard: Keyboard,
    private tempStorageService: TempStorageService,
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.postsSubscription = this.timelineService.getRelatedPosts().subscribe((posts: Post[]) => {
      this.tempPosts = posts;
      this.searchedPosts = posts;

      const hashtags: Array<string[]> = this.tempPosts.map(tempPost => tempPost.hashtags);
      const flattenedHashtags: string[] = flatten(hashtags);
      const uniqHashtags: string[] = uniq(flattenedHashtags);
      this.groupedPosts = uniqHashtags.map(hashtag => {
        return {
          hashtag,
          posts: this.tempPosts.filter(tempPost => {
            if (tempPost.hashtags.find(tempPostHashtag => tempPostHashtag === hashtag)) {
              return true;
            }

            return null;
          }),
        };
      });
    }, error => {
      console.error('ExplorePage -> ngOnInit -> error', error);
    });
  }

  ionViewDidLeave() {
    this.tempPosts = [];
    this.searchedPosts = [];
    this.postsSubscription.unsubscribe();
  }

  search(searchValue: string) {
    if (searchValue.trim() !== '') {
      this.isSearching = true;
      this.searchedPosts = this.tempPosts.filter((tempPost: Post) => {
        if (tempPost.description) {
          return tempPost.description.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
        }
        return null;
      });
    } else {
      this.searchedPosts = [];
      this.isSearching = false;
    }
  }

  onSearchClear() {
    this.keyboard.hide();
  }

  stringTruncate(str: string) {
    const dots = str.length > 16 ? '...' : '';
    return str.substring(0, 16) + dots;
  }

  async videos_list(hashtag: string) {
    await this.tempStorageService.set(TempStorageKey.Hashtags, hashtag);
    this.route.navigate(['./video-list']);
  }

  async video_view(post: Post) {
    await this.tempStorageService.set(TempStorageKey.SelectedPostId, post.id);
    this.modalController.create({ component: VideoviewPage }).then((modalElement) => {
      modalElement.present();
    });
  }
}
