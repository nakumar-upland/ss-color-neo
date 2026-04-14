import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ColorNeo } from '../src/color-neo';
import { destroyColorNeo } from '../src';

describe('ColorNeo', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('supports built-in hex-swatch-left mode', () => {
    document.body.innerHTML = '<div id="app"><input id="color" value="#123456" /></div>';
    const input = document.querySelector<HTMLInputElement>('#color');

    if (!input) {
      throw new Error('input missing');
    }

    const picker = new ColorNeo(input, { mode: 'hex-swatch-left' });
    const firstChild = picker.wrapper.firstElementChild;

    expect(picker.wrapper.classList.contains('color-neo-field--swatch-left')).toBe(true);
    expect(firstChild).toBe(picker.trigger);

    input.click();
    expect(picker.popup.hidden).toBe(false);
  });

  it('uses medium popup size by default', () => {
    document.body.innerHTML = '<div id="app"><input id="color" value="#123456" /></div>';
    const input = document.querySelector<HTMLInputElement>('#color');

    if (!input) {
      throw new Error('input missing');
    }

    const picker = new ColorNeo(input);

    expect(picker.popup.classList.contains('color-neo-popup--medium')).toBe(true);
  });

  it('supports small and large popup sizes', () => {
    document.body.innerHTML = `
      <div id="app">
        <input id="small" value="#123456" />
        <input id="large" value="#abcdef" />
      </div>
    `;

    const smallInput = document.querySelector<HTMLInputElement>('#small');
    const largeInput = document.querySelector<HTMLInputElement>('#large');

    if (!smallInput || !largeInput) {
      throw new Error('size inputs missing');
    }

    const smallPicker = new ColorNeo(smallInput, { size: 'small' });
    const largePicker = new ColorNeo(largeInput, { size: 'large' });

    expect(smallPicker.popup.classList.contains('color-neo-popup--small')).toBe(true);
    expect(largePicker.popup.classList.contains('color-neo-popup--large')).toBe(true);
  });

  it('renders directly inside a provided parent element', () => {
    document.body.innerHTML = '<div id="mount"></div>';
    const mount = document.querySelector<HTMLDivElement>('#mount');

    if (!mount) {
      throw new Error('mount container missing');
    }

    const picker = new ColorNeo(mount, { color: '#22c55e' });

    expect(picker.popup.parentElement).toBe(mount);
    expect(picker.popup.hidden).toBe(false);
    expect(picker.popup.classList.contains('color-neo-popup-inline')).toBe(true);
    expect(picker.input.hidden).toBe(true);
    expect(picker.popupInput.value).toBe('#22c55e');
  });

  it('renders inside popover after button click', () => {
    document.body.innerHTML = `
      <button id="open" type="button">Open</button>
      <div id="popover" popover></div>
    `;

    const openButton = document.querySelector<HTMLButtonElement>('#open');
    const popover = document.querySelector<HTMLDivElement>('#popover');

    if (!openButton || !popover) {
      throw new Error('popover scenario missing');
    }

    let popupParentIsPopover = false;

    openButton.addEventListener('click', () => {
      popover.innerHTML = '<input id="color" value="#7c3aed" />';
      const input = popover.querySelector<HTMLInputElement>('#color');

      if (!input) {
        throw new Error('popover input missing');
      }

      const picker = new ColorNeo(input);
      picker.open();
      popupParentIsPopover = picker.popup.parentElement === popover;
    });

    openButton.click();

    expect(popupParentIsPopover).toBe(true);
  });

  it('mounts popup into open dialog host', () => {
    document.body.innerHTML = '<dialog open><div id="app"><input id="color" value="#336699" /></div></dialog>';
    const input = document.querySelector<HTMLInputElement>('#color');
    const dialog = document.querySelector<HTMLDialogElement>('dialog');

    if (!input || !dialog) {
      throw new Error('dialog scenario missing');
    }

    const picker = new ColorNeo(input);
    picker.open();

    expect(picker.popup.parentElement).toBe(dialog);
  });

  it('mounts around an input and syncs the starting value', () => {
    document.body.innerHTML = '<div id="app"><input id="color" value="#336699" /></div>';
    const input = document.querySelector<HTMLInputElement>('#color');

    if (!input) {
      throw new Error('input missing');
    }

    const picker = new ColorNeo(input);
    expect(picker.wrapper.contains(input)).toBe(true);
    expect(picker.popupInput.value).toBe('#336699');
    expect(picker.previewLabel.textContent).toBe('#336699');
  });

  it('prefers the color option during initialization', () => {
    document.body.innerHTML = '<div id="app"><input id="color" value="#336699" /></div>';
    const input = document.querySelector<HTMLInputElement>('#color');

    if (!input) {
      throw new Error('input missing');
    }

    const picker = new ColorNeo(input, { color: '#c0ffee' });

    expect(input.value).toBe('#c0ffee');
    expect(picker.popupInput.value).toBe('#c0ffee');
    expect(picker.previewLabel.textContent).toBe('#c0ffee');
  });

  it('converts an rgb color option during initialization', () => {
    document.body.innerHTML = '<div id="app"><input id="color" value="#336699" /></div>';
    const input = document.querySelector<HTMLInputElement>('#color');

    if (!input) {
      throw new Error('input missing');
    }

    const picker = new ColorNeo(input, { color: 'rgb(255, 107, 107)' });

    expect(input.value).toBe('#ff6b6b');
    expect(picker.popupInput.value).toBe('#ff6b6b');
    expect(picker.previewLabel.textContent).toBe('#ff6b6b');
  });

  it('emits updates when the value changes', () => {
    document.body.innerHTML = '<div id="app"><input id="color" value="#000000" /></div>';
    const input = document.querySelector<HTMLInputElement>('#color');

    if (!input) {
      throw new Error('input missing');
    }

    const onChange = vi.fn();
    const picker = new ColorNeo(input, { onChange });
    picker.setValue('#00ff00', true);

    expect(input.value).toBe('#00ff00');
    expect(onChange).toHaveBeenCalledWith('#00ff00');
  });

  it('debounces hex typing updates by 2 seconds', () => {
    vi.useFakeTimers();

    try {
      document.body.innerHTML = '<div id="app"><input id="color" value="#111111" /></div>';
      const input = document.querySelector<HTMLInputElement>('#color');

      if (!input) {
        throw new Error('input missing');
      }

      const onChange = vi.fn();
      const picker = new ColorNeo(input, { onChange });

      input.value = '000';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      expect(onChange).toHaveBeenCalledTimes(0);

      vi.advanceTimersByTime(1999);
      expect(onChange).toHaveBeenCalledTimes(0);

      vi.advanceTimersByTime(1);
      expect(onChange).toHaveBeenCalledWith('#000000');
      expect(input.value).toBe('#000000');

      picker.destroy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('opens the eyedropper when supported', async () => {
    document.body.innerHTML = '<div id="app"><input id="color" value="#000000" /></div>';
    const input = document.querySelector<HTMLInputElement>('#color');

    if (!input) {
      throw new Error('input missing');
    }

    const open = vi.fn().mockResolvedValue({ sRGBHex: '#fedcba' });
    class FakeEyeDropper {
      open = open;
    }

    window.EyeDropper = FakeEyeDropper as typeof window.EyeDropper;

    const picker = new ColorNeo(input);
    picker.eyeDropperButton.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(open).toHaveBeenCalledTimes(1);
    expect(input.value).toBe('#fedcba');

    delete window.EyeDropper;
  });

  it('stores selected colors in LIFO order and renders history swatches', () => {
    document.body.innerHTML = '<div id="app"><input id="color" value="#000000" /></div>';
    const input = document.querySelector<HTMLInputElement>('#color');

    if (!input) {
      throw new Error('input missing');
    }

    const picker = new ColorNeo(input);
    picker.setValue('#112233', true);
    picker.setValue('#445566', true);
    picker.setValue('#112233', true);

    expect(localStorage.getItem('color-neo-history')).toBe('["#112233","#445566"]');

    const swatches = picker.historyRow.querySelectorAll<HTMLButtonElement>('.color-neo-history-swatch');
    expect(swatches).toHaveLength(2);
    expect(swatches.item(0).title).toBe('#112233');
    expect(swatches.item(1).title).toBe('#445566');

    swatches.item(1).click();
    expect(input.value).toBe('#445566');
  });

  it('uses configurable localStorage key for color history', () => {
    document.body.innerHTML = '<div id="app"><input id="color" value="#000000" /></div>';
    const input = document.querySelector<HTMLInputElement>('#color');

    if (!input) {
      throw new Error('input missing');
    }

    const picker = new ColorNeo(input, { historyStorageKey: 'my-picker-history' });
    picker.setValue('#abcdef', true);

    expect(localStorage.getItem('my-picker-history')).toBe('["#abcdef"]');
    expect(localStorage.getItem('color-neo-history')).toBe(null);
  });

  it('destroys a picker through the exported helper', () => {
    document.body.innerHTML = '<div id="app"><input id="color" value="#000000" /></div>';
    const input = document.querySelector<HTMLInputElement>('#color');

    if (!input) {
      throw new Error('input missing');
    }

    const picker = new ColorNeo(input, { color: '#123456' });

    expect(picker.wrapper.isConnected).toBe(true);
    expect(picker.popup.isConnected).toBe(true);

    destroyColorNeo(picker);

    expect(picker.wrapper.isConnected).toBe(false);
    expect(picker.popup.isConnected).toBe(false);
    expect(input.classList.contains('color-neo-input')).toBe(false);
  });
});
