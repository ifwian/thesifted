// qr-viewer.js
// The GCash QR viewer (account.html): enlarged window with zoom in, zoom out, reset and close.
//   Mouse: wheel zooms, drag moves when zoomed.   Keyboard: + - 0 Esc and arrow keys.
//   Touch: pinch with two fingers, drag with one finger when zoomed.
// The image is never re-compressed: it is the same 900 x 900 file, only scaled by CSS,
// so the code stays sharp and scannable.

(function () {
  var dialog = document.getElementById('qr-dialog');
  var stage = document.getElementById('qr-stage');
  var image = document.getElementById('qr-big');
  var levelText = document.getElementById('qr-level');
  if (dialog === null) { return; }

  var MIN = 1;
  var MAX = 4;
  var STEP = 0.5;
  var zoom = 1;
  var opener = null;

  function clamp(value) {
    return Math.min(MAX, Math.max(MIN, value));
  }

  // The image is `zoom` times the stage width, so the stage scrolls when zoom > 1.
  function setZoom(value, keepCenter) {
    var oldZoom = zoom;
    zoom = clamp(Math.round(value * 100) / 100);
    var centerX = (stage.scrollLeft + stage.clientWidth / 2) / (stage.scrollWidth || 1);
    var centerY = (stage.scrollTop + stage.clientHeight / 2) / (stage.scrollHeight || 1);
    image.style.width = (zoom * 100) + '%';
    levelText.textContent = Math.round(zoom * 100) + '%';
    document.getElementById('qr-zoom-in').disabled = zoom >= MAX;
    document.getElementById('qr-zoom-out').disabled = zoom <= MIN;
    stage.classList.toggle('is-zoomed', zoom > 1);
    if (keepCenter && oldZoom !== zoom) {
      stage.scrollLeft = centerX * stage.scrollWidth - stage.clientWidth / 2;
      stage.scrollTop = centerY * stage.scrollHeight - stage.clientHeight / 2;
    }
    if (zoom === 1) { stage.scrollLeft = 0; stage.scrollTop = 0; }
  }

  function open() {
    opener = document.activeElement;
    setZoom(1, false);
    dialog.showModal();
    stage.focus();
  }
  function close() {
    dialog.close();
  }
  dialog.addEventListener('close', function () {
    if (opener && typeof opener.focus === 'function') { opener.focus(); }
  });

  document.getElementById('qr-open').addEventListener('click', open);
  document.getElementById('qr-open-2').addEventListener('click', open);
  document.getElementById('qr-close').addEventListener('click', close);
  document.getElementById('qr-close-2').addEventListener('click', close);
  document.getElementById('qr-zoom-in').addEventListener('click', function () { setZoom(zoom + STEP, true); });
  document.getElementById('qr-zoom-out').addEventListener('click', function () { setZoom(zoom - STEP, true); });
  document.getElementById('qr-reset').addEventListener('click', function () { setZoom(1, false); });

  // Click on the dark area around the window closes it.
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) { close(); }
  });

  // Keyboard (Esc is handled by <dialog> itself)
  dialog.addEventListener('keydown', function (event) {
    if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(zoom + STEP, true); }
    else if (event.key === '-' || event.key === '_') { event.preventDefault(); setZoom(zoom - STEP, true); }
    else if (event.key === '0') { event.preventDefault(); setZoom(1, false); }
    else if (document.activeElement === stage) {
      var move = 40;
      if (event.key === 'ArrowLeft') { stage.scrollLeft -= move; event.preventDefault(); }
      if (event.key === 'ArrowRight') { stage.scrollLeft += move; event.preventDefault(); }
      if (event.key === 'ArrowUp') { stage.scrollTop -= move; event.preventDefault(); }
      if (event.key === 'ArrowDown') { stage.scrollTop += move; event.preventDefault(); }
    }
  });

  // Mouse wheel zoom
  stage.addEventListener('wheel', function (event) {
    event.preventDefault();
    setZoom(zoom + (event.deltaY < 0 ? STEP / 2 : -STEP / 2), true);
  }, { passive: false });

  // Pointer events: one pointer drags (when zoomed), two pointers pinch.
  var pointers = {};
  var dragStart = null;
  var pinchStart = null;

  function distance() {
    var ids = Object.keys(pointers);
    var a = pointers[ids[0]];
    var b = pointers[ids[1]];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  stage.addEventListener('pointerdown', function (event) {
    pointers[event.pointerId] = { x: event.clientX, y: event.clientY };
    stage.setPointerCapture(event.pointerId);
    var count = Object.keys(pointers).length;
    if (count === 2) {
      pinchStart = { dist: distance(), zoom: zoom };
      dragStart = null;
    } else if (count === 1) {
      dragStart = { x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop };
    }
  });
  stage.addEventListener('pointermove', function (event) {
    if (pointers[event.pointerId] === undefined) { return; }
    pointers[event.pointerId] = { x: event.clientX, y: event.clientY };
    var count = Object.keys(pointers).length;
    if (count === 2 && pinchStart !== null) {
      setZoom(pinchStart.zoom * (distance() / pinchStart.dist), true);
    } else if (count === 1 && dragStart !== null && zoom > 1) {
      stage.scrollLeft = dragStart.left - (event.clientX - dragStart.x);
      stage.scrollTop = dragStart.top - (event.clientY - dragStart.y);
    }
  });
  function endPointer(event) {
    delete pointers[event.pointerId];
    pinchStart = null;
    dragStart = null;
    var ids = Object.keys(pointers);
    if (ids.length === 1) {
      var p = pointers[ids[0]];
      dragStart = { x: p.x, y: p.y, left: stage.scrollLeft, top: stage.scrollTop };
    }
  }
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);
})();
