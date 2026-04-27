# MacAutoScroll
An extension that brings Windows-style middle-click auto-scrolling to Mac and Linux browsers.

[Chrome Web Store Link](https://chromewebstore.google.com/detail/mac-autoscroll/femlmfpifefkfnpodfflonahfggcahda)

## Principles
This extension is supposed to be faithful to the original feature as much as possible

## Features

* **Middle-click auto-scrolling**: Click the middle mouse button to activate auto-scroll mode
* **Directional scrolling**: Move your mouse in any direction to control scroll speed and direction
* **Speed control**: Scroll speed increases based on how far you move the mouse from the initial click point
* **Middle-click on link** opens the link in a new tab (matches Windows Chrome behavior)
* **Fullscreen-aware**: Works inside fullscreen video players (overlay attaches to the fullscreen element, scroll is routed there)
* **Smooth-scroll suppression**: Saves/restores the page's `scroll-behavior` so CSS-driven smooth scroll doesn't fight `scrollBy`
* **Toolbar popup + Options page** — same form, narrow popup vs full-width options tab. Tunable: max speed, dead zone, easing, "middle-click on link → new tab", "disable inside iframes". Settings sync via Chrome Sync.

## Installation

1. Press the green button `<> Code`.
2. Hover over the `Download Zip` button and click it to download the ZIP version of this repository.
   Or use the `git clone` command to copy it onto your computer:
   ```bash
   git clone https://github.com/Spark4444/MacAutoScroll
   ```
3. Go to the extensions tab in your browser.
4. Enable developer mode in the top-right corner.
5. Press the "Load unpacked" button and select the `MacAutoScroll` folder from the downloaded files (the one inside the main `MacAutoScroll` folder). That's it!

## Usage

* **Activating auto-scroll**: Click the middle mouse button on any webpage that has scrollable content
* **Controlling direction and speed**:
  - Move your mouse away from the initial click point to start scrolling
  - The further you move the mouse, the faster the scrolling becomes
  - Move up/down to scroll vertically, left/right to scroll horizontally
  - Move diagonally to scroll in both directions simultaneously
* **Visual indicators**: The cursor will change to show arrows indicating the current scroll direction
* **Stopping auto-scroll**:
  - Click anywhere on the page (any button)
  - Press any key
  - Switch to another tab or window

## How It Works

* **Event Detection**: Listens for middle mouse button clicks on all web pages
* **Overlay Creation**: When activated, creates a transparent overlay that captures pointer movements (with `setPointerCapture` so movement keeps tracking even when the cursor leaves the window)
* **Speed Calculation**: Linear curve scaled by viewport-relative mouse distance, with configurable easing for smooth acceleration/deceleration
* **Dead Zone**: A configurable percentage of the viewport (default 2%) makes the initial click point a comfortable target for single-axis movements
* **Direction Mapping**: Eight scroll directions with matching cursor icons; cursor SVGs are inlined as data URIs (no `web_accessible_resources` round-trip)
* **Smooth Scrolling**: Uses `requestAnimationFrame` with deltaTime scaling so speed is framerate-independent
* **Smooth-scroll suppression**: Saves and restores the page's `scroll-behavior` so CSS-driven smooth scrolling does not fight `scrollBy`
* **Fullscreen-aware**: Overlay is appended to `document.fullscreenElement` when present, so it works inside fullscreen video players
* **Auto-cleanup**: Stops on click, key press, tab switch, or context menu

## Notes

* On Linux, some Chromium builds include a native middle-click autoscroll under the `Use a touchpad-style middle-click autoscroll` flag (`chrome://flags/#middle-click-autoscroll`). Disable it if you prefer this extension.
* Mac trackpads do not have a native middle button; pair with a third-party utility (e.g., MiddleClick, BetterTouchTool) to send middle-click events.

### Current state of this project

Finished
