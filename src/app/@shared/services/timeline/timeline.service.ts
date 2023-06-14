import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { firestore } from 'firebase';

import { Post, PostComment } from '../../models/post.model';
import { NotificationEvent } from '../../enums/notification-event.enum';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

  constructor(
    private afStore: AngularFirestore,
    private notificationService: NotificationService,
  ) { }

  async addPost(post: Post) {
    try {
      post.canComment = !post.canComment;
      return await this.afStore.collection(`posts`).add(post);
    } catch (error) {
      console.error('UploadService -> addPost -> error', error);
      throw new Error(error);
    }
  }

  async initializePostLikes(postId: string) {
    try {
      return await this.afStore.doc(`likes/${postId}`).set({});
    } catch (error) {
      console.error('UploadService -> addPost -> error', error);
      throw new Error(error);
    }
  }

  async sharePost(post: Post) {
    try {
      await this.afStore.doc(`posts/${post.id}`).update({ sharing: post.sharing });
      const newPost: Post = { ...post };
      delete newPost.id;
      newPost.sharing = {};
      newPost.canComment = !newPost.canComment;
      return await this.afStore.collection(`posts`).add(newPost);
    } catch (error) {
      console.error('UploadService -> sharePost -> error', error);
      throw new Error(error);
    }
  }

  async commentPost(postId: string, comment: PostComment) {
    try {
      const postDocument = await this.afStore.doc(`posts/${postId}`).get().toPromise();
      const post: Post = { id: postDocument.id, ...postDocument.data() } as Post;
      post.comments.push(comment);
      const comments = post.comments.map(commentInPost => Object.assign({}, commentInPost));
      const result = await this.afStore.doc(`posts/${postId}`).update({ comments });
      await this.notificationService.create(comment.commentBy, post, NotificationEvent.Comment);
      return result;
    } catch (error) {
      console.error('TimelineService -> commentPost -> error', error);
    }
  }

  isLiked(likes: { [key: string]: boolean }, currentUserId: string): boolean {
    if (likes) {
      if (likes[currentUserId]) {
        return true;
      }
    }

    return false;
  }

  async likePost(postId: string, currentUserId: string) {
    try {
      const likesDocument = await this.afStore.doc(`likes/${postId}`).get().toPromise();

      if (!likesDocument.exists) {
        return await this.afStore.doc(`likes/${postId}`).set({ [currentUserId]: true });
      }

      const likes: { [key: string]: boolean } = { ...likesDocument.data() };
      const newLikes = { [currentUserId]: true, ...likes };
      return await this.afStore.doc('likes/' + postId).update(newLikes);
    } catch (error) {
      console.error('TimelineService -> likePost -> error', error);
    }
  }

  async dislikePost(postId: string, currentUserId: string) {
    try {
      return await this.afStore.doc(`likes/${postId}/`).set({
        [currentUserId]: firestore.FieldValue.delete()
      }, { merge: true });
    } catch (error) {
      console.error('TimelineService -> dislikePost -> error', error);
    }
  }

  private mapLikes(posts$: Observable<DocumentChangeAction<any>[]>): Observable<{ [key: string]: boolean }> {
    return posts$.pipe(
      debounceTime(300),
      map(actions => {
        const likes: any = actions.map(action => {
          return { id: action.payload.doc.id, ...action.payload.doc.data() } as { [key: string]: boolean };
        });

        const result = {};
        likes.forEach(like => {
          const newLikes = { ...like };
          delete newLikes.id;
          result[like.id] = newLikes;
        });

        return result;
      }),
    );
  }

  getLikes(): Observable<{ [key: string]: boolean }> {
    const likesCollection = this.afStore.collection('likes').snapshotChanges();
    return this.mapLikes(likesCollection);
  }

  async viewPost(postId: string, currentUserId: string) {
    try {
      const postDocument = await this.afStore.doc(`posts/${postId}`).get().toPromise();
      const post: Post = { id: postDocument.id, ...postDocument.data() } as Post;
      const views = { [currentUserId]: true, ...post.views };
      return await this.afStore.doc('posts/' + postId).update({ views });
    } catch (error) {
      console.error('TimelineService -> likePost -> error', error);
    }
  }

  async bookmarkPost(postId: string, currentUserId: string) {
    try {
      const post: Post = (await this.afStore.doc(`posts/${postId}`).get().toPromise()).data() as Post;
      const bookmarks = { [currentUserId]: true, ...post.bookmarks };
      return await this.afStore.doc('posts/' + postId).update({ bookmarks });
    } catch (error) {
      console.error('TimelineService -> bookmarkPost -> error', error);
    }
  }

  async undoBookmarkPost(postId: string, currentUserId: string) {
    try {
      const post: Post = (await this.afStore.doc(`posts/${postId}`).get().toPromise()).data() as Post;
      delete post.bookmarks[currentUserId];
      return await this.afStore.doc('posts/' + postId).update({ bookmarks: post.bookmarks });
    } catch (error) {
      console.error('TimelineService -> undoBookmarkPost -> error', error);
    }
  }

  private mapPosts(posts$: Observable<DocumentChangeAction<any>[]>): Observable<Post[]> {
    return posts$.pipe(
      debounceTime(300),
      map(actions => {
        return actions.map(action => {
          return { id: action.payload.doc.id, ...action.payload.doc.data() } as Post;
        });
      }),
    );
  }

  getRelatedPosts(): Observable<Post[]> {
    const posts$ = this.afStore.collection('posts', ref => ref.orderBy('createdAt', 'desc')).snapshotChanges();
    return this.mapPosts(posts$);
  }

  getUserPosts(userId: string): Observable<Post[]> {
    const posts$ = this.afStore.collection('posts', ref => {
      return ref.where('postBy', '==', userId).orderBy('createdAt', 'desc');
    }).snapshotChanges();
    return this.mapPosts(posts$);
  }

  getLikedPosts(userId: string): Observable<Post[]> {
    const posts$ = this.afStore.collection('posts', ref => ref.where('likes.' + userId, '==', true)).snapshotChanges();
    return this.mapPosts(posts$);
  }

  getLikedPosts2(userId: string): Observable<any[]> {
    return this.afStore.collection('likes', ref => ref.where(userId, '==', true)).valueChanges();
  }

  getBookmarkedPosts(userId: string): Observable<Post[]> {
    const posts$ = this.afStore.collection('posts', ref => ref.where('bookmarks.' + userId, '==', true)).snapshotChanges();
    return this.mapPosts(posts$);
  }

  getFollowingPosts(): Observable<Post[]> {
    const posts$ = this.afStore.collection('posts', ref => ref.orderBy('createdAt', 'desc')).snapshotChanges();
    return this.mapPosts(posts$);
  }

  getPost(postId: string): Observable<Post> {
    return this.afStore.doc(`posts/${postId}`).valueChanges() as Observable<Post>;
  }

  async getPostPromise(postId: string): Promise<Post> {
    try {
      return (await this.afStore.doc(`posts/${postId}`).get().toPromise()).data() as Post;
    } catch (error) {
      console.error('TimelineService -> getPostPromise -> error', error);
    }
  }
}
