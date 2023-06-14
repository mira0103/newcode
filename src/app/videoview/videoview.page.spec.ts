import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VideoviewPage } from './videoview.page';

describe('VideoviewPage', () => {
  let component: VideoviewPage;
  let fixture: ComponentFixture<VideoviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoviewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VideoviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
