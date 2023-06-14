export class AppAccountInfo {
    uid?: string;
    name: string;
    email: string;
    username?: string;
    photo?: string;

    following?: { [ key: string ]: boolean };
    followers?: { [ key: string ]: boolean };

    bio?: string;
    phoneNumber?: string;
    gender?: string;
    birthDate?: string;

    instagramId?: string;
    twitterId?: string;
    facebookId?: string;

    password?: string;
}
