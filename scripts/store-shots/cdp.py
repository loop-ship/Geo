# Drives the app's WebView over the Chrome DevTools protocol (debug builds only) to each scene, then
# screenshots the whole device screen with adb screencap.
import json, subprocess, sys, time, urllib.request
import websocket  # pip install websocket-client
PKG = 'com.loopship.poleshift'
scenes, out = json.load(open(sys.argv[1])), sys.argv[2]
sh = lambda c: subprocess.run(c, shell=True, check=True, capture_output=True, text=True).stdout
def target():
    for _ in range(60):
        try:
            pid = sh(f'adb shell pidof {PKG}').strip()
            socks = [l.split('@')[-1] for l in sh('adb shell cat /proc/net/unix').splitlines() if 'devtools_remote' in l]
            sock = next((s for s in socks if s.endswith('_' + pid)), socks[0] if socks else None)
            if sock:
                subprocess.run('adb forward --remove-all', shell=True)
                sh(f'adb forward tcp:9222 localabstract:{sock}')
                pages = [p for p in json.load(urllib.request.urlopen('http://127.0.0.1:9222/json')) if p.get('type') == 'page']
                if pages: return pages[0]['webSocketDebuggerUrl']
        except Exception as e:
            print('waiting for webview:', e)
        time.sleep(3)
    raise SystemExit('no WebView debugger target')
n = 0
def ev(expr):
    global n
    for _ in range(5):
        try:
            ws = websocket.create_connection(target(), timeout=30, suppress_origin=True); n += 1
            ws.send(json.dumps({'id': n, 'method': 'Runtime.evaluate', 'params': {'expression': expr, 'returnByValue': True}}))
            while True:
                r = json.loads(ws.recv())
                if r.get('id') == n: ws.close(); return r.get('result', {}).get('result', {}).get('value')
        except Exception as e:
            print('eval retry:', e); time.sleep(3)
for s in scenes:
    ev("localStorage.setItem('shot_scene', %s); setTimeout(function(){location.replace(location.origin + '/')}, 50); 1" % json.dumps(json.dumps(s)))
    time.sleep(8)
    t0 = time.time()
    while ev('document.title') != 'SHOT_READY' and time.time() - t0 < 240: time.sleep(3)
    time.sleep(2)
    with open(f"{out}/{s['name']}.png", 'wb') as f:
        f.write(subprocess.run('adb exec-out screencap -p', shell=True, check=True, capture_output=True).stdout)
    print('shot', s['name'], 'ready' if ev('document.title') == 'SHOT_READY' else 'TIMEOUT')
ev("localStorage.removeItem('shot_scene'); 1")
