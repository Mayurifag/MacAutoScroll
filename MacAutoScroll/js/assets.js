const TRI = {
  up: 'M11,3l3,3H8Z',
  down: 'M11,19.021l-3-3h6Z',
  left: 'M2.833,11l3-3v6Z',
  right: 'M19.206,11l-3,3V8Z',
};

function scrollSvg(tris) {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">' +
    '<circle fill="#fff" stroke="#000" cx="11" cy="11" r="10.5"/>' +
    tris.map((d) => `<path fill-rule="evenodd" d="${d}"/>`).join('') +
    '<circle cx="11" cy="11" r="2"/>' +
    '</svg>'
  );
}

function arrowSvg(deg) {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">' +
    `<g transform="rotate(${deg} 7 7)">` +
    '<path fill="#000" stroke="#fff" fill-rule="evenodd" d="M5.991,14.007L0,7,12,7.013Z" transform="translate(1 0)"/>' +
    '<circle fill="#000" stroke="#fff" cx="6" cy="3" r="3" transform="translate(1 0)"/>' +
    '</g></svg>'
  );
}

function toUri(svg) {
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

const SCROLL_HS = [11, 11];
const ARROW_HS = [7, 7];

const CURSORS = {
  autoScroll:       { svg: toUri(scrollSvg([TRI.up, TRI.left, TRI.right, TRI.down])), hotspot: SCROLL_HS },
  horizontalScroll: { svg: toUri(scrollSvg([TRI.left, TRI.right])),                   hotspot: SCROLL_HS },
  verticalScroll:   { svg: toUri(scrollSvg([TRI.up, TRI.down])),                      hotspot: SCROLL_HS },
  bottom:      { svg: toUri(arrowSvg(0)),    hotspot: ARROW_HS, direction: '1,0' },
  top:         { svg: toUri(arrowSvg(180)),  hotspot: ARROW_HS, direction: '-1,0' },
  right:       { svg: toUri(arrowSvg(-90)),  hotspot: ARROW_HS, direction: '0,1' },
  left:        { svg: toUri(arrowSvg(90)),   hotspot: ARROW_HS, direction: '0,-1' },
  bottomRight: { svg: toUri(arrowSvg(-45)),  hotspot: ARROW_HS, direction: '1,1' },
  bottomLeft:  { svg: toUri(arrowSvg(45)),   hotspot: ARROW_HS, direction: '1,-1' },
  topRight:    { svg: toUri(arrowSvg(-135)), hotspot: ARROW_HS, direction: '-1,1' },
  topLeft:     { svg: toUri(arrowSvg(135)),  hotspot: ARROW_HS, direction: '-1,-1' },
};

const CURSOR_BY_DIRECTION = (() => {
  const m = { '0,0': null };
  for (const [name, c] of Object.entries(CURSORS)) {
    if (c.direction) m[c.direction] = name;
  }
  return m;
})();

function cursorCss(name) {
  const c = CURSORS[name];
  return `url("${c.svg}") ${c.hotspot[0]} ${c.hotspot[1]}, auto`;
}

const settings = Object.assign({}, SETTINGS_DEFAULTS);
