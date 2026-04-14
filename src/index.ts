export { ColorNeo } from './color-neo';
export type { ColorNeoOptions } from './color-neo';
export {
  clamp,
  hexToHsv,
  hexToRgb,
  hsvToHex,
  hsvToRgb,
  isValidHex,
  normalizeHex,
  rgbToHex,
  rgbToHsv
} from './color-utils';

import { ColorNeo, type ColorNeoOptions } from './color-neo';

export function attachColorNeo(selector: string, options?: ColorNeoOptions): ColorNeo[] {
  return Array.from(document.querySelectorAll<HTMLInputElement>(selector)).map((input) => new ColorNeo(input, options));
}

export function mountColorNeo(parent: string | HTMLElement, options?: ColorNeoOptions): ColorNeo {
  const target = typeof parent === 'string' ? document.querySelector<HTMLElement>(parent) : parent;

  if (!target) {
    throw new Error('mountColorNeo target parent was not found.');
  }

  return new ColorNeo(target, options);
}

export function destroyColorNeo(target: ColorNeo | ColorNeo[] | null | undefined): void {
  if (!target) {
    return;
  }

  if (Array.isArray(target)) {
    for (const picker of target) {
      picker.destroy();
    }
    return;
  }

  target.destroy();
}
