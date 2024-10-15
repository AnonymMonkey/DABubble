import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileInfoDialogComponent } from './profile-info-dialog.component';

describe('ProfileInfoDialogComponent', () => {
  let component: ProfileInfoDialogComponent;
  let fixture: ComponentFixture<ProfileInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileInfoDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfileInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
