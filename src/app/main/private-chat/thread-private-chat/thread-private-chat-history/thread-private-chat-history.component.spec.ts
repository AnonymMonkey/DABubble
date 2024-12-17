import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadPrivateChatHistoryComponent } from './thread-private-chat-history.component';

describe('ThreadPrivateChatHistoryComponent', () => {
  let component: ThreadPrivateChatHistoryComponent;
  let fixture: ComponentFixture<ThreadPrivateChatHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadPrivateChatHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadPrivateChatHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
