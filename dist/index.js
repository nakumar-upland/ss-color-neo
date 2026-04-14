// src/color-utils.ts
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function normalizeHex(value) {
  const raw = value.trim().replace(/^#/, "").toLowerCase();
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

.color-neo-popup {
  position: fixed;
  z-index: 9999;
  width: 280px;
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

.color-neo-popup[hidden] {
  display: none;
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
  border: 0;
  border-radius: 999px;
  padding: 8px 12px;
  background: #0f172a;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.color-neo-eyedropper[hidden] {
  display: none;
}

.color-neo-swatch {
  position: relative;
  width: 100%;
  height: 180px;
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
    this.hsv = hexToHsv("#000000");
    this.isSyncing = false;
    this.positionPopup = () => {
      if (this.popup.hidden) {
        return;
      }
      const rect = this.wrapper.getBoundingClientRect();
      const popupWidth = 280;
      const popupHeight = 340;
      const gap = 10;
      const left = clamp(rect.left, 8, window.innerWidth - popupWidth - 8);
      const top = rect.bottom + popupHeight + gap > window.innerHeight ? rect.top - popupHeight - gap : rect.bottom + gap;
      this.popup.style.left = `${left}px`;
      this.popup.style.top = `${Math.max(8, top)}px`;
    };
    const input = typeof target === "string" ? document.querySelector(target) : target;
    if (!input) {
      throw new Error("ColorNeo target input was not found.");
    }
    ensureStyles();
    this.input = input;
    this.options = {
      closeOnSelect: options.closeOnSelect ?? false,
      onChange: options.onChange,
      value: options.value
    };
    this.input.classList.add("color-neo-input");
    this.input.spellcheck = false;
    this.input.autocomplete = "off";
    this.wrapper = document.createElement("div");
    this.wrapper.className = "color-neo-field";
    this.trigger = document.createElement("button");
    this.trigger.type = "button";
    this.trigger.className = "color-neo-trigger";
    this.trigger.setAttribute("aria-label", "Open color picker");
    this.popup = document.createElement("div");
    this.popup.className = "color-neo-popup";
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
    this.eyeDropperButton.textContent = "Pick";
    this.eyeDropperButton.hidden = !("EyeDropper" in window);
    topbar.append(preview, this.eyeDropperButton);
    this.swatch = document.createElement("div");
    this.swatch.className = "color-neo-swatch";
    this.handle = document.createElement("div");
    this.handle.className = "color-neo-handle";
    this.swatch.append(this.handle);
    const sliderWrap = document.createElement("div");
    sliderWrap.className = "color-neo-slider-wrap";
    const sliderLabel = document.createElement("div");
    sliderLabel.className = "color-neo-slider-label";
    sliderLabel.textContent = "Shade slider";
    this.hueSlider = document.createElement("input");
    this.hueSlider.className = "color-neo-slider";
    this.hueSlider.type = "range";
    this.hueSlider.min = "0";
    this.hueSlider.max = "360";
    this.hueSlider.value = "0";
    sliderWrap.append(sliderLabel, this.hueSlider);
    this.popupInput = document.createElement("input");
    this.popupInput.className = "color-neo-popup-input";
    this.popupInput.type = "text";
    this.popupInput.setAttribute("aria-label", "Hex color value");
    this.popup.append(topbar, this.swatch, sliderWrap, this.popupInput);
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
    const initial = options.value ?? input.value ?? "#000000";
    this.setValue(initial);
  }
  open() {
    this.positionPopup();
    this.popup.hidden = false;
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
    document.removeEventListener("mousedown", this.boundDocumentClick);
    document.removeEventListener("keydown", this.boundEscape);
    window.removeEventListener("resize", this.positionPopup);
    window.removeEventListener("scroll", this.positionPopup, true);
    this.popup.remove();
    this.trigger.remove();
    const parent = this.wrapper.parentElement;
    if (parent) {
      parent.insertBefore(this.input, this.wrapper);
      this.wrapper.remove();
    }
    this.input.classList.remove("color-neo-input");
  }
  setValue(nextValue, emitEvents = false) {
    const normalized = normalizeHex(nextValue);
    this.hsv = hexToHsv(normalized);
    this.syncUi(normalized, emitEvents);
  }
  mount() {
    const parent = this.input.parentElement;
    if (!parent) {
      throw new Error("ColorNeo input requires a parent element.");
    }
    parent.insertBefore(this.wrapper, this.input);
    this.wrapper.append(this.input, this.trigger);
    document.body.append(this.popup);
  }
  bindEvents() {
    this.trigger.addEventListener("click", () => this.toggle());
    this.input.addEventListener("focus", () => this.open());
    this.input.addEventListener("input", () => {
      if (this.isSyncing) {
        return;
      }
      if (isValidHex(this.input.value)) {
        this.setValue(this.input.value, true);
      }
    });
    this.popupInput.addEventListener("input", () => {
      if (this.isSyncing) {
        return;
      }
      if (isValidHex(this.popupInput.value)) {
        this.setValue(this.popupInput.value, true);
      }
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
    document.addEventListener("mousedown", this.boundDocumentClick);
    document.addEventListener("keydown", this.boundEscape);
    window.addEventListener("resize", this.positionPopup);
    window.addEventListener("scroll", this.positionPopup, true);
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
    this.previewChip.style.setProperty("--color-neo-current", normalized);
    this.trigger.style.setProperty("--color-neo-current", normalized);
    this.previewChip.style.background = normalized;
    this.trigger.style.background = normalized;
    if (emitEvents) {
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
};

// src/index.ts
function attachColorNeo(selector, options) {
  return Array.from(document.querySelectorAll(selector)).map((input) => new ColorNeo(input, options));
}

export { ColorNeo, attachColorNeo, clamp, hexToHsv, hexToRgb, hsvToHex, hsvToRgb, isValidHex, normalizeHex, rgbToHex, rgbToHsv };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.js.map