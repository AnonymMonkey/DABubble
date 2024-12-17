import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherThreadPrivateMessageTemplateComponent } from './other-thread-private-message-template.component';

describe('OtherThreadPrivateMessageTemplateComponent', () => {
  let component: OtherThreadPrivateMessageTemplateComponent;
  let fixture: ComponentFixture<OtherThreadPrivateMessageTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherThreadPrivateMessageTemplateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OtherThreadPrivateMessageTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
