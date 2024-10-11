import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageAreaHeaderComponent } from './message-area-header.component';

describe('MessageAreaHeaderComponent', () => {
  let component: MessageAreaHeaderComponent;
  let fixture: ComponentFixture<MessageAreaHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageAreaHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessageAreaHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
