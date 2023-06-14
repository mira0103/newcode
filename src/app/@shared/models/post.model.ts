import { firestore } from 'firebase/app';

export class Post {
    id?: string;
    username: string;
    postBy: string;
    posterPhoto: string;
    description: string;
    videoUrl: string;
    shareWith: PostShareType;
    canComment: boolean;
    hashtags: string[];
    createdAt: Date;

    likes: { [key: string]: boolean };
    bookmarks: { [key: string]: boolean };
    views: { [key: string]: boolean };
    sharing: { [key: string]: boolean };
    comments: PostComment[];
}

export class PostComment {
    commentBy: string;
    createdAt: Date | firestore.Timestamp;
    photoUrl: string;
    text: string;
    name: string;
    username: string;
}

export enum PostShareType {
    Public = 'public',
    Friends = 'friends',
}
