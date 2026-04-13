import { ColorNeo, attachColorNeo, mountColorNeo } from '../src';

const inlineInput = document.querySelector<HTMLInputElement>('#inline-color');
const modalInput = document.querySelector<HTMLInputElement>('#modal-color');
const modeInput = document.querySelector<HTMLInputElement>('#mode-color');
const attachedInput = document.querySelector<HTMLInputElement>('#attached-color');
const inlineOutput = document.querySelector<HTMLDivElement>('#inline-output');
const modalOutput = document.querySelector<HTMLDivElement>('#modal-output');
const modeOutput = document.querySelector<HTMLDivElement>('#mode-output');
const attachedOutput = document.querySelector<HTMLDivElement>('#attached-output');
const popoverOutput = document.querySelector<HTMLDivElement>('#popover-output');
const mountOutput = document.querySelector<HTMLDivElement>('#mount-output');
const mountRoot = document.querySelector<HTMLDivElement>('#mount-root');
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
  !attachedInput ||
  !inlineOutput ||
  !modalOutput ||
  !modeOutput ||
  !attachedOutput ||
  !popoverOutput ||
  !mountOutput ||
  !mountRoot ||
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

const inlinePicker = new ColorNeo(inlineInput, {
  onChange: (hex) => {
    inlineOutput.textContent = `Inline picker value: ${hex}`;
    inlineOutput.style.background = `${hex}22`;
  }
});

inlinePicker.trigger.style.display = 'none';

const modalPicker = new ColorNeo(modalInput, {
  onChange: (hex) => {
    modalOutput.textContent = `Popup picker value: ${hex}`;
    modalOutput.style.background = `${hex}22`;
  }
});

const modePicker = new ColorNeo(modeInput, {
  mode: 'hex-swatch-left',
  onChange: (hex) => {
    modeOutput.textContent = `Mode picker value: ${hex}`;
    modeOutput.style.background = `${hex}22`;
  }
});

const [attachedPicker] = attachColorNeo('[data-color-picker]', {
  onChange: (hex) => {
    attachedOutput.textContent = `attachColorNeo value: ${hex}`;
    attachedOutput.style.background = `${hex}22`;
  }
});

const mountedPicker = mountColorNeo(mountRoot, {
  value: '#f59e0b',
  onChange: (hex) => {
    mountOutput.textContent = `Mounted selector value: ${hex}`;
    mountOutput.style.background = `${hex}22`;
  }
});

inlinePicker.setValue(inlineInput.value, true);
modalPicker.setValue(modalInput.value, true);
modePicker.setValue(modeInput.value, true);
attachedPicker?.setValue(attachedInput.value, true);
mountedPicker.setValue('#f59e0b', true);

openButton.addEventListener('click', () => dialog.showModal());
closeButton.addEventListener('click', () => dialog.close());
inlineOpenButton.addEventListener('click', () => inlinePicker.open(inlineOpenButton));

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
    onChange: (hex) => {
      popoverColorOutput.textContent = `Popover picker value: ${hex}`;
      popoverColorOutput.style.background = `${hex}22`;
      popoverOutput.textContent = `Popover current value: ${hex}`;
      popoverOutput.style.background = `${hex}22`;
    }
  });

  popoverPicker.setValue(popoverInput.value, true);

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
