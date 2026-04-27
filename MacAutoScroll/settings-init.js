(() => {
  const w = window.outerWidth || window.innerWidth || 0;
  const isPopup = w > 0 && w < 600;
  document.documentElement.classList.add(isPopup ? 'popup' : 'options');
})();
