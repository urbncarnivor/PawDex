#!/bin/bash

PAWDEX_DIR="/home/jorge/PawDex"
PAWDEX_URL="http://localhost:3000"
SERVER_LOG="$PAWDEX_DIR/pawdex-server.log"
KIOSK_PROFILE="/home/jorge/.config/pawdex-kiosk"

SERVER_PID=""

cleanup() {
    echo "Closing PawDex Discovery Station..."

    if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
        kill "$SERVER_PID" 2>/dev/null
        wait "$SERVER_PID" 2>/dev/null
    fi

    pkill -f "python3 -m http.server 3000" 2>/dev/null || true

    echo "PawDex website stopped."
}

trap cleanup EXIT INT TERM

cd "$PAWDEX_DIR" || exit 1

pkill -f "python3 -m http.server 3000" 2>/dev/null || true

mkdir -p "$KIOSK_PROFILE"

sleep 1

python3 -m http.server 3000 --bind 127.0.0.1 \
    >"$SERVER_LOG" 2>&1 &

SERVER_PID=$!

for i in $(seq 1 30); do
    if curl -s "$PAWDEX_URL" >/dev/null 2>&1; then
        break
    fi

    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
        echo "PawDex server stopped unexpectedly."
        exit 1
    fi

    sleep 1
done

if ! curl -s "$PAWDEX_URL" >/dev/null 2>&1; then
    echo "PawDex server failed to start. Check $SERVER_LOG"
    exit 1
fi

export HOME="/home/jorge"
export USER="jorge"
export LOGNAME="jorge"
export XDG_RUNTIME_DIR="/run/user/1000"
export WAYLAND_DISPLAY="wayland-0"
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/1000/bus"

if command -v chromium >/dev/null 2>&1; then
    BROWSER="chromium"
elif command -v chromium-browser >/dev/null 2>&1; then
    BROWSER="chromium-browser"
else
    echo "Chromium was not found."
    exit 1
fi

"$BROWSER" \
    --user-data-dir="$KIOSK_PROFILE" \
    --password-store=basic \
    --ozone-platform=wayland \
    --kiosk \
    --autoplay-policy=no-user-gesture-required \
    --no-first-run \
    --no-default-browser-check \
    --noerrdialogs \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-features=Translate,PasswordManagerOnboarding \
    "$PAWDEX_URL"

exit 0
