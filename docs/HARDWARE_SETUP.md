# Hardware Setup

## Bill of materials (matches the mock-up in PROJECT-OVERVIEW.pdf)
- 1x Raspberry Pi 4 (or similar SBC) — runs `kiosk-app` in a kiosk-mode Chromium browser, plus `device-bridge`
- 1x touchscreen display, mounted in the kiosk enclosure
- 1x ESP32 (or Arduino Uno/Mega) — reads all sensors, talks to the Pi over USB serial
- 1x MFRC522 RFID reader module + RFID cards
- 1x MLX90614 non-contact IR temperature sensor
- 1x HX711 load-cell amplifier + platform scale (weight)
- 1x HC-SR04 ultrasonic sensor, mounted at the top of the column (height, via distance-from-top)

## Why ESP32 -> Pi over serial, not ESP32 -> WiFi -> server directly
Keeping sensor logic on a microcontroller and bridging over USB serial to the same machine that
renders the kiosk UI means:
- No separate WiFi credential management for the ESP32
- No extra network hop / auth surface for sensor data — it's a local, physically-tethered link
- `device-bridge` can normalize/validate readings before they ever reach the internet-facing API

If you'd rather have the ESP32 talk WiFi directly (e.g. it's physically far from the Pi), swap
`serialManager.js` for an MQTT or HTTP listener — same event shape (`{type, ...}`), same downstream
WebSocket broadcast to `kiosk-app`.

## Finding your serial port
- Raspberry Pi / Linux: usually `/dev/ttyUSB0` or `/dev/ttyACM0` — check with `ls /dev/tty*` before
  and after plugging in the ESP32.
- Set it in `packages/device-bridge/.env` as `SERIAL_PORT`.

## Development without hardware
1. Leave `kiosk-app/.env`'s `VITE_MOCK_HARDWARE=true`.
2. In dev tools console (or a temporary debug button), call the mock helpers returned by
   `connectDeviceBridge()`: `simulateRfidTap()`, `simulateTemperature()`, `simulateHeightWeight()`.
3. Once firmware + device-bridge are working on real hardware, flip the flag to `false` and set
   `VITE_DEVICE_BRIDGE_WS`.

## Kiosk-mode browser (Raspberry Pi)
```bash
chromium-browser --kiosk --noerrdialogs --disable-infobars http://localhost:5173
```
Run this from an autostart entry (`~/.config/lxsession/LXDE-pi/autostart` or a systemd service) so
the kiosk boots straight into the app after power loss — mirrors the "kiosk placed at clinic
entrance" deployment described in PROJECT-OVERVIEW.pdf.

## Calibrating the load cell (HX711)
1. Flash `weight_height.ino` with `scale.set_scale(1)` and `scale.tare()` with nothing on the platform.
2. Place a known weight (e.g. 5kg), read the raw value printed to Serial Monitor.
3. `calibration_factor = raw_reading / known_weight_kg`. Plug that into `set_scale()`.

## Auto-Reset / Offline Fallback
These are software behaviors, not hardware — see `docs/ARCHITECTURE.md`.
