import { isEmpty, isObject } from '../utils';

describe('isObject', () => {
  it('should return true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ key: 'value' })).toBe(true);
    expect(isObject({ nested: { key: 'value' } })).toBe(true);
  });

  it('should return false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
  });

  it('should return false for primitive types', () => {
    expect(isObject('string')).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(undefined)).toBe(false);
  });

  it('should return false for functions', () => {
    expect(isObject(() => {})).toBe(false);
    expect(isObject(function () {})).toBe(false);
  });

  it('should return true for Date objects', () => {
    expect(isObject(new Date())).toBe(true);
  });

  it('should return true for RegExp objects', () => {
    expect(isObject(/regex/)).toBe(true);
  });
});

describe('isEmpty', () => {
  it('should return true for null and undefined', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('should return true for empty strings and arrays', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty([])).toBe(true);
  });

  it('should return false for non-empty strings and arrays', () => {
    expect(isEmpty('string')).toBe(false);
    expect(isEmpty([1, 2, 3])).toBe(false);
  });

  it('should return true for empty objects', () => {
    expect(isEmpty({})).toBe(true);
  });

  it('should return false for non-empty objects', () => {
    expect(isEmpty({ key: 'value' })).toBe(false);
  });

  it('should return false for primitive types', () => {
    expect(isEmpty(123)).toBe(false);
    expect(isEmpty(true)).toBe(false);
  });
});
