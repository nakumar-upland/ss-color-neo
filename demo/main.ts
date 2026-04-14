import { ColorNeo, attachColorNeo, destroyColorNeo, mountColorNeo } from '../src';

const inlineInput = document.querySelector<HTMLInputElement>('#inline-color');
const modalInput = document.querySelector<HTMLInputElement>('#modal-color');
const modeInput = document.querySelector<HTMLInputElement>('#mode-color');
const rgbInput = document.querySelector<HTMLInputElement>('#rgb-color');
const emptyInput = document.querySelector<HTMLInputElement>('#empty-color');
const smallInput = document.querySelector<HTMLInputElement>('#small-color');
const mediumInput = document.querySelector<HTMLInputElement>('#medium-color');
const largeInput = document.querySelector<HTMLInputElement>('#large-color');
const attachedInput = document.querySelector<HTMLInputElement>('#attached-color');
const inlineOutput = document.querySelector<HTMLDivElement>('#inline-output');
const modalOutput = document.querySelector<HTMLDivElement>('#modal-output');
const modeOutput = document.querySelector<HTMLDivElement>('#mode-output');
const rgbOutput = document.querySelector<HTMLDivElement>('#rgb-output');
const emptyOutput = document.querySelector<HTMLDivElement>('#empty-output');
const smallOutput = document.querySelector<HTMLDivElement>('#small-output');
const mediumOutput = document.querySelector<HTMLDivElement>('#medium-output');
const largeOutput = document.querySelector<HTMLDivElement>('#large-output');
const attachedOutput = document.querySelector<HTMLDivElement>('#attached-output');
const popoverOutput = document.querySelector<HTMLDivElement>('#popover-output');
const mountOutput = document.querySelector<HTMLDivElement>('#mount-output');
const mountRoot = document.querySelector<HTMLDivElement>('#mount-root');
const mountCreateButton = document.querySelector<HTMLButtonElement>('#mount-create');
const mountDestroyButton = document.querySelector<HTMLButtonElement>('#mount-destroy');
const inlineOpenButton = document.querySelector<HTMLButtonElement>('#inline-open');
const dialog = document.querySelector<HTMLDialogElement>('#demo-dialog');
const openButton = document.querySelector<HTMLButtonElement>('#open-dialog');
const closeButton = document.querySelector<HTMLButtonElement>('#close-dialog');
const openPopoverButton = document.querySelector<HTMLButtonElement>('#open-popover');
const popover = document.querySelector<HTMLElement>('#demo-popover');
const popoverRoot = document.querySelector<HTMLDivElement>('#popover-root');

if (
  !inlineInput ||
  !modalInput ||
  !modeInput ||
  !rgbInput ||
  !emptyInput ||
  !smallInput ||
  !mediumInput ||
  !largeInput ||
  !attachedInput ||
  !inlineOutput ||
  !modalOutput ||
  !modeOutput ||
  !rgbOutput ||
  !emptyOutput ||
  !smallOutput ||
  !mediumOutput ||
  !largeOutput ||
  !attachedOutput ||
  !popoverOutput ||
  !mountOutput ||
  !mountRoot ||
  !mountCreateButton ||
  !mountDestroyButton ||
  !inlineOpenButton ||
  !dialog ||
  !openButton ||
  !closeButton ||
  !openPopoverButton ||
  !popover ||
  !popoverRoot
) {
  throw new Error('Demo elements are missing.');
}

let popoverPicker: ColorNeo | null = null;
let mountedPicker: ColorNeo | null = null;
const mountOutputElement = mountOutput;
const mountRootElement = mountRoot;

function updateOutput(element: HTMLDivElement, label: string, hex: string): void {
  if (hex === '') {
    element.textContent = `${label}: empty`;
    element.style.background = 'repeating-linear-gradient(135deg, #e2e8f0 0 6px, #ffffff 6px 12px)';
    return;
  }

  element.textContent = `${label}: ${hex}`;
  element.style.background = `${hex}22`;
}

function renderMountedPicker(): void {
  destroyColorNeo(mountedPicker);
  mountedPicker = mountColorNeo(mountRootElement, {
    size: 'large',
    color: '#f59e0b',
    onChange: (hex) => {
      updateOutput(mountOutputElement, 'Mounted selector value', hex);
    }
  });

  updateOutput(mountOutputElement, 'Mounted selector value', '#f59e0b');
}

const inlinePicker = new ColorNeo(inlineInput, {
  color: '#ff6b6b',
  onChange: (hex) => {
    updateOutput(inlineOutput, 'Inline picker value', hex);
  }
});

inlinePicker.trigger.style.display = 'none';

const modalPicker = new ColorNeo(modalInput, {
  color: '#1d4ed8',
  onChange: (hex) => {
    updateOutput(modalOutput, 'Popup picker value', hex);
  }
});

const modePicker = new ColorNeo(modeInput, {
  color: '#0ea5e9',
  mode: 'hex-swatch-left',
  onChange: (hex) => {
    updateOutput(modeOutput, 'Mode picker value', hex);
  }
});

const rgbPicker = new ColorNeo(rgbInput, {
  color: 'rgb(255, 107, 107)',
  onChange: (hex) => {
    updateOutput(rgbOutput, 'RGB init value', hex);
  }
});

const emptyPicker = new ColorNeo(emptyInput, {
  onChange: (hex) => {
    updateOutput(emptyOutput, 'Empty init value', hex);
  }
});

const smallPicker = new ColorNeo(smallInput, {
  color: '#f97316',
  size: 'small',
  onChange: (hex) => {
    updateOutput(smallOutput, 'Small selector value', hex);
  }
});

const mediumPicker = new ColorNeo(mediumInput, {
  color: '#6366f1',
  size: 'medium',
  onChange: (hex) => {
    updateOutput(mediumOutput, 'Medium selector value', hex);
  }
});

const largePicker = new ColorNeo(largeInput, {
  color: '#14b8a6',
  size: 'large',
  onChange: (hex) => {
    updateOutput(largeOutput, 'Large selector value', hex);
  }
});

const [attachedPicker] = attachColorNeo('[data-color-picker]', {
  color: '#8b5cf6',
  onChange: (hex) => {
    updateOutput(attachedOutput, 'attachColorNeo value', hex);
  }
});

updateOutput(inlineOutput, 'Inline picker value', '#ff6b6b');
updateOutput(modalOutput, 'Popup picker value', '#1d4ed8');
updateOutput(modeOutput, 'Mode picker value', '#0ea5e9');
updateOutput(rgbOutput, 'RGB init value', '#ff6b6b');
updateOutput(emptyOutput, 'Empty init value', '');
updateOutput(smallOutput, 'Small selector value', '#f97316');
updateOutput(mediumOutput, 'Medium selector value', '#6366f1');
updateOutput(largeOutput, 'Large selector value', '#14b8a6');
updateOutput(attachedOutput, 'attachColorNeo value', '#8b5cf6');
renderMountedPicker();

openButton.addEventListener('click', () => dialog.showModal());
closeButton.addEventListener('click', () => dialog.close());
inlineOpenButton.addEventListener('click', () => inlinePicker.open(inlineOpenButton));
mountCreateButton.addEventListener('click', () => renderMountedPicker());
mountDestroyButton.addEventListener('click', () => {
  destroyColorNeo(mountedPicker);
  mountedPicker = null;
  mountOutputElement.textContent = 'Mounted selector destroyed.';
  mountOutputElement.style.background = '#f8fafc';
});

openPopoverButton.addEventListener('click', () => {
  popoverRoot.innerHTML = `
    <h3>Popover Picker</h3>
    <p>The picker input is rendered directly in this popover.</p>
    <label for="popover-color" style="display:block;margin:12px 0 10px;font-weight:700;font-size:14px;">Popover color</label>
    <input id="popover-color" value="#16a34a" />
    <div id="popover-color-output" class="color-output"></div>
    <button id="close-popover" class="popover-close" type="button">Close</button>
  `;

  const popoverInput = popoverRoot.querySelector<HTMLInputElement>('#popover-color');
  const popoverColorOutput = popoverRoot.querySelector<HTMLDivElement>('#popover-color-output');
  const popoverCloseButton = popoverRoot.querySelector<HTMLButtonElement>('#close-popover');

  if (!popoverInput || !popoverColorOutput || !popoverCloseButton) {
    throw new Error('Popover demo elements missing.');
  }

  popoverPicker?.destroy();
  popoverPicker = new ColorNeo(popoverInput, {
    color: '#16a34a',
    onChange: (hex) => {
      updateOutput(popoverColorOutput, 'Popover picker value', hex);
      updateOutput(popoverOutput, 'Popover current value', hex);
    }
  });

  updateOutput(popoverColorOutput, 'Popover picker value', '#16a34a');
  updateOutput(popoverOutput, 'Popover current value', '#16a34a');

  if ('showPopover' in popover && typeof popover.showPopover === 'function') {
    popover.showPopover();
  } else {
    popover.hidden = false;
  }

  requestAnimationFrame(() => {
    popoverPicker?.open();
  });

  popoverCloseButton.addEventListener('click', () => {
    if ('hidePopover' in popover && typeof popover.hidePopover === 'function') {
      popover.hidePopover();
      return;
    }
    popover.hidden = true;
  });
});
