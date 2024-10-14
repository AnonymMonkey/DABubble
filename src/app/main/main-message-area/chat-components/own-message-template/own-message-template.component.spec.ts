import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnMessageTemplateComponent } from './own-message-template.component';

describe('OwnMessageTemplateComponent', () => {
  let component: OwnMessageTemplateComponent;
  let fixture: ComponentFixture<OwnMessageTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnMessageTemplateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnMessageTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
