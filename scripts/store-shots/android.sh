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
# Force the exact store pixel size: phone 1080x1920 portrait, tablet 2560x1600 landscape.
adb shell settings put system accelerometer_rotation 0
if [ "$ORIENT" = landscape ]; then adb shell wm size 2560x1600; adb shell wm density 320
else adb shell wm size 1080x1920; adb shell wm density 420; fi
sleep 5
# No "Viewing full screen" tip, no launcher ANR dialog, no tablet taskbar (it belongs to the launcher).
adb shell settings put secure immersive_mode_confirmations confirmed
adb shell settings put global hide_error_dialogs 1 || true
adb shell pm disable-user --user 0 com.google.android.apps.nexuslauncher || true
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
# ShotActivity (debug builds only) is MainActivity with the status/navigation bars hidden.
adb shell am start -n $PKG/.ShotActivity
sleep 30
python3 -u "$(dirname "$0")/cdp.py" "$(dirname "$0")/scenes.json" "$OUT"
