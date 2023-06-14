export class FirebaseInitialAccountInfo {
    uid: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    operationType: string;

    additionalUserInfo: {
        isNewUser: boolean,
        providerId: string,

        profile?: {
            id?: string;
            name?: string;
            first_name?: string;
            last_name?: string;
            granted_scopes?: string[];
            email?: string;
            picture?: {
                is_silhouette?: boolean;
                width?: number;
                url?: string;
                height?: number;
            };
        }
    };
}
