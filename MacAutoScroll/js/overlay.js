const state = {
  enabled: false,
  defaultCursorName: 'autoScroll',
  rafId: null,
  lastFrameTs: 0,
  scrollSpeedX: 0,
  scrollSpeedY: 0,
  targetSpeedX: 0,
  targetSpeedY: 0,
  hasScrolled: false,
  targetElement: null,
  scrollbarDirection: 'none',
  originalMouseX: 0,
  originalMouseY: 0,
  overlay: null,
  lastPointerId: null,
  savedScrollBehavior: null,
  savedBodyScrollBehavior: null,
};

const Z_INDEX_MAX = 2147483647;

const OVERLAY_BASE_CSS = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: ${Z_INDEX_MAX};
  background: transparent;
  margin: 0;
  padding: 0;
  border: 0;
`;

function createOverlay() {
  const el = document.createElement('div');
  el.style.cssText = OVERLAY_BASE_CSS;
  el.style.cursor = cursorCss(state.defaultCursorName);
  el.classList.add('macAutoScrollOverlay');

  const parent =
    document.fullscreenElement || document.body || document.documentElement;
  parent.appendChild(el);
  state.overlay = el;
}

function setOverlayCursor(name) {
  if (state.overlay) state.overlay.style.cursor = cursorCss(name);
}

function removeOverlay() {
  if (state.overlay) {
    state.overlay.remove();
    state.overlay = null;
  }
}

function suppressSmoothScroll() {
  const root = document.scrollingElement || document.documentElement;
  if (root) {
    state.savedScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
  }
  if (document.body) {
    state.savedBodyScrollBehavior = document.body.style.scrollBehavior;
    document.body.style.scrollBehavior = 'auto';
  }
}

function restoreSmoothScroll() {
  const root = document.scrollingElement || document.documentElement;
  if (root && state.savedScrollBehavior !== null) {
    root.style.scrollBehavior = state.savedScrollBehavior;
  }
  if (document.body && state.savedBodyScrollBehavior !== null) {
    document.body.style.scrollBehavior = state.savedBodyScrollBehavior;
  }
  state.savedScrollBehavior = null;
  state.savedBodyScrollBehavior = null;
}
