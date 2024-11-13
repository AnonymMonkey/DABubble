import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnPrivateMessageShowComponent } from './own-private-message-show.component';

describe('OwnPrivateMessageShowComponent', () => {
  let component: OwnPrivateMessageShowComponent;
  let fixture: ComponentFixture<OwnPrivateMessageShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnPrivateMessageShowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnPrivateMessageShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
