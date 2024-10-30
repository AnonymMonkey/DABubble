import { TestBed } from '@angular/core/testing';

import { ActiveChatButtonService } from './active-chat-button.service';

describe('ActiveChatButtonService', () => {
  let service: ActiveChatButtonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveChatButtonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
