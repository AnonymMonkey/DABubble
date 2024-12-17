import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadPrivateChatHeaderComponent } from './thread-private-chat-header.component';

describe('ThreadPrivateChatHeaderComponent', () => {
  let component: ThreadPrivateChatHeaderComponent;
  let fixture: ComponentFixture<ThreadPrivateChatHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadPrivateChatHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadPrivateChatHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
