import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PostInfoPage } from './post-info.page';

describe('PostInfoPage', () => {
  let component: PostInfoPage;
  let fixture: ComponentFixture<PostInfoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostInfoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PostInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
