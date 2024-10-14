import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageAreaChatHistoryComponent } from './message-area-chat-history.component';

describe('MessageAreaChatHistoryComponent', () => {
  let component: MessageAreaChatHistoryComponent;
  let fixture: ComponentFixture<MessageAreaChatHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageAreaChatHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessageAreaChatHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
