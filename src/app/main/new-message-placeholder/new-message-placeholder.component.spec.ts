import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMessagePlaceholderComponent } from './new-message-placeholder.component';

describe('NewMessagePlaceholderComponent', () => {
  let component: NewMessagePlaceholderComponent;
  let fixture: ComponentFixture<NewMessagePlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewMessagePlaceholderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewMessagePlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
