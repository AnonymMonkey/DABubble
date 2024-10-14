import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelEditDescriptionComponent } from './channel-edit-description.component';

describe('ChannelEditDescriptionComponent', () => {
  let component: ChannelEditDescriptionComponent;
  let fixture: ComponentFixture<ChannelEditDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelEditDescriptionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelEditDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
