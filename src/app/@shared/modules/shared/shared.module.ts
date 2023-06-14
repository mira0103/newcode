import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthGuardModule } from '@angular/fire/auth-guard';

import { Facebook } from '@ionic-native/facebook/ngx';
import { FirebaseAuthentication } from '@ionic-native/firebase-authentication/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { File } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';

import { CountdownModule } from 'ngx-countdown';

import { environment } from 'src/environments/environment';

@NgModule({
    declarations: [],
    imports: [
        FormsModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule,
        AngularFireAuthModule,
        AngularFireAuthGuardModule,

        CountdownModule,
    ],
    providers: [
        Facebook,
        FirebaseAuthentication,
        FirebaseX,
        Camera,
        MediaCapture,
        File,
        FilePath,
        Base64,
        Keyboard
    ],
    exports: [
        FormsModule,
        CountdownModule
    ]
})
export class SharedModule { }
