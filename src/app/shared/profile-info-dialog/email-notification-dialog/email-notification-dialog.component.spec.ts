import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailNotificationDialogComponent } from './email-notification-dialog.component';

describe('EmailNotificationDialogComponent', () => {
  let component: EmailNotificationDialogComponent;
  let fixture: ComponentFixture<EmailNotificationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailNotificationDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmailNotificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
