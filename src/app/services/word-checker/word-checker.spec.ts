import { TestBed } from '@angular/core/testing';

import { WordChecker } from './word-checker';

describe('WordChecker', () => {
  let service: WordChecker;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WordChecker);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
