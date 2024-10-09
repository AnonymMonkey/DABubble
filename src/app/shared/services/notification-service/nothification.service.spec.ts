import { TestBed } from '@angular/core/testing';

import { NothificationService } from './nothification.service';

describe('NothificationService', () => {
  let service: NothificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NothificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
