import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnMessageShowComponent } from './own-message-show.component';

describe('OwnMessageShowComponent', () => {
  let component: OwnMessageShowComponent;
  let fixture: ComponentFixture<OwnMessageShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnMessageShowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnMessageShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
