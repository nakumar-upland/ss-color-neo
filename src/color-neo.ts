import { clamp, hexToHsv, hsvToHex, isValidHex, normalizeHex } from './color-utils';
import { ensureStyles } from './styles';

export interface ColorNeoOptions {
  color?: string;
  closeOnSelect?: boolean;
  mode?: 'default' | 'hex-swatch-left';
  historyEnabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  historyStorageKey?: string;
  onChange?: (hex: string) => void;
  favorites?: string[] | string;
  onFavoritesChange?: (favorites: string[]) => void;
}

type EyeDropperLike = {
  open: () => Promise<{ sRGBHex: string }>;
};

declare global {
  interface Window {
    EyeDropper?: new () => EyeDropperLike;
  }
  interface HTMLElementEventMap {
    'colorneo:change': CustomEvent<{ value: string }>;
  }
}

export class ColorNeo {
  readonly input: HTMLInputElement;
  readonly wrapper: HTMLDivElement;
  readonly trigger: HTMLButtonElement;
  readonly popup: HTMLDivElement;
  readonly swatch: HTMLDivElement;
  readonly handle: HTMLDivElement;
  readonly hueSlider: HTMLInputElement;
  readonly popupInput: HTMLInputElement;
  readonly previewChip: HTMLDivElement;
  readonly previewLabel: HTMLSpanElement;
  readonly eyeDropperButton: HTMLButtonElement;
  readonly favoritesSection: HTMLElement;
  readonly historyRow: HTMLDivElement;
  readonly historySection: HTMLElement;
  readonly heartButton: HTMLButtonElement;
  readonly favoritesRow: HTMLDivElement;
  private readonly emptyColorPattern = 'repeating-linear-gradient(135deg, #e2e8f0 0 6px, #ffffff 6px 12px)';

  private hsv = hexToHsv('#000000');
  private isSyncing = false;
  private popupAnchor: HTMLElement | null = null;
  private readonly isInlineMount: boolean;
  private readonly mountContainer: HTMLElement | null;
  private readonly mode: NonNullable<ColorNeoOptions['mode']>;
  private readonly size: NonNullable<ColorNeoOptions['size']>;
  private readonly options: Required<Pick<ColorNeoOptions, 'closeOnSelect'>> & Omit<ColorNeoOptions, 'closeOnSelect'>;
  private readonly boundDocumentClick: (event: MouseEvent) => void;
  private readonly boundEscape: (event: KeyboardEvent) => void;
  private readonly hexInputDebounceMs = 2000;
  private readonly historyMaxItems = 7;
  private readonly historyEnabled: boolean;
  private readonly historyStorageKey: string;
  private hexInputTimer: number | null = null;
  private favorites: Set<string> = new Set();

  constructor(target: string | HTMLInputElement | HTMLElement, options: ColorNeoOptions = {}) {
    const targetElement = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;

    if (!targetElement) {
      throw new Error('ColorNeo target element was not found.');
    }

    let input: HTMLInputElement;

    if (targetElement instanceof HTMLInputElement) {
      input = targetElement;
      this.isInlineMount = false;
      this.mountContainer = null;
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.hidden = true;
      input.setAttribute('aria-hidden', 'true');
      this.isInlineMount = true;
      this.mountContainer = targetElement;
    }


    ensureStyles();

    this.input = input;
    this.options = {
      closeOnSelect: options.closeOnSelect ?? false,
      historyEnabled: options.historyEnabled ?? false,
      historyStorageKey: options.historyStorageKey ?? 'color-neo-history',
      onChange: options.onChange,
      onFavoritesChange: options.onFavoritesChange,
      favorites: options.favorites,
      mode: options.mode ?? 'default',
      size: options.size ?? 'medium'
    };
    this.mode = this.options.mode ?? 'default';
    this.size = this.options.size ?? 'medium';
    this.historyEnabled = this.options.historyEnabled ?? false;
    this.historyStorageKey = this.options.historyStorageKey ?? 'color-neo-history';

    this.input.classList.add('color-neo-input');
    this.input.spellcheck = false;
    this.input.autocomplete = 'off';

    this.wrapper = document.createElement('div');
    this.wrapper.className = 'color-neo-field';

    if (this.mode === 'hex-swatch-left') {
      this.wrapper.classList.add('color-neo-field--swatch-left');
    }

    this.trigger = document.createElement('button');
    this.trigger.type = 'button';
    this.trigger.className = 'color-neo-trigger';
    this.trigger.setAttribute('aria-label', 'Open color picker');

    this.popup = document.createElement('div');
    this.popup.className = 'color-neo-popup';
    this.popup.classList.add(`color-neo-popup--${this.size}`);
    this.popup.hidden = true;

    const topbar = document.createElement('div');
    topbar.className = 'color-neo-topbar';

    const preview = document.createElement('div');
    preview.className = 'color-neo-preview';

    this.previewChip = document.createElement('div');
    this.previewChip.className = 'color-neo-chip';

    this.previewLabel = document.createElement('span');
    this.previewLabel.className = 'color-neo-value';

    this.heartButton = document.createElement('button');
    this.heartButton.type = 'button';
    this.heartButton.className = 'color-neo-heart';
    this.heartButton.title = 'Add to favorites';
    this.heartButton.setAttribute('aria-label', 'Add to favorites');
    const heartIcon = document.createElement('span');
    heartIcon.className = 'color-neo-heart-icon';
    heartIcon.setAttribute('aria-hidden', 'true');
    heartIcon.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    this.heartButton.append(heartIcon);
    this.heartButton.addEventListener('click', () => {
      const currentColor = this.input.value;
      if (currentColor) {
        this.toggleFavorite(currentColor);
      }
    });

    preview.append(this.previewChip, this.previewLabel, this.heartButton);

    this.eyeDropperButton = document.createElement('button');
    this.eyeDropperButton.type = 'button';
    this.eyeDropperButton.className = 'color-neo-eyedropper';
    this.eyeDropperButton.title = 'Pick color';
    this.eyeDropperButton.setAttribute('aria-label', 'Pick color');
    const eyeDropperIcon = document.createElement('span');
    eyeDropperIcon.className = 'color-neo-eyedropper-icon';
    eyeDropperIcon.setAttribute('aria-hidden', 'true');
    eyeDropperIcon.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><path d="M15.8 5.2a2.8 2.8 0 0 1 4 4l-2 2 1.2 1.2a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4 0L15 14l-6.7 6.7a4 4 0 0 1-2.8 1.2H3a1 1 0 0 1-1-1v-2.5a4 4 0 0 1 1.2-2.8L9.9 9 8.6 7.8a1 1 0 0 1 0-1.4L10 5a1 1 0 0 1 1.4 0l1.2 1.2 2-2zM4 19v1h1a2 2 0 0 0 1.4-.6l6.2-6.2-1.4-1.4L5.6 17.4A2 2 0 0 0 5 18.8V19H4z"/></svg>';

    this.eyeDropperButton.append(eyeDropperIcon);
    this.eyeDropperButton.hidden = !('EyeDropper' in window);

    topbar.append(preview, this.eyeDropperButton);

    this.swatch = document.createElement('div');
    this.swatch.className = 'color-neo-swatch';

    this.handle = document.createElement('div');
    this.handle.className = 'color-neo-handle';
    this.swatch.append(this.handle);

    const sliderWrap = document.createElement('div');
    sliderWrap.className = 'color-neo-slider-wrap';

    this.hueSlider = document.createElement('input');
    this.hueSlider.className = 'color-neo-slider';
    this.hueSlider.type = 'range';
    this.hueSlider.min = '0';
    this.hueSlider.max = '360';
    this.hueSlider.value = '0';
    this.hueSlider.setAttribute('aria-label', 'Shade slider');

    sliderWrap.append(this.hueSlider);

    this.popupInput = document.createElement('input');
    this.popupInput.className = 'color-neo-popup-input';
    this.popupInput.type = 'text';
    this.popupInput.setAttribute('aria-label', 'Hex color value');

    this.historyRow = document.createElement('div');
    this.historyRow.className = 'color-neo-history';

    this.favoritesRow = document.createElement('div');
    this.favoritesRow.className = 'color-neo-favorites';

    this.favoritesSection = document.createElement('section');
    this.favoritesSection.className = 'color-neo-group color-neo-group--favorites';
    const favoritesLabel = document.createElement('div');
    favoritesLabel.className = 'color-neo-group-label';
    favoritesLabel.textContent = 'Favorites';
    this.favoritesSection.append(favoritesLabel, this.favoritesRow);

    this.historySection = document.createElement('section');
    this.historySection.className = 'color-neo-group color-neo-group--history';
    const historyLabel = document.createElement('div');
    historyLabel.className = 'color-neo-group-label';
    historyLabel.textContent = 'Recent';
    this.historySection.append(historyLabel, this.historyRow);

    this.popup.append(topbar, this.swatch, sliderWrap, this.favoritesSection, this.historySection, this.popupInput);

    this.boundDocumentClick = (event: MouseEvent) => {
      const targetNode = event.target as Node | null;
      if (!targetNode || this.wrapper.contains(targetNode) || this.popup.contains(targetNode)) {
        return;
      }
      this.close();
    };

    this.boundEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.close();
      }
    };

    this.mount();
    this.bindEvents();
    this.initializeFavorites(options.favorites);
    this.renderHistory();
    this.renderFavorites();

    const initial = options.color ?? input.value ?? '#000000';
    this.setValue(initial);
  }

  open(anchor?: HTMLElement): void {
    this.popupAnchor = anchor ?? null;
    this.attachPopupToHost();
    this.popup.hidden = false;
    this.positionPopup();
  }

  close(): void {
    this.popup.hidden = true;
  }

  toggle(): void {
    if (this.popup.hidden) {
      this.open();
      return;
    }

    this.close();
  }

  destroy(): void {
    if (this.hexInputTimer !== null) {
      window.clearTimeout(this.hexInputTimer);
      this.hexInputTimer = null;
    }

    document.removeEventListener('mousedown', this.boundDocumentClick);
    document.removeEventListener('keydown', this.boundEscape);
    window.removeEventListener('resize', this.positionPopup);
    window.removeEventListener('scroll', this.positionPopup, true);
    this.popup.remove();
    this.trigger.remove();

    if (this.isInlineMount) {
      this.input.remove();
      this.input.classList.remove('color-neo-input');
      return;
    }

    const parent = this.wrapper.parentElement;
    if (parent) {
      parent.insertBefore(this.input, this.wrapper);
      this.wrapper.remove();
    }
    this.input.classList.remove('color-neo-input');
  }

  setValue(nextValue: string, emitEvents = false): void {
    if (nextValue.trim() === '') {
      this.clearValue(emitEvents);
      return;
    }

    const normalized = normalizeHex(nextValue);
    this.hsv = hexToHsv(normalized);
    this.syncUi(normalized, emitEvents);
  }

  setColor(nextColor: string, emitEvents = false): void {
    this.setValue(nextColor, emitEvents);
  }

  private mount(): void {
    if (this.isInlineMount && this.mountContainer) {
      this.mountContainer.append(this.input);
      this.attachPopupToHost();
      this.popup.classList.add('color-neo-popup-inline');
      this.popup.hidden = false;
      return;
    }

    const parent = this.input.parentElement;

    if (!parent) {
      throw new Error('ColorNeo input requires a parent element.');
    }

    parent.insertBefore(this.wrapper, this.input);

    if (this.mode === 'hex-swatch-left') {
      this.wrapper.append(this.trigger, this.input);
    } else {
      this.wrapper.append(this.input, this.trigger);
    }

    this.attachPopupToHost();
  }

  private attachPopupToHost(): void {
    if (this.isInlineMount && this.mountContainer) {
      if (this.popup.parentElement !== this.mountContainer) {
        this.mountContainer.append(this.popup);
      }
      return;
    }

    const hostTarget = this.popupAnchor ?? this.input;
    const dialogHost = hostTarget.closest<HTMLDialogElement>('dialog[open]');
    const popoverHost = hostTarget.closest<HTMLElement>('[popover]');
    const host = (dialogHost ?? popoverHost ?? document.body) as HTMLElement;

    if (this.popup.parentElement !== host) {
      host.append(this.popup);
    }
  }

  private bindEvents(): void {
    if (!this.isInlineMount) {
      this.trigger.addEventListener('click', () => this.toggle());
      this.input.addEventListener('focus', () => this.open());
      this.input.addEventListener('click', () => this.open());
    }

    this.input.addEventListener('input', () => {
      if (this.isSyncing) {
        return;
      }

      this.scheduleHexInputSync(this.input.value);
    });

    this.popupInput.addEventListener('input', () => {
      if (this.isSyncing) {
        return;
      }

      this.scheduleHexInputSync(this.popupInput.value);
    });

    this.hueSlider.addEventListener('input', () => {
      this.hsv.h = Number(this.hueSlider.value);
      this.syncUi(hsvToHex(this.hsv), true);
    });

    const handlePointer = (event: PointerEvent) => {
      const rect = this.swatch.getBoundingClientRect();
      const saturation = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const value = 1 - clamp((event.clientY - rect.top) / rect.height, 0, 1);
      this.hsv.s = saturation;
      this.hsv.v = value;
      this.syncUi(hsvToHex(this.hsv), true);
      if (this.options.closeOnSelect) {
        this.close();
      }
    };

    this.swatch.addEventListener('pointerdown', (event) => {
      handlePointer(event);
      const move = (pointerEvent: PointerEvent) => handlePointer(pointerEvent);
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };

      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });

    this.eyeDropperButton.addEventListener('click', async () => {
      const EyeDropperConstructor = window.EyeDropper;
      if (!EyeDropperConstructor) {
        return;
      }

      try {
        const eyeDropper = new EyeDropperConstructor();
        const result = await eyeDropper.open();
        this.setValue(result.sRGBHex, true);
      } catch {
        // User cancellation should not surface as an error.
      }
    });

    if (!this.isInlineMount) {
      document.addEventListener('mousedown', this.boundDocumentClick);
      document.addEventListener('keydown', this.boundEscape);
      window.addEventListener('resize', this.positionPopup);
      window.addEventListener('scroll', this.positionPopup, true);
    }
  }

  private positionPopup = (): void => {
    if (this.popup.hidden) {
      return;
    }

    if (this.isInlineMount) {
      this.popup.style.left = '0px';
      this.popup.style.top = '0px';
      this.popup.style.right = 'auto';
      return;
    }

    const anchorElement = this.popupAnchor ?? this.wrapper;
    const rect = anchorElement.getBoundingClientRect();
    const popupWidth = this.popup.offsetWidth || 280;
    const popupHeight = this.popup.offsetHeight || 340;
    const gap = 10;
    const left = clamp(rect.left, 8, window.innerWidth - popupWidth - 8);
    const top = rect.bottom + popupHeight + gap > window.innerHeight ? rect.top - popupHeight - gap : rect.bottom + gap;

    this.popup.style.left = `${left}px`;
    this.popup.style.top = `${Math.max(8, top)}px`;
  };

  private scheduleHexInputSync(value: string): void {
    if (this.hexInputTimer !== null) {
      window.clearTimeout(this.hexInputTimer);
    }

    this.hexInputTimer = window.setTimeout(() => {
      if (value.trim() === '') {
        this.clearValue(true);
        this.hexInputTimer = null;
        return;
      }

      if (isValidHex(value)) {
        this.setValue(value, true);
      }
      this.hexInputTimer = null;
    }, this.hexInputDebounceMs);
  }

  private syncUi(hex: string, emitEvents: boolean): void {
    const normalized = normalizeHex(hex);
    const hueBackground = `linear-gradient(to right, white, hsl(${this.hsv.h}deg 100% 50%))`;
    this.swatch.style.background = `linear-gradient(to top, black, transparent), ${hueBackground}`;
    this.handle.style.left = `${this.hsv.s * 100}%`;
    this.handle.style.top = `${(1 - this.hsv.v) * 100}%`;
    this.hueSlider.value = `${Math.round(this.hsv.h)}`;
    this.input.value = normalized;
    this.popupInput.value = normalized;
    this.previewLabel.textContent = normalized;
    this.previewChip.classList.remove('color-neo-chip--empty');
    this.trigger.classList.remove('color-neo-trigger--empty');
    this.handle.hidden = false;
    this.previewChip.style.background = normalized;
    this.trigger.style.background = normalized;
    this.updateHeartIcon(normalized);

    if (emitEvents) {
      if (this.historyEnabled) {
        this.pushHistory(normalized);
      }
      this.isSyncing = true;
      try {
        this.input.dispatchEvent(new Event('input', { bubbles: true }));
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
        this.input.dispatchEvent(new CustomEvent('colorneo:change', { detail: { value: normalized }, bubbles: true }));
        this.options.onChange?.(normalized);
      } finally {
        this.isSyncing = false;
      }
    }
  }

  private clearValue(emitEvents: boolean): void {
    this.input.value = '';
    this.popupInput.value = '';
    this.previewLabel.textContent = '';
    this.previewChip.classList.add('color-neo-chip--empty');
    this.trigger.classList.add('color-neo-trigger--empty');
    this.handle.hidden = true;
    this.previewChip.style.background = this.emptyColorPattern;
    this.trigger.style.background = this.emptyColorPattern;
    this.heartButton.classList.remove('color-neo-heart--active');
    this.heartButton.disabled = true;

    if (emitEvents) {
      this.isSyncing = true;
      try {
        this.input.dispatchEvent(new Event('input', { bubbles: true }));
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
        this.input.dispatchEvent(new CustomEvent('colorneo:change', { detail: { value: '' }, bubbles: true }));
        this.options.onChange?.('');
      } finally {
        this.isSyncing = false;
      }
    }
  }

  private renderHistory(colors = this.readHistory()): void {
    this.historyRow.replaceChildren();
    this.historySection.hidden = !this.historyEnabled || colors.length === 0;
    this.historyRow.hidden = colors.length === 0;

    for (const color of colors) {
      const swatchButton = document.createElement('button');
      swatchButton.type = 'button';
      swatchButton.className = 'color-neo-history-swatch';
      swatchButton.style.background = color;
      swatchButton.title = color;
      swatchButton.setAttribute('aria-label', `Use recent color ${color}`);
      swatchButton.addEventListener('click', () => {
        this.setValue(color, true);
      });
      this.historyRow.append(swatchButton);
    }
  }

  private pushHistory(hex: string): void {
    if (!this.historyEnabled) {
      return;
    }

    const normalized = normalizeHex(hex);
    const next = [normalized, ...this.readHistory().filter((value) => value !== normalized)].slice(0, this.historyMaxItems);
    this.writeHistory(next);
    this.renderHistory(next);
  }

  private readHistory(): string[] {
    if (!this.historyEnabled) {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(this.historyStorageKey);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      const history: string[] = [];

      for (const value of parsed) {
        if (typeof value !== 'string' || !isValidHex(value)) {
          continue;
        }

        const normalized = normalizeHex(value);
        if (!history.includes(normalized)) {
          history.push(normalized);
        }

        if (history.length >= this.historyMaxItems) {
          break;
        }
      }

      return history;
    } catch {
      return [];
    }
  }

  private writeHistory(colors: string[]): void {
    if (!this.historyEnabled) {
      return;
    }

    try {
      window.localStorage.setItem(this.historyStorageKey, JSON.stringify(colors));
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }

  private initializeFavorites(favoritesInput?: string[] | string): void {
    if (!favoritesInput) {
      return;
    }

    let favoritesList: string[] = [];

    if (typeof favoritesInput === 'string') {
      // Handle comma-separated string
      favoritesList = favoritesInput
        .split(',')
        .map((color) => color.trim())
        .filter((color) => color && isValidHex(color));
    } else if (Array.isArray(favoritesInput)) {
      // Handle array of colors
      favoritesList = favoritesInput.filter((color) => typeof color === 'string' && isValidHex(color));
    }

    for (const color of favoritesList) {
      const normalized = normalizeHex(color);
      this.favorites.add(normalized);
    }
  }

  private updateHeartIcon(hex: string): void {
    const normalized = normalizeHex(hex);
    const isFavorited = this.favorites.has(normalized);
    this.heartButton.disabled = false;
    if (isFavorited) {
      this.heartButton.classList.add('color-neo-heart--active');
      this.heartButton.title = 'Remove from favorites';
      this.heartButton.setAttribute('aria-label', 'Remove from favorites');
    } else {
      this.heartButton.classList.remove('color-neo-heart--active');
      this.heartButton.title = 'Add to favorites';
      this.heartButton.setAttribute('aria-label', 'Add to favorites');
    }
  }

  private toggleFavorite(hex: string): void {
    const normalized = normalizeHex(hex);
    if (this.favorites.has(normalized)) {
      this.favorites.delete(normalized);
    } else {
      this.favorites.add(normalized);
    }
    this.updateHeartIcon(normalized);
    this.renderFavorites();
    this.options.onFavoritesChange?.(Array.from(this.favorites));
  }

  private renderFavorites(): void {
    this.favoritesRow.replaceChildren();
    const favoritesList = Array.from(this.favorites);
    this.favoritesSection.hidden = favoritesList.length === 0;
    this.favoritesRow.hidden = favoritesList.length === 0;

    for (const color of favoritesList) {
      const swatchButton = document.createElement('button');
      swatchButton.type = 'button';
      swatchButton.className = 'color-neo-favorite-swatch';
      swatchButton.style.background = color;
      swatchButton.title = color;
      swatchButton.setAttribute('aria-label', `Use favorite color ${color}`);
      swatchButton.addEventListener('click', () => {
        this.setValue(color, true);
      });
      this.favoritesRow.append(swatchButton);
    }
  }

  getFavorites(): string[] {
    return Array.from(this.favorites);
  }

  setFavorites(colors: string[]): void {
    this.favorites.clear();
    this.initializeFavorites(colors);
    this.renderFavorites();
    this.updateHeartIcon(this.input.value);
    this.options.onFavoritesChange?.(Array.from(this.favorites));
  }
}
