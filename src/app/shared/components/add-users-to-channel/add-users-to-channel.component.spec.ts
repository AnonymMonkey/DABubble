import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUsersToChannelComponent } from './add-users-to-channel.component';

describe('AddUsersToChannelComponent', () => {
  let component: AddUsersToChannelComponent;
  let fixture: ComponentFixture<AddUsersToChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUsersToChannelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddUsersToChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
