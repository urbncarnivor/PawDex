#!/bin/bash

START_UID="951CC4D4"
SHUTDOWN_UID="85A1B6D4"
ADMIN_UID="95C706D4"

PAWDEX_DIR="/home/jorge/PawDex"
LAUNCHER="$PAWDEX_DIR/launch-pawdex.sh"
LAUNCH_LOG="$PAWDEX_DIR/pawdex-launcher.log"
FEEDBACK="$PAWDEX_DIR/reader-feedback.py"

LAST_UID=""

reader_feedback() {
    "$FEEDBACK" >/dev/null 2>&1 || true
}

pawdex_is_open() {
    pgrep -u jorge -x chromium >/dev/null 2>&1 || \
    pgrep -u jorge -x chromium-browser >/dev/null 2>&1
}

start_pawdex() {
    if pawdex_is_open; then
        echo "PawDex is already open."
        return
    fi

    echo "Launching PawDex Discovery Station..."

    runuser -u jorge -- \
        nohup "$LAUNCHER" >"$LAUNCH_LOG" 2>&1 &

    sleep 2
}

open_admin() {
    echo "Opening maintenance desktop..."

    pkill -u jorge -x chromium 2>/dev/null || true
    pkill -u jorge -x chromium-browser 2>/dev/null || true
}

safe_shutdown() {
    echo "Safe shutdown requested."

    sleep 1
    systemctl poweroff
}

while true; do
    CARD_UID=$(nfc-list 2>/dev/null \
        | awk '/UID \(NFCID1\)/ {
            for (i=3; i<=NF; i++) {
                printf toupper($i)
            }
            print ""
        }' \
        | head -n 1)

    # Rearm only after the card is removed
    if [ -z "$CARD_UID" ]; then
        LAST_UID=""
        sleep 0.35
        continue
    fi

    # Prevent the same card from repeatedly firing while held down
    if [ "$CARD_UID" = "$LAST_UID" ]; then
        sleep 0.35
        continue
    fi

    LAST_UID="$CARD_UID"

    case "$CARD_UID" in
        "$START_UID")
            echo "Start card detected"
            reader_feedback
            start_pawdex
            ;;

        "$SHUTDOWN_UID")
            echo "Shutdown card detected"
            reader_feedback
            safe_shutdown
            ;;

        "$ADMIN_UID")
            echo "Admin card detected"
            reader_feedback
            open_admin
            ;;

        *)
            echo "Unknown card detected: $CARD_UID"
            ;;
    esac

    sleep 0.5
done
