import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnThreadMessageShowComponent } from './own-thread-message-show.component';

describe('OwnThreadMessageShowComponent', () => {
  let component: OwnThreadMessageShowComponent;
  let fixture: ComponentFixture<OwnThreadMessageShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnThreadMessageShowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnThreadMessageShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
