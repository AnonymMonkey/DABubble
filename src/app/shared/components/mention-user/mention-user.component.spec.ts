import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentionUserComponent } from './mention-user.component';

describe('MentionUserComponent', () => {
  let component: MentionUserComponent;
  let fixture: ComponentFixture<MentionUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentionUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MentionUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
