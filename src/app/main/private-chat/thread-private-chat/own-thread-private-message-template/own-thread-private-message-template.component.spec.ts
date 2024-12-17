import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnThreadPrivateMessageTemplateComponent } from './own-thread-private-message-template.component';

describe('OwnThreadPrivateMessageTemplateComponent', () => {
  let component: OwnThreadPrivateMessageTemplateComponent;
  let fixture: ComponentFixture<OwnThreadPrivateMessageTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnThreadPrivateMessageTemplateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnThreadPrivateMessageTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
