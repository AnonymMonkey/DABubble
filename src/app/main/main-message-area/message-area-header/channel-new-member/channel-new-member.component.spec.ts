import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelNewMemberComponent } from './channel-new-member.component';

describe('ChannelNewMemberComponent', () => {
  let component: ChannelNewMemberComponent;
  let fixture: ComponentFixture<ChannelNewMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelNewMemberComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelNewMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
