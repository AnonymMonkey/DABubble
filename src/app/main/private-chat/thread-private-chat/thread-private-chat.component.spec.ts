import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadPrivateChatComponent } from './thread-private-chat.component';

describe('ThreadPrivateChatComponent', () => {
  let component: ThreadPrivateChatComponent;
  let fixture: ComponentFixture<ThreadPrivateChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadPrivateChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadPrivateChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
