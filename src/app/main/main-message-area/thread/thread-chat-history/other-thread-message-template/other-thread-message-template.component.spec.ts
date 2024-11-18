import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherThreadMessageTemplateComponent } from './other-thread-message-template.component';

describe('OtherThreadMessageTemplateComponent', () => {
  let component: OtherThreadMessageTemplateComponent;
  let fixture: ComponentFixture<OtherThreadMessageTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherThreadMessageTemplateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OtherThreadMessageTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
