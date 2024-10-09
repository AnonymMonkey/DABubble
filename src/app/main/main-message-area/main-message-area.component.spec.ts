import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainMessageAreaComponent } from './main-message-area.component';

describe('MainMessageAreaComponent', () => {
  let component: MainMessageAreaComponent;
  let fixture: ComponentFixture<MainMessageAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainMessageAreaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainMessageAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
