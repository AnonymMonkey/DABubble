import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUsersToChannelBottomSheetComponent } from './add-users-to-channel-bottom-sheet.component';

describe('AddUsersToChannelBottomSheetComponent', () => {
  let component: AddUsersToChannelBottomSheetComponent;
  let fixture: ComponentFixture<AddUsersToChannelBottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUsersToChannelBottomSheetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddUsersToChannelBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
