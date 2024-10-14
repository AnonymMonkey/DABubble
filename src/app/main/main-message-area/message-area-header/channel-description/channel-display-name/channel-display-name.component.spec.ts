import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelDisplayNameComponent } from './channel-display-name.component';

describe('ChannelDisplayNameComponent', () => {
  let component: ChannelDisplayNameComponent;
  let fixture: ComponentFixture<ChannelDisplayNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelDisplayNameComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelDisplayNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
