// Store-screenshot driver. Only injected into www/ when build-web runs with STORE_SHOTS=1 (CI screenshot
// jobs); release builds never contain it. The scene comes from window.__SHOT__ (iOS: shot-scene.js written
// into the simulator's app bundle) or localStorage.shot_scene (Android: set over the WebView debugger).
// A scene = { search, hash, steps: [{click:'label'} | {id:'dom-id'} | {wait:ms} | {eval:'js'}], delay }.
(function () {
  var S = window.__SHOT__;
  try { if (!S) { var j = localStorage.getItem('shot_scene'); if (j) S = JSON.parse(j); } } catch (e) {}
  if (!S) return;
  try { localStorage.setItem('geo_seen_intro', '1'); } catch (e) {}
  if (S.search || S.hash) history.replaceState(null, '', location.pathname + (S.search || '') + (S.hash ? '#' + S.hash : ''));
  var css = document.createElement('style');
  css.textContent = '#share-cta,#hint-chip,#share-toast{display:none!important}' + (S.css || '');
  document.documentElement.appendChild(css);
  function byText(t) {
    var els = document.querySelectorAll('button, .lil-gui .name, .lil-gui .title');
    for (var i = 0; i < els.length; i++) if (els[i].textContent.trim() === t) return els[i].closest('button') || els[i];
    return null;
  }
  function run(steps, i) {
    if (i >= steps.length) { document.title = 'SHOT_READY'; console.log('SHOT_READY'); return; }
    var s = steps[i], next = function () { run(steps, i + 1); };
    try {
      if (s.wait) return setTimeout(next, s.wait);
      if (s.click) { var b = byText(s.click); if (b) b.click(); else console.log('SHOT_MISS ' + s.click); }
      if (s.id) { var e = document.getElementById(s.id); if (e) e.click(); else console.log('SHOT_MISS #' + s.id); }
      if (s.eval) (0, eval)(s.eval);
    } catch (err) { console.log('SHOT_ERR ' + err); }
    setTimeout(next, 400);
  }
  addEventListener('load', function () { setTimeout(function () { run(S.steps || [], 0); }, S.delay || 4000); });
})();
