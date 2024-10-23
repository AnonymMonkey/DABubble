import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUsersToNewChannelDialogComponent } from './add-users-to-new-channel-dialog.component';

describe('AddUsersToNewChannelDialogComponent', () => {
  let component: AddUsersToNewChannelDialogComponent;
  let fixture: ComponentFixture<AddUsersToNewChannelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUsersToNewChannelDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddUsersToNewChannelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
