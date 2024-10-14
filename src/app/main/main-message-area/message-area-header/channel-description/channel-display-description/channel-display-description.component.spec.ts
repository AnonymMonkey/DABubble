import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelDisplayDescriptionComponent } from './channel-display-description.component';

describe('ChannelDisplayDescriptionComponent', () => {
  let component: ChannelDisplayDescriptionComponent;
  let fixture: ComponentFixture<ChannelDisplayDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelDisplayDescriptionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelDisplayDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
