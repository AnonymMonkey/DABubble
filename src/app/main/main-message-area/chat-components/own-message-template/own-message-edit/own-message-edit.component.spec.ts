import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnMessageEditComponent } from './own-message-edit.component';

describe('OwnMessageEditComponent', () => {
  let component: OwnMessageEditComponent;
  let fixture: ComponentFixture<OwnMessageEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnMessageEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnMessageEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
