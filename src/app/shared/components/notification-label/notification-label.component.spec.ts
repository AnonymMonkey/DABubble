import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationLabelComponent } from './notification-label.component';

describe('NotificationLabelComponent', () => {
  let component: NotificationLabelComponent;
  let fixture: ComponentFixture<NotificationLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationLabelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificationLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
