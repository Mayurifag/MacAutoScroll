// General variables
let autoScrollEnabled = false;
let defaultCursor = autoScrollSvg;
let scrollInterval, scrollOverlay;
let updateScrollSpeed; // Keep reference to remove listener

// Function to create an overlay
function createOverlay(type) {
  scrollOverlay = document.createElement('div');
  scrollOverlay.style.position = 'fixed';
  scrollOverlay.style.top = '0';
  scrollOverlay.style.left = '0';
  scrollOverlay.style.width = '100%';
  scrollOverlay.style.height = '100%';
  scrollOverlay.style.zIndex = '9999';
  scrollOverlay.style.cursor = `url("${defaultCursor}"), none`;
  scrollOverlay.style.background = 'rgba(0, 0, 0, 0)';
  scrollOverlay.classList.add('scrollOverlay');
  document.body.appendChild(scrollOverlay);
}

// Function to remove the overlay
function removeOverlay() {
  if (scrollOverlay) {
    scrollOverlay.remove();
  }
}
