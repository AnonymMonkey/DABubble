import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnThreadMessageEditComponent } from './own-thread-message-edit.component';

describe('OwnThreadMessageEditComponent', () => {
  let component: OwnThreadMessageEditComponent;
  let fixture: ComponentFixture<OwnThreadMessageEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnThreadMessageEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnThreadMessageEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
