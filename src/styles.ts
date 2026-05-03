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
  touch-action: none;
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

.color-neo-group {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(148, 163, 184, 0.24);
}

.color-neo-group[hidden] {
  display: none;
}

.color-neo-group-label {
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
}

.color-neo-history {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 0;
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

.color-neo-heart {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 6px;
  padding: 0;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  transition: color 0.14s ease, background-color 0.14s ease, transform 0.14s ease;
}


/* Only show hover for non-favorite */
.color-neo-heart:not(.color-neo-heart--active):hover:not(:disabled) {
  background: #e5e7eb;
  color: #64748b;
  transform: scale(1.1);
}

.color-neo-heart:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 1px;
}

.color-neo-heart--active {
  color: #ec4899;
}

/* Only show hover for favorite */
.color-neo-heart.color-neo-heart--active:hover:not(:disabled) {
  background: #fef2f2;
  color: #be185d;
  transform: scale(1.1);
}

.color-neo-heart:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.color-neo-heart-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
}

.color-neo-heart-icon svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 0;
}

.color-neo-favorites {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 0;
}

.color-neo-favorites[hidden] {
  display: none;
}

.color-neo-favorite-swatch {
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 999px;
  padding: 0;
  cursor: pointer;
  box-shadow: inset 0 0 0 1.5px rgba(236, 72, 153, 0.3);
  transition: transform 0.14s ease, box-shadow 0.14s ease;
}

.color-neo-favorite-swatch:hover {
  transform: translateY(-1px);
  box-shadow: inset 0 0 0 1.5px rgba(236, 72, 153, 0.5), 0 4px 10px rgba(236, 72, 153, 0.2);
}

.color-neo-favorite-swatch:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

/* Compact mode when both favorites and history are present */
.color-neo-popup--both-groups .color-neo-group-label {
  font-size: 10px;
  margin-bottom: 6px;
}

.color-neo-popup--both-groups .color-neo-history-swatch {
  width: 14px;
  height: 14px;
}

.color-neo-popup--both-groups .color-neo-history-swatch:hover {
  transform: scale(1.35);
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.2), 0 4px 10px rgba(15, 23, 42, 0.18);
}

.color-neo-popup--both-groups .color-neo-favorite-swatch {
  width: 14px;
  height: 14px;
}

.color-neo-popup--both-groups .color-neo-favorite-swatch:hover {
  transform: scale(1.35);
  box-shadow: inset 0 0 0 1.5px rgba(236, 72, 153, 0.5), 0 4px 10px rgba(236, 72, 153, 0.2);
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
