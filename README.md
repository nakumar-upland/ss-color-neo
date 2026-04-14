# SS Color Neo

SS Color Neo is a reusable JavaScript color picker inspired by tools like Coloris. It ships with:

- a hex color input
- a popup-friendly picker panel
- a 2D color swatch for saturation and brightness
- a hue slider to move from one shade family to another
- EyeDropper support when the browser exposes the API
- direct mount mode inside any parent element (no visible input required)
- built-in UI mode with a left swatch + hex input

## Install

```bash
pnpm install ss-color-neo
```

## Use in another project

```ts
import { ColorNeo } from 'ss-color-neo';

const input = document.querySelector('#brand-color');

if (input instanceof HTMLInputElement) {
  new ColorNeo(input, {
    value: '#ff6b6b',
    onChange: (hex) => {
      console.log('Selected color:', hex);
    }
  });
}
```

### Built-in mode: left swatch + hex input

```ts
import { ColorNeo } from 'ss-color-neo';

const input = document.querySelector('#brand-color');

if (input instanceof HTMLInputElement) {
  new ColorNeo(input, {
    mode: 'hex-swatch-left',
    value: '#0ea5e9'
  });
}
```

### Mount directly into a parent element

Use this when you want to render the full selector inside a container and not rely on a visible input.

```ts
import { mountColorNeo } from 'ss-color-neo';

const picker = mountColorNeo('#picker-slot', {
  value: '#22c55e',
  onChange: (hex) => {
    console.log('Mounted picker color:', hex);
  }
});

picker.setValue('#16a34a', true);
```

### Selector size options

`size` controls the picker panel dimensions and supports `small`, `medium`, and `large`.

- `medium` is the default when `size` is omitted.
- In parent mount mode (`mountColorNeo`), selector width is capped to the parent container width.

```ts
import { ColorNeo } from 'ss-color-neo';

const input = document.querySelector('#brand-color');

if (input instanceof HTMLInputElement) {
  new ColorNeo(input, { size: 'small' });
  new ColorNeo(input, { size: 'medium' });
  new ColorNeo(input, { size: 'large' });
}
```

### Open below a custom anchor element

```ts
import { ColorNeo } from 'ss-color-neo';

const input = document.querySelector('#brand-color');
const iconButton = document.querySelector('#open-color');

if (input instanceof HTMLInputElement && iconButton instanceof HTMLElement) {
  const picker = new ColorNeo(input);
  iconButton.addEventListener('click', () => picker.open(iconButton));
}
```

You can also attach it to many inputs:

```ts
import { attachColorNeo } from 'ss-color-neo';

attachColorNeo('[data-color-picker]');
```

This selector-based usage is also included in the demo page as a dedicated example.

## Options

```ts
type ColorNeoOptions = {
  value?: string;
  closeOnSelect?: boolean;
  mode?: 'default' | 'hex-swatch-left';
  size?: 'small' | 'medium' | 'large';
  onChange?: (hex: string) => void;
};
```

## Local development

```bash
pnpm install
pnpm dev
```

The demo page opens at the Vite dev URL and includes both inline usage and a picker rendered inside an HTML dialog popup.

Current demo coverage:

- inline usage opened from a custom icon button
- selector-based initialization with `attachColorNeo('[data-color-picker]')`
- popup usage inside an HTML dialog
- picker rendered inside a popover
- built-in `hex-swatch-left` mode
- selector size demos: `small`, `medium`, and `large`
- direct parent-element mounting with `mountColorNeo`

## Automated checks

```bash
pnpm typecheck
pnpm test
pnpm build
```

A GitHub Actions workflow is included in `.github/workflows/ci.yml` to run the same checks on pushes and pull requests.