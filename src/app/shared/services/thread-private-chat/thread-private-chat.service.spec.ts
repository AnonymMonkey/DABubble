import { TestBed } from '@angular/core/testing';

import { ThreadPrivateChatService } from './thread-private-chat.service';
describe('ThreadPrivateChatService', () => {
  let service: ThreadPrivateChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThreadPrivateChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
