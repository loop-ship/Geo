#!/usr/bin/env bash
# Captures Play Store screenshots from a running Android emulator. Usage: android.sh <outdir> [landscape]
set -euo pipefail
OUT="$1"; ORIENT="${2:-portrait}"; PKG=com.loopship.poleshift
mkdir -p "$OUT"
adb wait-for-device
adb shell 'while [ "$(getprop sys.boot_completed)" != "1" ]; do sleep 2; done'
adb shell settings put global sysui_demo_allowed 1
adb shell am broadcast -a com.android.systemui.demo -e command enter >/dev/null
adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 0941 >/dev/null
adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false >/dev/null
adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4 >/dev/null
adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false >/dev/null
if [ "$ORIENT" = landscape ]; then
  adb shell settings put system accelerometer_rotation 0; adb shell settings put system user_rotation 1
fi
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n $PKG/.MainActivity
sleep 30
python3 "$(dirname "$0")/cdp.py" "$(dirname "$0")/scenes.json" "$OUT"
