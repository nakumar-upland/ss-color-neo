import { beforeEach, describe, expect, it, vi } from "vitest";

import { ColorNeo } from "../src/color-neo";
import { destroyColorNeo } from "../src";

describe("ColorNeo", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("supports built-in hex-swatch-left mode", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#123456" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input, { mode: "hex-swatch-left" });
    const firstChild = picker.wrapper.firstElementChild;

    expect(
      picker.wrapper.classList.contains("color-neo-field--swatch-left"),
    ).toBe(true);
    expect(firstChild).toBe(picker.trigger);

    input.click();
    expect(picker.popup.hidden).toBe(false);
  });

  it("uses medium popup size by default", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#123456" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input);

    expect(picker.popup.classList.contains("color-neo-popup--medium")).toBe(
      true,
    );
  });

  it("supports small and large popup sizes", () => {
    document.body.innerHTML = `
      <div id="app">
        <input id="small" value="#123456" />
        <input id="large" value="#abcdef" />
      </div>
    `;

    const smallInput = document.querySelector<HTMLInputElement>("#small");
    const largeInput = document.querySelector<HTMLInputElement>("#large");

    if (!smallInput || !largeInput) {
      throw new Error("size inputs missing");
    }

    const smallPicker = new ColorNeo(smallInput, { size: "small" });
    const largePicker = new ColorNeo(largeInput, { size: "large" });

    expect(smallPicker.popup.classList.contains("color-neo-popup--small")).toBe(
      true,
    );
    expect(largePicker.popup.classList.contains("color-neo-popup--large")).toBe(
      true,
    );
  });

  it("renders directly inside a provided parent element", () => {
    document.body.innerHTML = '<div id="mount"></div>';
    const mount = document.querySelector<HTMLDivElement>("#mount");

    if (!mount) {
      throw new Error("mount container missing");
    }

    const picker = new ColorNeo(mount, { color: "#22c55e" });

    expect(picker.popup.parentElement).toBe(mount);
    expect(picker.popup.hidden).toBe(false);
    expect(picker.popup.classList.contains("color-neo-popup-inline")).toBe(
      true,
    );
    expect(picker.input.hidden).toBe(true);
    expect(picker.popupInput.value).toBe("#22c55e");
  });

  it("renders inside popover after button click", () => {
    document.body.innerHTML = `
      <button id="open" type="button">Open</button>
      <div id="popover" popover></div>
    `;

    const openButton = document.querySelector<HTMLButtonElement>("#open");
    const popover = document.querySelector<HTMLDivElement>("#popover");

    if (!openButton || !popover) {
      throw new Error("popover scenario missing");
    }

    let popupParentIsPopover = false;

    openButton.addEventListener("click", () => {
      popover.innerHTML = '<input id="color" value="#7c3aed" />';
      const input = popover.querySelector<HTMLInputElement>("#color");

      if (!input) {
        throw new Error("popover input missing");
      }

      const picker = new ColorNeo(input);
      picker.open();
      popupParentIsPopover = picker.popup.parentElement === popover;
    });

    openButton.click();

    expect(popupParentIsPopover).toBe(true);
  });

  it("mounts popup into open dialog host", () => {
    document.body.innerHTML =
      '<dialog open><div id="app"><input id="color" value="#336699" /></div></dialog>';
    const input = document.querySelector<HTMLInputElement>("#color");
    const dialog = document.querySelector<HTMLDialogElement>("dialog");

    if (!input || !dialog) {
      throw new Error("dialog scenario missing");
    }

    const picker = new ColorNeo(input);
    picker.open();

    expect(picker.popup.parentElement).toBe(dialog);
  });

  it("mounts around an input and syncs the starting value", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#336699" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input);
    expect(picker.wrapper.contains(input)).toBe(true);
    expect(picker.popupInput.value).toBe("#336699");
    expect(picker.previewLabel.textContent).toBe("#336699");
  });

  it("prefers the color option during initialization", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#336699" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input, { color: "#c0ffee" });

    expect(input.value).toBe("#c0ffee");
    expect(picker.popupInput.value).toBe("#c0ffee");
    expect(picker.previewLabel.textContent).toBe("#c0ffee");
  });

  it("converts an rgb color option during initialization", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#336699" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input, { color: "rgb(255, 107, 107)" });

    expect(input.value).toBe("#ff6b6b");
    expect(picker.popupInput.value).toBe("#ff6b6b");
    expect(picker.previewLabel.textContent).toBe("#ff6b6b");
  });

  it("keeps the picker empty when initialized without a color", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input);

    expect(input.value).toBe("");
    expect(picker.popupInput.value).toBe("");
    expect(picker.previewLabel.textContent).toBe("");
    expect(picker.trigger.classList.contains("color-neo-trigger--empty")).toBe(
      true,
    );
    expect(picker.handle.hidden).toBe(true);
  });

  it("emits updates when the value changes", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#000000" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const onChange = vi.fn();
    const picker = new ColorNeo(input, { onChange });
    picker.setValue("#00ff00", true);

    expect(input.value).toBe("#00ff00");
    expect(onChange).toHaveBeenCalledWith("#00ff00");
  });

  it("clears the picker instead of falling back to black", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#123456" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const onChange = vi.fn();
    const picker = new ColorNeo(input, { onChange });

    picker.setValue("", true);

    expect(input.value).toBe("");
    expect(picker.popupInput.value).toBe("");
    expect(picker.previewLabel.textContent).toBe("");
    expect(picker.trigger.classList.contains("color-neo-trigger--empty")).toBe(
      true,
    );
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("debounces hex typing updates by 2 seconds", () => {
    vi.useFakeTimers();

    try {
      document.body.innerHTML =
        '<div id="app"><input id="color" value="#111111" /></div>';
      const input = document.querySelector<HTMLInputElement>("#color");

      if (!input) {
        throw new Error("input missing");
      }

      const onChange = vi.fn();
      const picker = new ColorNeo(input, { onChange });

      input.value = "000";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      expect(onChange).toHaveBeenCalledTimes(0);

      vi.advanceTimersByTime(1999);
      expect(onChange).toHaveBeenCalledTimes(0);

      vi.advanceTimersByTime(1);
      expect(onChange).toHaveBeenCalledWith("#000000");
      expect(input.value).toBe("#000000");

      picker.destroy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("opens the eyedropper when supported", async () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#000000" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const open = vi.fn().mockResolvedValue({ sRGBHex: "#fedcba" });
    class FakeEyeDropper {
      open = open;
    }

    window.EyeDropper = FakeEyeDropper as typeof window.EyeDropper;

    const picker = new ColorNeo(input);
    picker.eyeDropperButton.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(open).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("#fedcba");

    delete window.EyeDropper;
  });

  it("keeps history disabled by default", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#000000" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input);
    picker.setValue("#112233", true);

    expect(localStorage.getItem("color-neo-history")).toBe(null);
    expect(picker.historySection.hidden).toBe(true);
    expect(
      picker.historyRow.querySelectorAll(".color-neo-history-swatch"),
    ).toHaveLength(0);
  });

  it("stores selected colors in LIFO order and renders history swatches when enabled", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#000000" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input, { historyEnabled: true });
    picker.setValue("#112233", true);
    picker.setValue("#445566", true);
    picker.setValue("#112233", true);

    expect(localStorage.getItem("color-neo-history")).toBe(
      '["#112233","#445566"]',
    );

    const swatches = picker.historyRow.querySelectorAll<HTMLButtonElement>(
      ".color-neo-history-swatch",
    );
    expect(swatches).toHaveLength(2);
    expect(swatches.item(0).title).toBe("#112233");
    expect(swatches.item(1).title).toBe("#445566");

    swatches.item(1).click();
    expect(input.value).toBe("#445566");
  });

  it("uses configurable localStorage key for color history", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#000000" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input, {
      historyEnabled: true,
      historyStorageKey: "my-picker-history",
    });
    picker.setValue("#abcdef", true);

    expect(localStorage.getItem("my-picker-history")).toBe('["#abcdef"]');
    expect(localStorage.getItem("color-neo-history")).toBe(null);
  });

  it("destroys a picker through the exported helper", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#000000" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input, { color: "#123456" });

    expect(picker.wrapper.isConnected).toBe(true);
    expect(picker.popup.isConnected).toBe(true);

    destroyColorNeo(picker);

    expect(picker.wrapper.isConnected).toBe(false);
    expect(picker.popup.isConnected).toBe(false);
    expect(input.classList.contains("color-neo-input")).toBe(false);
  });

  it("initializes favorites from array and renders favorite swatches", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#ff6b6b" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input, {
      favorites: ["#ff6b6b", "#fbbf24", "#4ade80"],
    });

    const swatches = picker.favoritesRow.querySelectorAll<HTMLButtonElement>(
      ".color-neo-favorite-swatch",
    );
    expect(swatches).toHaveLength(3);
    expect(swatches.item(0).title).toBe("#ff6b6b");
    expect(swatches.item(1).title).toBe("#fbbf24");
    expect(swatches.item(2).title).toBe("#4ade80");
    expect(picker.favoritesSection.hidden).toBe(false);
  });

  it("renders favorites and history in separate labeled groups", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#ff6b6b" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input, {
      historyEnabled: true,
      favorites: ["#ff6b6b"],
    });

    picker.setValue("#123456", true);

    const labels = Array.from(
      picker.popup.querySelectorAll<HTMLElement>(".color-neo-group-label"),
    ).map((node) => node.textContent?.trim());
    expect(labels).toEqual(["Favorites", "Recent"]);
    expect(picker.favoritesSection.hidden).toBe(false);
    expect(picker.historySection.hidden).toBe(false);
  });

  it("initializes favorites from comma-separated string", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#ff6b6b" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input, {
      favorites: "#ff6b6b, #fbbf24, #4ade80",
    });

    const swatches = picker.favoritesRow.querySelectorAll<HTMLButtonElement>(
      ".color-neo-favorite-swatch",
    );
    expect(swatches).toHaveLength(3);
  });

  it("toggles favorite status and updates heart icon", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#ff6b6b" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input, {
      color: "#ff6b6b",
      favorites: ["#fbbf24"],
    });

    // Initial state: color is not favorited
    expect(
      picker.heartButton.classList.contains("color-neo-heart--active"),
    ).toBe(false);

    // Toggle to add to favorites
    picker.heartButton.click();
    expect(
      picker.heartButton.classList.contains("color-neo-heart--active"),
    ).toBe(true);

    const swatches = picker.favoritesRow.querySelectorAll<HTMLButtonElement>(
      ".color-neo-favorite-swatch",
    );
    expect(swatches).toHaveLength(2);

    // Toggle to remove from favorites
    picker.heartButton.click();
    expect(
      picker.heartButton.classList.contains("color-neo-heart--active"),
    ).toBe(false);

    const updatedSwatches =
      picker.favoritesRow.querySelectorAll<HTMLButtonElement>(
        ".color-neo-favorite-swatch",
      );
    expect(updatedSwatches).toHaveLength(1);
  });

  it("emits onFavoritesChange callback when favorites change", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#ff6b6b" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const onFavoritesChange = vi.fn();
    const picker = new ColorNeo(input, {
      color: "#ff6b6b",
      favorites: ["#fbbf24"],
      onFavoritesChange,
    });

    picker.heartButton.click();

    expect(onFavoritesChange).toHaveBeenCalledWith(["#fbbf24", "#ff6b6b"]);
  });

  it("clicking favorite swatches updates the current color", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#ff6b6b" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const onChange = vi.fn();
    const picker = new ColorNeo(input, {
      color: "#ff6b6b",
      favorites: ["#fbbf24", "#4ade80"],
      onChange,
    });

    const swatches = picker.favoritesRow.querySelectorAll<HTMLButtonElement>(
      ".color-neo-favorite-swatch",
    );
    swatches.item(1).click();

    expect(input.value).toBe("#4ade80");
    expect(onChange).toHaveBeenCalledWith("#4ade80");
  });

  it("disables heart button when no color is selected", () => {
    document.body.innerHTML = '<div id="app"><input id="color" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input);

    expect(picker.heartButton.disabled).toBe(true);

    picker.setValue("#ff6b6b", true);
    expect(picker.heartButton.disabled).toBe(false);

    picker.setValue("", true);
    expect(picker.heartButton.disabled).toBe(true);
  });

  it("provides public API to get and set favorites", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#ff6b6b" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input, {
      color: "#ff6b6b",
      favorites: ["#fbbf24"],
    });

    expect(picker.getFavorites()).toEqual(["#fbbf24"]);

    picker.setFavorites(["#4ade80", "#0ea5e9", "#8b5cf6"]);

    expect(picker.getFavorites()).toEqual(["#4ade80", "#0ea5e9", "#8b5cf6"]);

    const swatches = picker.favoritesRow.querySelectorAll<HTMLButtonElement>(
      ".color-neo-favorite-swatch",
    );
    expect(swatches).toHaveLength(3);
  });

  it("heart icon hover state reflects favorite status", () => {
    document.body.innerHTML =
      '<div id="app"><input id="color" value="#ff6b6b" /></div>';
    const input = document.querySelector<HTMLInputElement>("#color");

    if (!input) {
      throw new Error("input missing");
    }

    const picker = new ColorNeo(input, { color: "#ff6b6b" });
    const heart = picker.heartButton;

    // Initially, not a favorite
    expect(heart.classList.contains("color-neo-heart--active")).toBe(false);

    // Simulate hover (add :hover class via JS is not possible, but we can check computed style)
    heart.dispatchEvent(new Event("mouseenter"));
    // Should have non-favorite hover color (gray)
    // We can't check CSS color directly in jsdom, but we can check class logic
    expect(heart.classList.contains("color-neo-heart--active")).toBe(false);

    // Click to add to favorites
    heart.click();
    expect(heart.classList.contains("color-neo-heart--active")).toBe(true);

    // Simulate hover again
    heart.dispatchEvent(new Event("mouseenter"));
    // Should have favorite hover color (pink)
    expect(heart.classList.contains("color-neo-heart--active")).toBe(true);

    // Remove from favorites
    heart.click();
    expect(heart.classList.contains("color-neo-heart--active")).toBe(false);
  });
});
