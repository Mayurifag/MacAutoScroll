const SCRIPT_ID = 'mac-autoscroll-main';

const SCRIPT_DEFINITION = {
  id: SCRIPT_ID,
  matches: ['<all_urls>'],
  allFrames: true,
  runAt: 'document_start',
  js: [
    'js/defaults.js',
    'js/assets.js',
    'js/overlay.js',
    'js/functions.js',
    'js/autoscroll.js'
  ]
};

async function syncContentScripts() {
  const info = await chrome.runtime.getPlatformInfo();
  const shouldRegister = info.os !== 'win';
  const existing = await chrome.scripting.getRegisteredContentScripts({
    ids: [SCRIPT_ID]
  });

  if (shouldRegister && existing.length === 0) {
    await chrome.scripting.registerContentScripts([SCRIPT_DEFINITION]);
  } else if (!shouldRegister && existing.length > 0) {
    await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
  }
}

chrome.runtime.onInstalled.addListener(syncContentScripts);
chrome.runtime.onStartup.addListener(syncContentScripts);
