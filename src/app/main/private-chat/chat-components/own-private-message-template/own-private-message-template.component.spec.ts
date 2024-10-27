import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnPrivateMessageTemplateComponent } from './own-private-message-template.component';

describe('OwnPrivateMessageTemplateComponent', () => {
  let component: OwnPrivateMessageTemplateComponent;
  let fixture: ComponentFixture<OwnPrivateMessageTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnPrivateMessageTemplateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnPrivateMessageTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
