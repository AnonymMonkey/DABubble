import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnThreadMessageTemplateComponent } from './own-thread-message-template.component';

describe('OwnThreadMessageTemplateComponent', () => {
  let component: OwnThreadMessageTemplateComponent;
  let fixture: ComponentFixture<OwnThreadMessageTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnThreadMessageTemplateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnThreadMessageTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
