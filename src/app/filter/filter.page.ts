import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { TempStorageKey } from '../@shared/enums/temp-storage-key.enum';
import { TimelineEvent } from '../@shared/enums/timeline-event.enum';
import { TempStorageService } from '../@shared/services/temp-storage/temp-storage.service';
import { TimelineEventsService } from '../@shared/services/timeline-events/timeline-events.service';
import { FilterEventsService } from '../@shared/services/filter-events/filter-events.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.page.html',
  styleUrls: ['./filter.page.scss'],
})
export class FilterPage implements OnInit {
  videoUrl: string;

  @ViewChild('videoPlayer')
  videoPlayer: any;

  isPosting = false;

  constructor(
    private route: Router,
    private tempStorageService: TempStorageService,
    private timelineEventsService: TimelineEventsService,
    private filterEventsService: FilterEventsService,
  ) {
    this.filterEventsService.set(TimelineEvent.Nothing);
  }

  ngOnInit() {
    this.videoUrl = this.tempStorageService.get(TempStorageKey.AddNewPostVideoUrl);

    this.filterEventsService.get().subscribe(timelineEvent => {
      if (timelineEvent === TimelineEvent.Play) {
        this.isPosting = false;
        const videoPlayer: HTMLVideoElement = this.videoPlayer.nativeElement;
        if (videoPlayer) {
          videoPlayer.play();
        }
      } else if (timelineEvent === TimelineEvent.Pause) {
        this.isPosting = true;
        const videoPlayer: HTMLVideoElement = this.videoPlayer.nativeElement;
        if (videoPlayer) {
          videoPlayer.pause();
        }
      }
    });
  }

  ionViewWillEnter() {
    const videoPlayer: HTMLVideoElement = this.videoPlayer.nativeElement;
    videoPlayer.oncanplay = () => {
      videoPlayer.play();
    };
  }

  ionViewDidLeave() {
    if (!this.isPosting) {
      this.timelineEventsService.set(TimelineEvent.Play);
      this.filterEventsService.unsubscribe();
    }
  }

  post_info() {
    this.filterEventsService.set(TimelineEvent.Pause);
    this.route.navigate(['./post-info']);
  }
}
