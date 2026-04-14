'use strict';

// src/color-utils.ts
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function normalizeHex(value) {
  const raw = value.trim().replace(/^#/, "").toLowerCase();
  const rgbMatch = value.trim().match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)$/i);
  if (rgbMatch) {
    return rgbToHex({
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3])
    });
  }
  if (raw.length === 3 && /^[0-9a-f]{3}$/i.test(raw)) {
    return `#${raw.split("").map((part) => part + part).join("")}`;
  }
  if (raw.length === 6 && /^[0-9a-f]{6}$/i.test(raw)) {
    return `#${raw}`;
  }
  return "#000000";
}
function isValidHex(value) {
  return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}
function rgbToHex({ r, g, b }) {
  const toHex = (component) => clamp(Math.round(component), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function hexToRgb(hex) {
  const normalized = normalizeHex(hex).slice(1);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16)
  };
}
function hsvToRgb({ h, s, v }) {
  const safeHue = (h % 360 + 360) % 360;
  const safeSaturation = clamp(s, 0, 1);
  const safeValue = clamp(v, 0, 1);
  const chroma = safeValue * safeSaturation;
  const hueSection = safeHue / 60;
  const x = chroma * (1 - Math.abs(hueSection % 2 - 1));
  const match = safeValue - chroma;
  let base;
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
function rgbToHsv({ r, g, b }) {
  const red = clamp(r, 0, 255) / 255;
  const green = clamp(g, 0, 255) / 255;
  const blue = clamp(b, 0, 255) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  if (delta !== 0) {
    if (max === red) {
      hue = 60 * ((green - blue) / delta % 6);
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
function hexToHsv(hex) {
  return rgbToHsv(hexToRgb(hex));
}
function hsvToHex(hsv) {
  return rgbToHex(hsvToRgb(hsv));
}

// src/styles.ts
var COLOR_NEO_STYLE_ID = "color-neo-style";
var COLOR_NEO_CSS = `
.color-neo-field {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
}

.color-neo-input {
  width: 132px;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #fff;
  color: #0f172a;
  font-size: 14px;
  letter-spacing: 0.02em;
}

.color-neo-trigger {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.7), 0 8px 20px rgba(15,23,42,0.18);
  cursor: pointer;
  background: var(--color-neo-current, #000000);
}

.color-neo-trigger--empty {
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.6), 0 8px 20px rgba(15,23,42,0.1);
}

.color-neo-field--swatch-left {
  gap: 6px;
  padding: 3px;
  border: 1px solid #cbd5e1;
  border-radius: 2px;
  background: #ffffff;
}

.color-neo-field--swatch-left .color-neo-trigger {
  width: 24px;
  height: 24px;
  border-radius: 2px;
  flex: 0 0 auto;
  box-shadow: none;
}

.color-neo-field--swatch-left .color-neo-input {
  width: 92px;
  padding: 4px 6px;
  border: 0;
  border-radius: 2px;
  font-size: 12px;
  background: transparent;
}

.color-neo-popup {
  --color-neo-popup-width: 260px;
  --color-neo-swatch-height: 168px;
  position: fixed;
  z-index: 9999;
  box-sizing: border-box;
  width: min(var(--color-neo-popup-width), calc(100vw - 16px));
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 20px;
  background:
    radial-gradient(circle at top left, rgba(251, 191, 36, 0.16), transparent 32%),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.16), transparent 28%),
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98));
  box-shadow: 0 24px 60px rgba(15,23,42,0.18);
  backdrop-filter: blur(16px);
}

.color-neo-popup--small {
  --color-neo-popup-width: 220px;
  --color-neo-swatch-height: 128px;
}

.color-neo-popup--medium {
  --color-neo-popup-width: 260px;
  --color-neo-swatch-height: 168px;
}

.color-neo-popup--large {
  --color-neo-popup-width: 320px;
  --color-neo-swatch-height: 208px;
}

.color-neo-popup[hidden] {
  display: none;
}

.color-neo-popup-inline {
  position: relative;
  left: 0;
  top: 0;
  width: min(var(--color-neo-popup-width), 100%);
  max-width: 100%;
}

.color-neo-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.color-neo-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-neo-chip {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: var(--color-neo-current, #000000);
}

.color-neo-chip--empty {
  border-color: rgba(148, 163, 184, 0.6);
}

.color-neo-value {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  text-transform: uppercase;
}

.color-neo-eyedropper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  padding: 0;
  background: #0f172a;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
  transition: transform 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;
}

.color-neo-eyedropper:hover {
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.26);
}

.color-neo-eyedropper:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

.color-neo-eyedropper-icon {
  display: inline-flex;
  width: 14px;
  height: 14px;
}

.color-neo-eyedropper-icon svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.color-neo-eyedropper-label {
  display: inline-block;
}

.color-neo-eyedropper[hidden] {
  display: none;
}

.color-neo-swatch {
  position: relative;
  width: 100%;
  height: var(--color-neo-swatch-height);
  border-radius: 16px;
  cursor: crosshair;
  overflow: hidden;
  background:
    linear-gradient(to top, black, transparent),
    linear-gradient(to right, white, hsl(0deg 100% 50%));
}

.color-neo-swatch::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.35);
  pointer-events: none;
}

.color-neo-handle {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(15,23,42,0.15);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.color-neo-slider-wrap {
  margin-top: 14px;
}

.color-neo-slider-label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.color-neo-slider {
  width: 100%;
  appearance: none;
  height: 12px;
  border-radius: 999px;
  outline: none;
  background: linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
}

.color-neo-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid #fff;
  background: #0f172a;
  box-shadow: 0 2px 10px rgba(15,23,42,0.22);
}

.color-neo-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid #fff;
  background: #0f172a;
  box-shadow: 0 2px 10px rgba(15,23,42,0.22);
}

.color-neo-popup-input {
  width: 100%;
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: rgba(255,255,255,0.9);
  color: #0f172a;
  font-size: 14px;
}

.color-neo-history {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.color-neo-history[hidden] {
  display: none;
}

.color-neo-history-swatch {
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 999px;
  padding: 0;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.14);
  transition: transform 0.14s ease, box-shadow 0.14s ease;
}

.color-neo-history-swatch:hover {
  transform: translateY(-1px);
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.2), 0 4px 10px rgba(15, 23, 42, 0.18);
}

.color-neo-history-swatch:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}
`;
function ensureStyles() {
  if (document.getElementById(COLOR_NEO_STYLE_ID)) {
    return;
  }
  const style = document.createElement("style");
  style.id = COLOR_NEO_STYLE_ID;
  style.textContent = COLOR_NEO_CSS;
  document.head.append(style);
}

// src/color-neo.ts
var ColorNeo = class {
  constructor(target, options = {}) {
    this.emptyColorPattern = "repeating-linear-gradient(135deg, #e2e8f0 0 6px, #ffffff 6px 12px)";
    this.hsv = hexToHsv("#000000");
    this.isSyncing = false;
    this.popupAnchor = null;
    this.hexInputDebounceMs = 2e3;
    this.historyMaxItems = 7;
    this.hexInputTimer = null;
    this.positionPopup = () => {
      if (this.popup.hidden) {
        return;
      }
      if (this.isInlineMount) {
        this.popup.style.left = "0px";
        this.popup.style.top = "0px";
        this.popup.style.right = "auto";
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
    const targetElement = typeof target === "string" ? document.querySelector(target) : target;
    if (!targetElement) {
      throw new Error("ColorNeo target element was not found.");
    }
    let input;
    if (targetElement instanceof HTMLInputElement) {
      input = targetElement;
      this.isInlineMount = false;
      this.mountContainer = null;
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.hidden = true;
      input.setAttribute("aria-hidden", "true");
      this.isInlineMount = true;
      this.mountContainer = targetElement;
    }
    ensureStyles();
    this.input = input;
    this.options = {
      closeOnSelect: options.closeOnSelect ?? false,
      historyStorageKey: options.historyStorageKey ?? "color-neo-history",
      onChange: options.onChange,
      mode: options.mode ?? "default",
      size: options.size ?? "medium"
    };
    this.mode = this.options.mode ?? "default";
    this.size = this.options.size ?? "medium";
    this.historyStorageKey = this.options.historyStorageKey ?? "color-neo-history";
    this.input.classList.add("color-neo-input");
    this.input.spellcheck = false;
    this.input.autocomplete = "off";
    this.wrapper = document.createElement("div");
    this.wrapper.className = "color-neo-field";
    if (this.mode === "hex-swatch-left") {
      this.wrapper.classList.add("color-neo-field--swatch-left");
    }
    this.trigger = document.createElement("button");
    this.trigger.type = "button";
    this.trigger.className = "color-neo-trigger";
    this.trigger.setAttribute("aria-label", "Open color picker");
    this.popup = document.createElement("div");
    this.popup.className = "color-neo-popup";
    this.popup.classList.add(`color-neo-popup--${this.size}`);
    this.popup.hidden = true;
    const topbar = document.createElement("div");
    topbar.className = "color-neo-topbar";
    const preview = document.createElement("div");
    preview.className = "color-neo-preview";
    this.previewChip = document.createElement("div");
    this.previewChip.className = "color-neo-chip";
    this.previewLabel = document.createElement("span");
    this.previewLabel.className = "color-neo-value";
    preview.append(this.previewChip, this.previewLabel);
    this.eyeDropperButton = document.createElement("button");
    this.eyeDropperButton.type = "button";
    this.eyeDropperButton.className = "color-neo-eyedropper";
    this.eyeDropperButton.title = "Pick color";
    this.eyeDropperButton.setAttribute("aria-label", "Pick color");
    const eyeDropperIcon = document.createElement("span");
    eyeDropperIcon.className = "color-neo-eyedropper-icon";
    eyeDropperIcon.setAttribute("aria-hidden", "true");
    eyeDropperIcon.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><path d="M15.8 5.2a2.8 2.8 0 0 1 4 4l-2 2 1.2 1.2a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4 0L15 14l-6.7 6.7a4 4 0 0 1-2.8 1.2H3a1 1 0 0 1-1-1v-2.5a4 4 0 0 1 1.2-2.8L9.9 9 8.6 7.8a1 1 0 0 1 0-1.4L10 5a1 1 0 0 1 1.4 0l1.2 1.2 2-2zM4 19v1h1a2 2 0 0 0 1.4-.6l6.2-6.2-1.4-1.4L5.6 17.4A2 2 0 0 0 5 18.8V19H4z"/></svg>';
    this.eyeDropperButton.append(eyeDropperIcon);
    this.eyeDropperButton.hidden = !("EyeDropper" in window);
    topbar.append(preview, this.eyeDropperButton);
    this.swatch = document.createElement("div");
    this.swatch.className = "color-neo-swatch";
    this.handle = document.createElement("div");
    this.handle.className = "color-neo-handle";
    this.swatch.append(this.handle);
    const sliderWrap = document.createElement("div");
    sliderWrap.className = "color-neo-slider-wrap";
    this.hueSlider = document.createElement("input");
    this.hueSlider.className = "color-neo-slider";
    this.hueSlider.type = "range";
    this.hueSlider.min = "0";
    this.hueSlider.max = "360";
    this.hueSlider.value = "0";
    this.hueSlider.setAttribute("aria-label", "Shade slider");
    sliderWrap.append(this.hueSlider);
    this.popupInput = document.createElement("input");
    this.popupInput.className = "color-neo-popup-input";
    this.popupInput.type = "text";
    this.popupInput.setAttribute("aria-label", "Hex color value");
    this.historyRow = document.createElement("div");
    this.historyRow.className = "color-neo-history";
    this.popup.append(topbar, this.swatch, sliderWrap, this.historyRow, this.popupInput);
    this.boundDocumentClick = (event) => {
      const targetNode = event.target;
      if (!targetNode || this.wrapper.contains(targetNode) || this.popup.contains(targetNode)) {
        return;
      }
      this.close();
    };
    this.boundEscape = (event) => {
      if (event.key === "Escape") {
        this.close();
      }
    };
    this.mount();
    this.bindEvents();
    this.renderHistory();
    const initial = options.color ?? input.value ?? "#000000";
    this.setValue(initial);
  }
  open(anchor) {
    this.popupAnchor = anchor ?? null;
    this.attachPopupToHost();
    this.popup.hidden = false;
    this.positionPopup();
  }
  close() {
    this.popup.hidden = true;
  }
  toggle() {
    if (this.popup.hidden) {
      this.open();
      return;
    }
    this.close();
  }
  destroy() {
    if (this.hexInputTimer !== null) {
      window.clearTimeout(this.hexInputTimer);
      this.hexInputTimer = null;
    }
    document.removeEventListener("mousedown", this.boundDocumentClick);
    document.removeEventListener("keydown", this.boundEscape);
    window.removeEventListener("resize", this.positionPopup);
    window.removeEventListener("scroll", this.positionPopup, true);
    this.popup.remove();
    this.trigger.remove();
    if (this.isInlineMount) {
      this.input.remove();
      this.input.classList.remove("color-neo-input");
      return;
    }
    const parent = this.wrapper.parentElement;
    if (parent) {
      parent.insertBefore(this.input, this.wrapper);
      this.wrapper.remove();
    }
    this.input.classList.remove("color-neo-input");
  }
  setValue(nextValue, emitEvents = false) {
    if (nextValue.trim() === "") {
      this.clearValue(emitEvents);
      return;
    }
    const normalized = normalizeHex(nextValue);
    this.hsv = hexToHsv(normalized);
    this.syncUi(normalized, emitEvents);
  }
  setColor(nextColor, emitEvents = false) {
    this.setValue(nextColor, emitEvents);
  }
  mount() {
    if (this.isInlineMount && this.mountContainer) {
      this.mountContainer.append(this.input);
      this.attachPopupToHost();
      this.popup.classList.add("color-neo-popup-inline");
      this.popup.hidden = false;
      return;
    }
    const parent = this.input.parentElement;
    if (!parent) {
      throw new Error("ColorNeo input requires a parent element.");
    }
    parent.insertBefore(this.wrapper, this.input);
    if (this.mode === "hex-swatch-left") {
      this.wrapper.append(this.trigger, this.input);
    } else {
      this.wrapper.append(this.input, this.trigger);
    }
    this.attachPopupToHost();
  }
  attachPopupToHost() {
    if (this.isInlineMount && this.mountContainer) {
      if (this.popup.parentElement !== this.mountContainer) {
        this.mountContainer.append(this.popup);
      }
      return;
    }
    const hostTarget = this.popupAnchor ?? this.input;
    const dialogHost = hostTarget.closest("dialog[open]");
    const popoverHost = hostTarget.closest("[popover]");
    const host = dialogHost ?? popoverHost ?? document.body;
    if (this.popup.parentElement !== host) {
      host.append(this.popup);
    }
  }
  bindEvents() {
    if (!this.isInlineMount) {
      this.trigger.addEventListener("click", () => this.toggle());
      this.input.addEventListener("focus", () => this.open());
      this.input.addEventListener("click", () => this.open());
    }
    this.input.addEventListener("input", () => {
      if (this.isSyncing) {
        return;
      }
      this.scheduleHexInputSync(this.input.value);
    });
    this.popupInput.addEventListener("input", () => {
      if (this.isSyncing) {
        return;
      }
      this.scheduleHexInputSync(this.popupInput.value);
    });
    this.hueSlider.addEventListener("input", () => {
      this.hsv.h = Number(this.hueSlider.value);
      this.syncUi(hsvToHex(this.hsv), true);
    });
    const handlePointer = (event) => {
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
    this.swatch.addEventListener("pointerdown", (event) => {
      handlePointer(event);
      const move = (pointerEvent) => handlePointer(pointerEvent);
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
    this.eyeDropperButton.addEventListener("click", async () => {
      const EyeDropperConstructor = window.EyeDropper;
      if (!EyeDropperConstructor) {
        return;
      }
      try {
        const eyeDropper = new EyeDropperConstructor();
        const result = await eyeDropper.open();
        this.setValue(result.sRGBHex, true);
      } catch {
      }
    });
    if (!this.isInlineMount) {
      document.addEventListener("mousedown", this.boundDocumentClick);
      document.addEventListener("keydown", this.boundEscape);
      window.addEventListener("resize", this.positionPopup);
      window.addEventListener("scroll", this.positionPopup, true);
    }
  }
  scheduleHexInputSync(value) {
    if (this.hexInputTimer !== null) {
      window.clearTimeout(this.hexInputTimer);
    }
    this.hexInputTimer = window.setTimeout(() => {
      if (value.trim() === "") {
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
  syncUi(hex, emitEvents) {
    const normalized = normalizeHex(hex);
    const hueBackground = `linear-gradient(to right, white, hsl(${this.hsv.h}deg 100% 50%))`;
    this.swatch.style.background = `linear-gradient(to top, black, transparent), ${hueBackground}`;
    this.handle.style.left = `${this.hsv.s * 100}%`;
    this.handle.style.top = `${(1 - this.hsv.v) * 100}%`;
    this.hueSlider.value = `${Math.round(this.hsv.h)}`;
    this.input.value = normalized;
    this.popupInput.value = normalized;
    this.previewLabel.textContent = normalized;
    this.previewChip.classList.remove("color-neo-chip--empty");
    this.trigger.classList.remove("color-neo-trigger--empty");
    this.handle.hidden = false;
    this.previewChip.style.background = normalized;
    this.trigger.style.background = normalized;
    if (emitEvents) {
      this.pushHistory(normalized);
      this.isSyncing = true;
      try {
        this.input.dispatchEvent(new Event("input", { bubbles: true }));
        this.input.dispatchEvent(new Event("change", { bubbles: true }));
        this.input.dispatchEvent(new CustomEvent("colorneo:change", { detail: { value: normalized }, bubbles: true }));
        this.options.onChange?.(normalized);
      } finally {
        this.isSyncing = false;
      }
    }
  }
  clearValue(emitEvents) {
    this.input.value = "";
    this.popupInput.value = "";
    this.previewLabel.textContent = "";
    this.previewChip.classList.add("color-neo-chip--empty");
    this.trigger.classList.add("color-neo-trigger--empty");
    this.handle.hidden = true;
    this.previewChip.style.background = this.emptyColorPattern;
    this.trigger.style.background = this.emptyColorPattern;
    if (emitEvents) {
      this.isSyncing = true;
      try {
        this.input.dispatchEvent(new Event("input", { bubbles: true }));
        this.input.dispatchEvent(new Event("change", { bubbles: true }));
        this.input.dispatchEvent(new CustomEvent("colorneo:change", { detail: { value: "" }, bubbles: true }));
        this.options.onChange?.("");
      } finally {
        this.isSyncing = false;
      }
    }
  }
  renderHistory(colors = this.readHistory()) {
    this.historyRow.replaceChildren();
    this.historyRow.hidden = colors.length === 0;
    for (const color of colors) {
      const swatchButton = document.createElement("button");
      swatchButton.type = "button";
      swatchButton.className = "color-neo-history-swatch";
      swatchButton.style.background = color;
      swatchButton.title = color;
      swatchButton.setAttribute("aria-label", `Use recent color ${color}`);
      swatchButton.addEventListener("click", () => {
        this.setValue(color, true);
      });
      this.historyRow.append(swatchButton);
    }
  }
  pushHistory(hex) {
    const normalized = normalizeHex(hex);
    const next = [normalized, ...this.readHistory().filter((value) => value !== normalized)].slice(0, this.historyMaxItems);
    this.writeHistory(next);
    this.renderHistory(next);
  }
  readHistory() {
    try {
      const raw = window.localStorage.getItem(this.historyStorageKey);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const history = [];
      for (const value of parsed) {
        if (typeof value !== "string" || !isValidHex(value)) {
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
  writeHistory(colors) {
    try {
      window.localStorage.setItem(this.historyStorageKey, JSON.stringify(colors));
    } catch {
    }
  }
};

// src/index.ts
function attachColorNeo(selector, options) {
  return Array.from(document.querySelectorAll(selector)).map((input) => new ColorNeo(input, options));
}
function mountColorNeo(parent, options) {
  const target = typeof parent === "string" ? document.querySelector(parent) : parent;
  if (!target) {
    throw new Error("mountColorNeo target parent was not found.");
  }
  return new ColorNeo(target, options);
}
function destroyColorNeo(target) {
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

exports.ColorNeo = ColorNeo;
exports.attachColorNeo = attachColorNeo;
exports.clamp = clamp;
exports.destroyColorNeo = destroyColorNeo;
exports.hexToHsv = hexToHsv;
exports.hexToRgb = hexToRgb;
exports.hsvToHex = hsvToHex;
exports.hsvToRgb = hsvToRgb;
exports.isValidHex = isValidHex;
exports.mountColorNeo = mountColorNeo;
exports.normalizeHex = normalizeHex;
exports.rgbToHex = rgbToHex;
exports.rgbToHsv = rgbToHsv;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.cjs.map