import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateChatPlaceholderComponent } from './private-chat-placeholder.component';

describe('PrivateChatPlaceholderComponent', () => {
  let component: PrivateChatPlaceholderComponent;
  let fixture: ComponentFixture<PrivateChatPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateChatPlaceholderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrivateChatPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
