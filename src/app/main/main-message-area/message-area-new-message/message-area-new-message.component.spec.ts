import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageAreaNewMessageComponent } from './message-area-new-message.component';

describe('MessageAreaNewMessageComponent', () => {
  let component: MessageAreaNewMessageComponent;
  let fixture: ComponentFixture<MessageAreaNewMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageAreaNewMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessageAreaNewMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
