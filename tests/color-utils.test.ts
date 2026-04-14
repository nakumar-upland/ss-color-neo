import { describe, expect, it } from 'vitest';

import { hexToHsv, hsvToHex, isValidHex, normalizeHex } from '../src/color-utils';

describe('color utils', () => {
  it('normalizes shorthand hex values', () => {
    expect(normalizeHex('#abc')).toBe('#aabbcc');
  });

  it('normalizes rgb values to hex', () => {
    expect(normalizeHex('rgb(255, 107, 107)')).toBe('#ff6b6b');
    expect(normalizeHex('rgba(14, 165, 233, 0.6)')).toBe('#0ea5e9');
  });

  it('falls back for invalid values', () => {
    expect(normalizeHex('not-a-color')).toBe('#000000');
  });

  it('validates hex strings', () => {
    expect(isValidHex('#123456')).toBe(true);
    expect(isValidHex('123')).toBe(true);
    expect(isValidHex('#12345g')).toBe(false);
  });

  it('round-trips between hex and hsv', () => {
    const hsv = hexToHsv('#ff8800');
    expect(hsvToHex(hsv)).toBe('#ff8800');
  });
});
