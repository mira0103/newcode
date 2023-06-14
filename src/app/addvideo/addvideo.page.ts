import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { APP_CONFIG, AppConfig } from '../app.config';

@Component({
  selector: 'app-addvideo',
  templateUrl: './addvideo.page.html',
  styleUrls: ['./addvideo.page.scss'],
})
export class AddvideoPage implements OnInit, AfterViewInit {
  videoUrl: string;

  @ViewChild('videoPlayer')
  videoPlayer: any;

  isVideoHidden = true;

  constructor(
    @Inject(APP_CONFIG) public config: AppConfig,
    private modalController: ModalController,
    private route: Router,
    private tempStorageService: TempStorageService,
  ) { }

  ngOnInit() {
    this.videoUrl = this.tempStorageService.get(TempStorageKey.AddNewPostVideoUrl);
  }

  ngAfterViewInit() {
    const videoPlayer: HTMLVideoElement = this.videoPlayer.nativeElement;
    videoPlayer.oncanplay = () => {
      this.isVideoHidden = false;
      videoPlayer.play();
    };
  }

  dismiss() {
    this.modalController.dismiss();
  }

  add_video_filter() {
    this.modalController.dismiss();
    this.route.navigate(['./filter']);
  }

  buyAppAction() {
    window.open('http://bit.ly/cc2_qvid', '_system', 'location=no');
  }
}
