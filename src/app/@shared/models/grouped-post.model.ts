import { Post } from './post.model';

export class GroupedPost {
    hashtag: string;
    posts: Post[];

    constructor() {
        this.hashtag = '';
        this.posts = [];
    }
}
