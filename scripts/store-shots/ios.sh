#!/usr/bin/env bash
# Captures App Store screenshots from the iOS Simulator. Expects ios/App built for the simulator into
# $DERIVED (see .github/workflows/store-shots.yml). Usage: ios.sh "<device name>" <outdir>
set -euo pipefail
DEVICE="$1"; OUT="$2"; BUNDLE=com.loopship.poleshift
mkdir -p "$OUT"
APP=$(ls -d "$DERIVED"/Build/Products/Debug-iphonesimulator/App.app)
UDID=$(xcrun simctl list devices available -j | python3 -c "
import json,sys; d=json.load(sys.stdin)['devices']
c=[(r,x['udid']) for r,l in d.items() if 'iOS' in r for x in l if x['name']==sys.argv[1]]
c.sort(); print(c[-1][1] if c else '')" "$DEVICE")
if [ -z "$UDID" ]; then   # older sizes (e.g. 6.5") have no default simulator: create one from the device type
  RUNTIME=$(xcrun simctl list runtimes -j | python3 -c "import json,sys; r=[x['identifier'] for x in json.load(sys.stdin)['runtimes'] if x['platform']=='iOS' and x['isAvailable']]; print(sorted(r)[-1])")
  UDID=$(xcrun simctl create "$DEVICE" "$DEVICE" "$RUNTIME")
fi
echo "device $DEVICE -> $UDID"
xcrun simctl boot "$UDID" || true
xcrun simctl bootstatus "$UDID" -b
xcrun simctl status_bar "$UDID" override --time 9:41 --dataNetwork wifi --wifiBars 3 --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100 || true
xcrun simctl install "$UDID" "$APP"
# first launch: let WebKit warm up
xcrun simctl launch "$UDID" $BUNDLE; sleep 25; xcrun simctl terminate "$UDID" $BUNDLE || true
CONTAINER=$(xcrun simctl get_app_container "$UDID" $BUNDLE app)
python3 - "$(dirname "$0")/scenes.json" > /tmp/scenes.tsv <<'PY'
import json,sys
for s in json.load(open(sys.argv[1])):
    secs = (s.get('delay',4000) + sum(st.get('wait',0)+400 for st in s.get('steps',[])))/1000 + 20
    print(s['name'], int(secs), json.dumps(s), sep='\t')
PY
while IFS=$'\t' read -r NAME SECS JSON; do
  printf 'window.__SHOT__ = %s;\n' "$JSON" > "$CONTAINER/public/shot-scene.js"
  xcrun simctl launch "$UDID" $BUNDLE
  sleep "$SECS"
  xcrun simctl io "$UDID" screenshot --type=png "$OUT/$NAME.png"
  xcrun simctl terminate "$UDID" $BUNDLE || true
  echo "shot $NAME"
done < /tmp/scenes.tsv
xcrun simctl shutdown "$UDID" || true
