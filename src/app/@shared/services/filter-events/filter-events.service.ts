import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { TimelineEvent } from '../../enums/timeline-event.enum';

@Injectable({
  providedIn: 'root'
})
export class FilterEventsService {
  isPosting$: BehaviorSubject<TimelineEvent> = new BehaviorSubject<TimelineEvent>(TimelineEvent.Nothing);

  constructor() {
  }

  set(timelineEvent: TimelineEvent) {
    if (!this.isPosting$) {
      this.isPosting$ = new BehaviorSubject<TimelineEvent>(TimelineEvent.Nothing);
    } else {
      this.isPosting$.next(timelineEvent);
    }
  }

  get() {
    return this.isPosting$.asObservable();
  }

  unsubscribe() {
    this.isPosting$.unsubscribe();
    this.isPosting$ = null;
  }
}
