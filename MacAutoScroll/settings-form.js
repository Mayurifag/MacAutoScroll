const $ = (id) => document.getElementById(id);

function bindLiveLabel(input, valueEl, fmt) {
  if (!valueEl) return;
  const sync = () => (valueEl.textContent = fmt(input.value));
  input.addEventListener('input', sync);
  sync();
}

let statusTimer;
function flashStatus(msg) {
  const s = $('status');
  if (!s) return;
  s.textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => (s.textContent = ''), 1200);
}

async function readSettings() {
  return chrome.storage.sync.get(SETTINGS_DEFAULTS);
}

function writeFromForm() {
  return chrome.storage.sync.set({
    maxSpeed: Number($('maxSpeed').value),
    deadZonePercentage: Number($('deadZone').value) / 100,
    speedEasing: Number($('easing').value) / 100,
    linkOpensNewTab: $('linkOpens').checked,
    topFrameOnly: $('topFrameOnly').checked,
  });
}

function applyToForm(s) {
  $('maxSpeed').value = s.maxSpeed;
  $('deadZone').value = Math.round(s.deadZonePercentage * 100);
  $('easing').value = Math.round(s.speedEasing * 100);
  $('linkOpens').checked = s.linkOpensNewTab;
  $('topFrameOnly').checked = s.topFrameOnly;
}

function renderPreview() {
  const svg = $('preview');
  if (!svg) return;
  const dz = Number($('deadZone').value) / 100;
  const ms = Number($('maxSpeed').value);
  const W = 200;
  const H = 80;
  const yMax = 400;
  const points = [];
  for (let i = 0; i <= W; i += 2) {
    const pct = i / W;
    let speed = 0;
    if (pct >= dz) {
      const eff = pct - dz;
      speed = Math.min(ms, eff * ms * 2);
    }
    const y = H - (speed / yMax) * H;
    points.push(`${i},${y.toFixed(1)}`);
  }
  const dzX = (dz * W).toFixed(1);
  const path = 'M' + points.join(' L');
  svg.innerHTML =
    `<rect x="0" y="0" width="${dzX}" height="${H}" fill="rgba(255,85,85,0.18)"/>` +
    `<line x1="0" y1="${H - 0.5}" x2="${W}" y2="${H - 0.5}" stroke="#44475a" stroke-width="1"/>` +
    `<line x1="0.5" y1="0" x2="0.5" y2="${H}" stroke="#44475a" stroke-width="1"/>` +
    `<path d="${path}" fill="none" stroke="#bd93f9" stroke-width="2" stroke-linejoin="round"/>`;
}

async function init() {
  applyToForm(await readSettings());

  bindLiveLabel($('maxSpeed'), $('maxSpeedValue'), (v) => v);
  bindLiveLabel($('deadZone'), $('deadZoneValue'), (v) => `${v}%`);
  bindLiveLabel($('easing'), $('easingValue'), (v) => `${v}%`);

  $('maxSpeed').addEventListener('input', renderPreview);
  $('deadZone').addEventListener('input', renderPreview);
  renderPreview();

  const inputs = ['maxSpeed', 'deadZone', 'easing', 'linkOpens', 'topFrameOnly'];
  for (const id of inputs) {
    $(id).addEventListener('change', async () => {
      await writeFromForm();
      flashStatus('Saved');
    });
  }

  const reset = $('reset');
  if (reset) {
    reset.addEventListener('click', async () => {
      await chrome.storage.sync.set(SETTINGS_DEFAULTS);
      applyToForm(await readSettings());
      $('maxSpeed').dispatchEvent(new Event('input'));
      $('deadZone').dispatchEvent(new Event('input'));
      $('easing').dispatchEvent(new Event('input'));
      renderPreview();
      flashStatus('Reset to defaults');
    });
  }

  const openOptions = $('open-options');
  if (openOptions) {
    openOptions.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }
}

init();
