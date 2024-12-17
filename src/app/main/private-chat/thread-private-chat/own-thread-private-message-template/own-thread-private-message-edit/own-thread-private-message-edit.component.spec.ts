import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnThreadPrivateMessageEditComponent } from './own-thread-private-message-edit.component';

describe('OwnThreadPrivateMessageEditComponent', () => {
  let component: OwnThreadPrivateMessageEditComponent;
  let fixture: ComponentFixture<OwnThreadPrivateMessageEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnThreadPrivateMessageEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnThreadPrivateMessageEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
