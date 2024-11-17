import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMessagePlaceholderNewMessageComponent } from './new-message-placeholder-new-message.component';

describe('NewMessagePlaceholderNewMessageComponent', () => {
  let component: NewMessagePlaceholderNewMessageComponent;
  let fixture: ComponentFixture<NewMessagePlaceholderNewMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewMessagePlaceholderNewMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewMessagePlaceholderNewMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
