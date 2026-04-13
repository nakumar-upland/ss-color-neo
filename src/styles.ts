export const COLOR_NEO_STYLE_ID = "color-neo-style";

export const COLOR_NEO_CSS = `
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

.color-neo-popup-inline {
  position: relative;
  left: 0;
  top: 0;
  max-width: 320px;
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

export function ensureStyles(): void {
  if (document.getElementById(COLOR_NEO_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = COLOR_NEO_STYLE_ID;
  style.textContent = COLOR_NEO_CSS;
  document.head.append(style);
}
