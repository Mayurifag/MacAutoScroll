if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
  chrome.storage.sync.get(SETTINGS_DEFAULTS, (loaded) => {
    Object.assign(settings, loaded);
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    for (const key in changes) {
      if (key in settings) settings[key] = changes[key].newValue;
    }
  });
}

window.addEventListener('pagehide', stopScrolling);
window.addEventListener('beforeunload', stopScrolling);

function isExtensionDisabledHere() {
  return settings.topFrameOnly && window !== window.top;
}

function stopScrolling() {
  if (!state.enabled) return;
  state.enabled = false;

  if (state.rafId) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }

  if (state.overlay) {
    state.overlay.removeEventListener('pointermove', updateScrollSpeed);
    if (state.lastPointerId !== null) {
      try {
        state.overlay.releasePointerCapture(state.lastPointerId);
      } catch (err) {}
    }
  }
  state.lastPointerId = null;

  removeOverlay();
  restoreSmoothScroll();

  document.removeEventListener('mousemove', updateScrollSpeed);
  window.removeEventListener('blur', stopScrolling);
  document.removeEventListener('mousedown', stopScrolling, true);
  document.removeEventListener('keydown', stopScrolling, true);
  document.removeEventListener('wheel', preventScrolling, true);
  document.removeEventListener('keydown', preventScrolling, true);
  document.removeEventListener('contextmenu', preventScrolling, true);
}

function directionFromAxes(canX, canY) {
  if (canX && canY) return 'both';
  if (canX) return 'horizontal';
  if (canY) return 'vertical';
  return 'none';
}

function getDirection(element, requireOverflowStyle) {
  if (!element || element.nodeType !== 1) return 'none';
  let allowX = true;
  let allowY = true;
  if (requireOverflowStyle) {
    const styles = getComputedStyle(element);
    allowX = /(auto|scroll|overlay)/.test(styles.overflowX);
    allowY = /(auto|scroll|overlay)/.test(styles.overflowY);
  }
  const canX = allowX && element.scrollWidth > element.clientWidth;
  const canY = allowY && element.scrollHeight > element.clientHeight;
  return directionFromAxes(canX, canY);
}

function getPageScroller() {
  return document.scrollingElement || document.documentElement;
}

function pageAxisScrollable(el, axis) {
  if (!el) return false;
  const sizeP = axis === 'x' ? 'scrollWidth' : 'scrollHeight';
  const clientP = axis === 'x' ? 'clientWidth' : 'clientHeight';
  if (el[sizeP] <= el[clientP]) return false;
  const overflow =
    getComputedStyle(el)[axis === 'x' ? 'overflowX' : 'overflowY'];
  return overflow !== 'hidden' && overflow !== 'clip';
}

function getPageDirection() {
  if (document.fullscreenElement) {
    return getDirection(document.fullscreenElement, false);
  }
  const root = getPageScroller();
  const body = document.body;
  const canX = pageAxisScrollable(root, 'x') || pageAxisScrollable(body, 'x');
  const canY = pageAxisScrollable(root, 'y') || pageAxisScrollable(body, 'y');
  return directionFromAxes(canX, canY);
}

function getActivePageScroller() {
  if (document.fullscreenElement) return document.fullscreenElement;
  const root = getPageScroller();
  const body = document.body;
  if (
    root &&
    (pageAxisScrollable(root, 'x') || pageAxisScrollable(root, 'y'))
  ) {
    return root;
  }
  if (body && body !== root) return body;
  return root;
}

function scrollPage(dx, dy) {
  const target = getActivePageScroller();
  if (target) target.scrollBy(dx, dy);
}

function getNearestScrollable(path) {
  for (const el of path) {
    if (!el || el.nodeType !== 1) continue;
    const direction = getDirection(el, true);
    if (direction !== 'none') return { element: el, direction };
  }
  return { element: null, direction: getPageDirection() };
}

function isLinkClick(path) {
  for (const node of path) {
    if (!node || node.nodeType !== 1) continue;
    const tag = node.tagName;
    if ((tag === 'A' || tag === 'AREA') && node.hasAttribute('href')) {
      return true;
    }
  }
  return false;
}

function preventScrolling(e) {
  e.preventDefault();
  e.stopPropagation();
}

function pickCursor(upDown, leftRight) {
  if (upDown === 0 && leftRight === 0) return state.defaultCursorName;
  return CURSOR_BY_DIRECTION[`${upDown},${leftRight}`] || state.defaultCursorName;
}

function computeAxisSpeed(percentage) {
  if (percentage < settings.deadZonePercentage) return 0;
  const eff = percentage - settings.deadZonePercentage;
  return Math.min(settings.maxSpeed, eff * settings.maxSpeed * 2);
}

function updateScrollSpeed(e) {
  const deltaY = e.clientY - state.originalMouseY;
  const deltaX = e.clientX - state.originalMouseX;
  const percentageY = Math.abs(deltaY) / window.innerHeight;
  const percentageX = Math.abs(deltaX) / window.innerWidth;

  if (state.scrollbarDirection === 'horizontal') {
    state.targetSpeedY = 0;
  } else {
    const direction = deltaY > 0 ? 1 : -1;
    state.targetSpeedY = direction * computeAxisSpeed(percentageY);
  }

  if (state.scrollbarDirection === 'vertical') {
    state.targetSpeedX = 0;
  } else {
    const direction = deltaX > 0 ? 1 : -1;
    state.targetSpeedX = direction * computeAxisSpeed(percentageX);
  }

  if (state.targetSpeedX !== 0 || state.targetSpeedY !== 0) {
    state.hasScrolled = true;
  }

  const upDown = Math.sign(state.targetSpeedY);
  const leftRight = Math.sign(state.targetSpeedX);
  setOverlayCursor(pickCursor(upDown, leftRight));
}

const FRAME_FALLBACK_MS = 16;
const SPEED_UNIT_MS = 10;
const SPEED_EPSILON = 0.01;

function scrollFrame(ts) {
  if (!state.enabled) return;
  const dt = state.lastFrameTs ? ts - state.lastFrameTs : FRAME_FALLBACK_MS;
  state.lastFrameTs = ts;

  const easing = Math.max(0, Math.min(1, settings.speedEasing));
  state.scrollSpeedX += (state.targetSpeedX - state.scrollSpeedX) * easing;
  state.scrollSpeedY += (state.targetSpeedY - state.scrollSpeedY) * easing;

  if (Math.abs(state.scrollSpeedX) < SPEED_EPSILON) state.scrollSpeedX = 0;
  if (Math.abs(state.scrollSpeedY) < SPEED_EPSILON) state.scrollSpeedY = 0;

  if (state.scrollSpeedX || state.scrollSpeedY) {
    const dx = state.scrollSpeedX * (dt / SPEED_UNIT_MS);
    const dy = state.scrollSpeedY * (dt / SPEED_UNIT_MS);
    if (state.targetElement) {
      state.targetElement.scrollBy(dx, dy);
    } else {
      scrollPage(dx, dy);
    }
  }

  state.rafId = requestAnimationFrame(scrollFrame);
}
