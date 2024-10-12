import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelMembersListComponent } from './channel-members-list.component';

describe('ChannelMembersListComponent', () => {
  let component: ChannelMembersListComponent;
  let fixture: ComponentFixture<ChannelMembersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelMembersListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelMembersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
