import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { firestore } from 'firebase/app';

import { AppAccountInfo } from '../@shared/models/app-account-info.model';
import { Post, PostComment } from '../@shared/models/post.model';
import { AuthService } from '../@shared/services/auth/auth.service';
import { TimelineService } from '../@shared/services/timeline/timeline.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.page.html',
  styleUrls: ['./comment.page.scss'],
})
export class CommentPage implements OnInit {
  @Input()
  postId: string;

  comments: PostComment[] = [];
  data = { text: '' };
  currentUserInfo: AppAccountInfo = null;
  postSubscription: Subscription;

  constructor(
    private route: Router,
    private modalController: ModalController,
    private timelineService: TimelineService,
    private authService: AuthService,
  ) {
    this.comments = [];
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    (async () => {
      this.currentUserInfo = await this.authService.getCurrentAccountInfo();
    })();

    console.log('CommentPage -> ionViewWillEnter -> this.postId', this.postId);
    this.postSubscription = this.timelineService.getPost(this.postId).subscribe((post: Post) => {
      this.comments = post.comments.map(comment => {
        comment.createdAt = (comment.createdAt as firestore.Timestamp).toDate();

        return comment;
      });
    });
  }

  ionViewDidLeave() {
    this.postSubscription.unsubscribe();
  }

  async addComment() {
    const comment: PostComment = new PostComment();
    comment.commentBy = this.currentUserInfo.uid;
    comment.createdAt = new Date();
    comment.photoUrl = this.currentUserInfo.photo;
    comment.text = this.data.text;
    comment.name = this.currentUserInfo.name;
    comment.username = this.currentUserInfo.username;

    await this.timelineService.commentPost(this.postId, comment);
    this.data.text = '';
  }

  dismiss() {
    this.modalController.dismiss();
  }

  user_profile() {
    this.modalController.dismiss();
    this.route.navigate(['./user-profile']);
  }
}
