import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { TimelineEvent } from '../../enums/timeline-event.enum';

@Injectable({
  providedIn: 'root'
})
export class TimelineEventsService {
  isPosting$: BehaviorSubject<TimelineEvent> = new BehaviorSubject<TimelineEvent>(TimelineEvent.Nothing);

  constructor() { }

  set(timelineEvent: TimelineEvent) {
    this.isPosting$.next(timelineEvent);
  }

  get() {
    return this.isPosting$.asObservable();
  }

  unsubscribe() {
    return this.isPosting$.unsubscribe();
  }
}
