import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateOfMessageComponent } from './date-of-message.component';

describe('DateOfMessageComponent', () => {
  let component: DateOfMessageComponent;
  let fixture: ComponentFixture<DateOfMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateOfMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DateOfMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
