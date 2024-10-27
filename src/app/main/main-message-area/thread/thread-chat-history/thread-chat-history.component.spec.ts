import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadChatHistoryComponent } from './thread-chat-history.component';

describe('ThreadChatHistoryComponent', () => {
  let component: ThreadChatHistoryComponent;
  let fixture: ComponentFixture<ThreadChatHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadChatHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadChatHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
