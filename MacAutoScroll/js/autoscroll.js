// Auto-scroll functionality for middle mouse button click
document.addEventListener(
  'mousedown',
  function (event) {
    // stop scrolling on any click
    if (autoScrollEnabled && event.button !== 1) {
      stopScrolling();
      return;
    }

    const targetElement = findClosestScrollableElement(event.target);
    const scrollbarDirection = isElementScrollable(targetElement);

    // Middle mouse button is button 1
    if (event.button === 1 && scrollbarDirection !== 'none' && targetElement) {
      // If autoscroll is already enabled, a middle click should stop it.
      
      if (autoScrollEnabled) {
        stopScrolling();
        event.preventDefault();
        return;
      }

      defaultCursor = autoScrollSvg;
      if (scrollbarDirection === 'horizontal') {
        defaultCursor = horizontalScrollSvg;
      } else if (scrollbarDirection === 'vertical') {
        defaultCursor = verticalScrollSvg;
      }

      // Original Mouse positions
      const originalMouseY = event.clientY;
      const originalMouseX = event.clientX;

      let hasScrolled = false;

      // Scroll speed
      let scrollSpeedX = 0;
      let scrollSpeedY = 0;

      // Direction flags
      // 0 = no scroll, 1 = scrolling, -1 = scrolling opposite direction
      let scrollingDirection = {
        upDown: 0,
        leftRight: 0,
      };

      // Update the scroll speed based on mouse movement
      updateScrollSpeed = function (e) {
        // Calculate the change in mouse position
        const deltaY = e.clientY - originalMouseY;
        const deltaX = e.clientX - originalMouseX;

        // Get screen dimensions
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;

        // Calculate percentage of screen moved (0-1 range)
        const percentageY = Math.abs(deltaY) / screenHeight;
        const percentageX = Math.abs(deltaX) / screenWidth;

        // Calculate the scroll speed based on percentage of screen moved
        // Only start scrolling if movement exceeds the dead zone percentage
        if (percentageY < deadZonePercentage || scrollbarDirection === 'horizontal') {
          scrollSpeedY = 0;
        } else {
          // Calculate effective percentage after removing dead zone
          const effectivePercentageY = percentageY - deadZonePercentage;

          // Scale to maximum speed, maintaining direction
          const direction = deltaY > 0 ? 1 : -1;
          scrollSpeedY =
            direction * Math.min(maxSpeed, effectivePercentageY * maxSpeed * 2);
        }

        // Same logic for horizontal movement
        if (percentageX < deadZonePercentage || scrollbarDirection === 'vertical') {
          scrollSpeedX = 0;
        } else {
          // Calculate effective percentage after removing dead zone
          const effectivePercentageX = percentageX - deadZonePercentage;

          // Scale to maximum speed, maintaining direction
          const direction = deltaX > 0 ? 1 : -1;
          scrollSpeedX =
            direction * Math.min(maxSpeed, effectivePercentageX * maxSpeed * 2);
        }

        updateSpeedDirection();
      };

      // Function to update scrolling direction based on speed
      function updateSpeedDirection() {
        if (scrollSpeedY > 0) {
          scrollingDirection.upDown = 1; // Scrolling down
        } else if (scrollSpeedY < 0) {
          scrollingDirection.upDown = -1; // Scrolling up
        } else {
          scrollingDirection.upDown = 0; // No vertical scroll
        }

        if (scrollSpeedX > 0) {
          scrollingDirection.leftRight = 1; // Scrolling right
        } else if (scrollSpeedX < 0) {
          scrollingDirection.leftRight = -1; // Scrolling left
        } else {
          scrollingDirection.leftRight = 0; // No horizontal scroll
        }

        if (scrollingDirection.upDown !== 0 || scrollingDirection.leftRight !== 0) {
          hasScrolled = true;
        }

        // Set the cursor depending on the scroll direction
        if (
          scrollingDirection.upDown === 0 &&
          scrollingDirection.leftRight === 0
        ) {
          scrollOverlay.style.cursor = `url("${defaultCursor}"), none`;
        } else if (
          scrollingDirection.upDown === 1 &&
          scrollingDirection.leftRight === 0
        ) {
          scrollOverlay.style.cursor = `url("${bottomSvg}"), none`;
        } else if (
          scrollingDirection.upDown === -1 &&
          scrollingDirection.leftRight === 0
        ) {
          scrollOverlay.style.cursor = `url("${topSvg}"), none`;
        } else if (
          scrollingDirection.upDown === 0 &&
          scrollingDirection.leftRight === 1
        ) {
          scrollOverlay.style.cursor = `url("${rightSvg}"), none`;
        } else if (
          scrollingDirection.upDown === 0 &&
          scrollingDirection.leftRight === -1
        ) {
          scrollOverlay.style.cursor = `url("${leftSvg}"), none`;
        } else if (
          scrollingDirection.upDown === 1 &&
          scrollingDirection.leftRight === 1
        ) {
          scrollOverlay.style.cursor = `url("${bottomRightSvg}"), none`;
        } else if (
          scrollingDirection.upDown === 1 &&
          scrollingDirection.leftRight === -1
        ) {
          scrollOverlay.style.cursor = `url("${bottomLeftSvg}"), none`;
        } else if (
          scrollingDirection.upDown === -1 &&
          scrollingDirection.leftRight === 1
        ) {
          scrollOverlay.style.cursor = `url("${topRightSvg}"), none`;
        } else if (
          scrollingDirection.upDown === -1 &&
          scrollingDirection.leftRight === -1
        ) {
          scrollOverlay.style.cursor = `url("${topLeftSvg}"), none`;
        }
      }

      // Check if the event has been prevented by the website
      if (event.defaultPrevented) {
        return;
      }

      event.preventDefault();

      autoScrollEnabled = true;

      // create an overlay for the autoscroll
      createOverlay(scrollbarDirection);

      // Update scroll speed based on mouse movement
      scrollInterval = setInterval(function () {
        targetElement.scrollBy(scrollSpeedX, scrollSpeedY);
      }, 10);

      // Listen for mouse movements and switching to another tab
      document.addEventListener('mousemove', updateScrollSpeed);
      window.addEventListener('blur', stopScrolling, { once: true });
      document.addEventListener('keydown', stopScrolling, {
        once: true,
        capture: true,
      });
      document.addEventListener('mousedown', stopScrolling, {
        once: true,
        capture: true,
      });
      document.addEventListener('wheel', preventScrolling, {
        capture: true,
        passive: false,
      });
      document.addEventListener('keydown', preventScrolling, { capture: true });

      // Stop scrolling on mouse up if the user has scrolled, e.g. it was a long click
      document.addEventListener('mouseup', function () {
        if (hasScrolled) {
           stopScrolling();
        }
      }, { once: true });
    }
  },
  true
);