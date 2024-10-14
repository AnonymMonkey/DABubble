import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherMessageTemplateComponent } from './other-message-template.component';

describe('OtherMessageTemplateComponent', () => {
  let component: OtherMessageTemplateComponent;
  let fixture: ComponentFixture<OtherMessageTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherMessageTemplateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OtherMessageTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
