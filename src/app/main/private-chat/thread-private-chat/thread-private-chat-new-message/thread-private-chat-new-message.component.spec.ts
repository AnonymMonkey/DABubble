import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadPrivateChatNewMessageComponent } from './thread-private-chat-new-message.component';

describe('ThreadPrivateChatNewMessageComponent', () => {
  let component: ThreadPrivateChatNewMessageComponent;
  let fixture: ComponentFixture<ThreadPrivateChatNewMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadPrivateChatNewMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadPrivateChatNewMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
