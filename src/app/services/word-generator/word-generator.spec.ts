import { TestBed } from '@angular/core/testing';

import { WordGenerator } from './word-generator';

describe('WordGenerator', () => {
  let service: WordGenerator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WordGenerator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
