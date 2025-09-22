// Asset srcs
const autoScrollSvg = chrome.runtime.getURL('img/autoScroll.svg');
const horizontalScrollSvg = chrome.runtime.getURL('img/horizontalScroll.svg');
const verticalScrollSvg = chrome.runtime.getURL('img/verticalScroll.svg');
const topSvg = chrome.runtime.getURL('img/top.svg');
const bottomSvg = chrome.runtime.getURL('img/bottom.svg');
const leftSvg = chrome.runtime.getURL('img/left.svg');
const rightSvg = chrome.runtime.getURL('img/right.svg');
const topLeftSvg = chrome.runtime.getURL('img/topLeft.svg');
const topRightSvg = chrome.runtime.getURL('img/topRight.svg');
const bottomLeftSvg = chrome.runtime.getURL('img/bottomLeft.svg');
const bottomRightSvg = chrome.runtime.getURL('img/bottomRight.svg');

// Dead zone as percentage of screen (4% of screen height/width)
const deadZonePercentage = 0.04;
// Maximum scroll speed
const maxSpeed = 100;
