import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { CaptureError, CaptureVideoOptions, MediaCapture, MediaFile } from '@ionic-native/media-capture/ngx';
import { AlertController } from '@ionic/angular';

import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';
import { LoadingService } from '../@shared/services/loading/loading';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { TimelineEventsService } from '../@shared/services/timeline-events/timeline-events.service';
import { TimelineEvent } from '../@shared/enums/timeline-event.enum';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  video: any;
  files = [];

  constructor(
    private route: Router,
    private alertCtrl: AlertController,
    private camera: Camera,
    private mediaCapture: MediaCapture,
    private file: File,
    private tempStorageService: TempStorageService,
    private loadingService: LoadingService,
    private timelineEventsService: TimelineEventsService,
  ) { }


  async chooseVideo() {
    this.timelineEventsService.set(TimelineEvent.Pause);

    // Ask if the user wants to take a photo or choose from photo gallery.
    const alert = await this.alertCtrl.create({
      cssClass: 'full-width-buttons',
      header: 'Select Video',
      message: 'Do you want to record a video or choose from your gallery?',
      buttons: [
        {
          text: 'Choose from Gallery',
          handler: () => {
            this.loadingService.show('Loading video...');

            this.camera.getPicture({
              quality: 70,
              destinationType: this.camera.DestinationType.FILE_URI,
              mediaType: this.camera.MediaType.VIDEO,
              correctOrientation: true,
              sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
            }).then(videoData => {
              this.loadingService.show('Loading video...');
              const videoUrl = 'file:///' + videoData;

              this.tempStorageService.set(TempStorageKey.IsPostSharing, false);
              this.tempStorageService.set(TempStorageKey.SelectedPostId, null);
              this.tempStorageService.set(TempStorageKey.AddNewPostVideoUrl, videoUrl);

              this.route.navigate([ '/filter' ]);
              this.loadingService.hide();
            });
          }
        },
        {
          text: 'Record Video',
          handler: () => {
            const options: CaptureVideoOptions = { duration: 30, limit: 1, quality: 70 };
            this.mediaCapture.captureVideo(options).then((videoData: MediaFile[]) => {
                  this.loadingService.show('Loading video...');

                  const capturedFile = videoData[0];
                  const fileName = capturedFile.name;
                  const dir = capturedFile['localURL'].split('/');
                  dir.pop();
                  const fromDirectory = dir.join('/');
                  const toDirectory = this.file.dataDirectory;

                  this.file.copyFile(fromDirectory , fileName, toDirectory , fileName).then(res => {
                    this.tempStorageService.set(TempStorageKey.IsPostSharing, false);
                    this.tempStorageService.set(TempStorageKey.SelectedPostId, null);
                    this.tempStorageService.set(TempStorageKey.AddNewPostVideoUrl, capturedFile.fullPath);

                    this.route.navigate([ '/filter' ]);
                    this.loadingService.hide();
                  }, err => {
                    console.error('TabsPage -> chooseVideo -> err', err);
                  });
                },
                (err: CaptureError) => console.error(err)
              );
          }
        },
        {
          text: 'Cancel',
          handler: () => {},
          cssClass: 'alert-button--cancel'
        },
      ]
    });

    alert.onDidDismiss().then(() => this.timelineEventsService.set(TimelineEvent.Play));
    alert.present();

    return alert;
  }
}
