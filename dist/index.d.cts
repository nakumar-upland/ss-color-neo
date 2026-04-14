interface ColorNeoOptions {
    color?: string;
    closeOnSelect?: boolean;
    mode?: 'default' | 'hex-swatch-left';
    size?: 'small' | 'medium' | 'large';
    historyStorageKey?: string;
    onChange?: (hex: string) => void;
}
type EyeDropperLike = {
    open: () => Promise<{
        sRGBHex: string;
    }>;
};
declare global {
    interface Window {
        EyeDropper?: new () => EyeDropperLike;
    }
    interface HTMLElementEventMap {
        'colorneo:change': CustomEvent<{
            value: string;
        }>;
    }
}
declare class ColorNeo {
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
    readonly historyRow: HTMLDivElement;
    private readonly emptyColorPattern;
    private hsv;
    private isSyncing;
    private popupAnchor;
    private readonly isInlineMount;
    private readonly mountContainer;
    private readonly mode;
    private readonly size;
    private readonly options;
    private readonly boundDocumentClick;
    private readonly boundEscape;
    private readonly hexInputDebounceMs;
    private readonly historyMaxItems;
    private readonly historyStorageKey;
    private hexInputTimer;
    constructor(target: string | HTMLInputElement | HTMLElement, options?: ColorNeoOptions);
    open(anchor?: HTMLElement): void;
    close(): void;
    toggle(): void;
    destroy(): void;
    setValue(nextValue: string, emitEvents?: boolean): void;
    setColor(nextColor: string, emitEvents?: boolean): void;
    private mount;
    private attachPopupToHost;
    private bindEvents;
    private positionPopup;
    private scheduleHexInputSync;
    private syncUi;
    private clearValue;
    private renderHistory;
    private pushHistory;
    private readHistory;
    private writeHistory;
}

interface RGB {
    r: number;
    g: number;
    b: number;
}
interface HSV {
    h: number;
    s: number;
    v: number;
}
declare function clamp(value: number, min: number, max: number): number;
declare function normalizeHex(value: string): string;
declare function isValidHex(value: string): boolean;
declare function rgbToHex({ r, g, b }: RGB): string;
declare function hexToRgb(hex: string): RGB;
declare function hsvToRgb({ h, s, v }: HSV): RGB;
declare function rgbToHsv({ r, g, b }: RGB): HSV;
declare function hexToHsv(hex: string): HSV;
declare function hsvToHex(hsv: HSV): string;

declare function attachColorNeo(selector: string, options?: ColorNeoOptions): ColorNeo[];
declare function mountColorNeo(parent: string | HTMLElement, options?: ColorNeoOptions): ColorNeo;
declare function destroyColorNeo(target: ColorNeo | ColorNeo[] | null | undefined): void;

export { ColorNeo, ColorNeoOptions, attachColorNeo, clamp, destroyColorNeo, hexToHsv, hexToRgb, hsvToHex, hsvToRgb, isValidHex, mountColorNeo, normalizeHex, rgbToHex, rgbToHsv };
