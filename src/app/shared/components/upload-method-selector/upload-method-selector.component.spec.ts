import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadMethodSelectorComponent } from './upload-method-selector.component';

describe('UploadMethodSelectorComponent', () => {
  let component: UploadMethodSelectorComponent;
  let fixture: ComponentFixture<UploadMethodSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadMethodSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadMethodSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
