import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnPrivateMessageEditComponent } from './own-private-message-edit.component';

describe('OwnPrivateMessageEditComponent', () => {
  let component: OwnPrivateMessageEditComponent;
  let fixture: ComponentFixture<OwnPrivateMessageEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnPrivateMessageEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnPrivateMessageEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
