import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherPrivateMessageTemplateComponent } from './other-private-message-template.component';

describe('OtherPrivateMessageTemplateComponent', () => {
  let component: OtherPrivateMessageTemplateComponent;
  let fixture: ComponentFixture<OtherPrivateMessageTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherPrivateMessageTemplateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OtherPrivateMessageTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
