document.addEventListener(
  'pointerdown',
  (e) => {
    if (e.button === 1) state.lastPointerId = e.pointerId;
  },
  true
);

function defaultCursorFor(direction) {
  if (direction === 'horizontal') return 'horizontalScroll';
  if (direction === 'vertical') return 'verticalScroll';
  return 'autoScroll';
}

function resolveScrollTarget(path) {
  let element = null;
  let direction = getPageDirection();
  if (direction === 'none') {
    const nearest = getNearestScrollable(path);
    if (nearest.direction === 'none') return null;
    element = nearest.element;
    direction = nearest.direction;
  }
  return { element, direction };
}

function startScrolling(e, element, direction) {
  state.targetElement = element;
  state.scrollbarDirection = direction;
  state.originalMouseX = e.clientX;
  state.originalMouseY = e.clientY;
  state.scrollSpeedX = 0;
  state.scrollSpeedY = 0;
  state.targetSpeedX = 0;
  state.targetSpeedY = 0;
  state.hasScrolled = false;
  state.lastFrameTs = 0;
  state.defaultCursorName = defaultCursorFor(direction);
  state.enabled = true;

  suppressSmoothScroll();
  createOverlay();

  state.overlay.addEventListener('pointermove', updateScrollSpeed);
  if (state.lastPointerId !== null) {
    try {
      state.overlay.setPointerCapture(state.lastPointerId);
    } catch (err) {}
  }

  state.rafId = requestAnimationFrame(scrollFrame);
  attachStopListeners();
}

function attachStopListeners() {
  window.addEventListener('blur', stopScrolling, { once: true });
  document.addEventListener('keydown', stopScrolling, { once: true, capture: true });
  document.addEventListener('mousedown', stopScrolling, { once: true, capture: true });
  document.addEventListener('wheel', preventScrolling, { capture: true, passive: false });
  document.addEventListener('keydown', preventScrolling, { capture: true });
  document.addEventListener('contextmenu', preventScrolling, { capture: true });
  document.addEventListener(
    'mouseup',
    () => {
      if (state.hasScrolled) stopScrolling();
    },
    { once: true }
  );
}

document.addEventListener(
  'mousedown',
  (e) => {
    if (isExtensionDisabledHere()) return;
    if (!state.enabled && e.button !== 1) return;

    if (state.enabled) {
      stopScrolling();
      if (e.button === 1) e.preventDefault();
      return;
    }

    const path =
      typeof e.composedPath === 'function' ? e.composedPath() : [e.target];

    if (settings.linkOpensNewTab && isLinkClick(path)) return;

    const target = resolveScrollTarget(path);
    if (!target) return;
    if (e.defaultPrevented) return;

    e.preventDefault();
    startScrolling(e, target.element, target.direction);
  },
  true
);
