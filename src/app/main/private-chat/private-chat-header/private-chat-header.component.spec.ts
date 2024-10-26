import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateChatHeaderComponent } from './private-chat-header.component';

describe('PrivateChatHeaderComponent', () => {
  let component: PrivateChatHeaderComponent;
  let fixture: ComponentFixture<PrivateChatHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateChatHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrivateChatHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
