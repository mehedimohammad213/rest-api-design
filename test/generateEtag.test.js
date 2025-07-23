const generateEtag = require('../src/utils/generateEtag');

describe('generateEtag', () => {
  it('should return a consistent hash for the same input', () => {
    const data = { foo: 'bar', value: 42 };
    const etag1 = generateEtag(data);
    const etag2 = generateEtag(data);
    expect(etag1).toBe(etag2);
  });

  it('should return different hashes for different inputs', () => {
    const data1 = { foo: 'bar' };
    const data2 = { foo: 'baz' };
    const etag1 = generateEtag(data1);
    const etag2 = generateEtag(data2);
    expect(etag1).not.toBe(etag2);
  });
});