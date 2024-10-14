import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelEditNameComponent } from './channel-edit-name.component';

describe('ChannelEditNameComponent', () => {
  let component: ChannelEditNameComponent;
  let fixture: ComponentFixture<ChannelEditNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelEditNameComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelEditNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
