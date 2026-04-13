export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeHex(value: string): string {
  const raw = value.trim().replace(/^#/, '').toLowerCase();

  if (raw.length === 3 && /^[0-9a-f]{3}$/i.test(raw)) {
    return `#${raw
      .split('')
      .map((part) => part + part)
      .join('')}`;
  }

  if (raw.length === 6 && /^[0-9a-f]{6}$/i.test(raw)) {
    return `#${raw}`;
  }

  return '#000000';
}

export function isValidHex(value: string): boolean {
  return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (component: number) => clamp(Math.round(component), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(hex: string): RGB {
  const normalized = normalizeHex(hex).slice(1);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16)
  };
}

export function hsvToRgb({ h, s, v }: HSV): RGB {
  const safeHue = ((h % 360) + 360) % 360;
  const safeSaturation = clamp(s, 0, 1);
  const safeValue = clamp(v, 0, 1);
  const chroma = safeValue * safeSaturation;
  const hueSection = safeHue / 60;
  const x = chroma * (1 - Math.abs((hueSection % 2) - 1));
  const match = safeValue - chroma;

  let base: RGB;

  if (hueSection < 1) {
    base = { r: chroma, g: x, b: 0 };
  } else if (hueSection < 2) {
    base = { r: x, g: chroma, b: 0 };
  } else if (hueSection < 3) {
    base = { r: 0, g: chroma, b: x };
  } else if (hueSection < 4) {
    base = { r: 0, g: x, b: chroma };
  } else if (hueSection < 5) {
    base = { r: x, g: 0, b: chroma };
  } else {
    base = { r: chroma, g: 0, b: x };
  }

  return {
    r: (base.r + match) * 255,
    g: (base.g + match) * 255,
    b: (base.b + match) * 255
  };
}

export function rgbToHsv({ r, g, b }: RGB): HSV {
  const red = clamp(r, 0, 255) / 255;
  const green = clamp(g, 0, 255) / 255;
  const blue = clamp(b, 0, 255) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;

  if (delta !== 0) {
    if (max === red) {
      hue = 60 * (((green - blue) / delta) % 6);
    } else if (max === green) {
      hue = 60 * ((blue - red) / delta + 2);
    } else {
      hue = 60 * ((red - green) / delta + 4);
    }
  }

  return {
    h: (hue + 360) % 360,
    s: max === 0 ? 0 : delta / max,
    v: max
  };
}

export function hexToHsv(hex: string): HSV {
  return rgbToHsv(hexToRgb(hex));
}

export function hsvToHex(hsv: HSV): string {
  return rgbToHex(hsvToRgb(hsv));
}
