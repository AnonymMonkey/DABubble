import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateChatHistoryComponent } from './private-chat-history.component';

describe('PrivateChatHistoryComponent', () => {
  let component: PrivateChatHistoryComponent;
  let fixture: ComponentFixture<PrivateChatHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateChatHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrivateChatHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
