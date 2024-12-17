import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnThreadPrivateMessageShowComponent } from './own-thread-private-message-show.component';

describe('OwnThreadPrivateMessageShowComponent', () => {
  let component: OwnThreadPrivateMessageShowComponent;
  let fixture: ComponentFixture<OwnThreadPrivateMessageShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnThreadPrivateMessageShowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnThreadPrivateMessageShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
