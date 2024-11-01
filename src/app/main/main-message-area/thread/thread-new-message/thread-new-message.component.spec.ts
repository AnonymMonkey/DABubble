import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadNewMessageComponent } from './thread-new-message.component';

describe('ThreadNewMessageComponent', () => {
  let component: ThreadNewMessageComponent;
  let fixture: ComponentFixture<ThreadNewMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadNewMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadNewMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
