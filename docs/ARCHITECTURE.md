# Architecture

## Data flow, end to end

```
[Student]
   │ taps RFID card / manual entry
   ▼
[ESP32 firmware] --serial(USB)--> [device-bridge (Node, on kiosk Pi)] --WebSocket(local)--> [kiosk-app (React, same Pi, kiosk-mode browser)]
                                                                                                   │
                                                                                                   │ REST (x-kiosk-key)
                                                                                                   ▼
                                                                                          [server (Express + MongoDB)]
                                                                                                   │
                                                                                    Socket.IO "queue:new" / "queue:update"
                                                                                                   ▼
                                                                                       [admin-portal (React, staff PCs)]
```

- **device-bridge** exists so kiosk-app never needs raw serial access from the browser (browsers can't
  open COM ports directly without WebSerial, which isn't reliable across kiosk browser setups).
  It also lets you fully build/demo the UI with `VITE_MOCK_HARDWARE=true` and zero hardware.
- **server** is the only thing that touches MongoDB. Both apps are just REST/Socket.IO clients.
- Auth: staff/admin use JWT (`/api/auth/login`). The kiosk is a shared, unattended device, so it
  uses a static shared secret (`x-kiosk-key` header) instead of a login — same pattern many
  self-service kiosks use. Rotate that key like any other secret.

## Decision-support rule (per PROJECT-OVERVIEW.pdf)
If a student chooses **Quick Health Screening** (self-service) and the sensor reads a temperature
≥ `FEVER_THRESHOLD_C` (37.5°C, adjust in `kiosk.controller.js`), the backend automatically:
1. Creates a `QueueEntry` with `priorityLevel: "High Priority"` even though the student picked "self-service"
2. Emits `queue:new` over Socket.IO so it appears on the Live Dashboard immediately
3. Returns `overrideTriggered: true` to kiosk-app, which should swap out the normal "you're done" exit
   screen for "please proceed inside the clinic immediately"

## Auto-reset / privacy timeout
Handled client-side in `kiosk-app/src/App.jsx` (`IDLE_TIMEOUT_MS`, 15-30s per the spec). No PII should
be held in memory after a reset — the student object is discarded, not just hidden.

## Offline fallback
If `kiosk-app`'s API calls start failing (network/DB down), show a static "please proceed to the
manual reception desk" screen rather than retry-looping. A simple approach: wrap `api.js` calls with
a health check (`GET /api/health`) polled every 10s; on repeated failure, force `step` to an
`"offline"` screen.

## Suggested queue numbering
`QueueEntry.queueNumber` is left blank in the scaffold. A simple approach: maintain a small
per-service-type daily counter (e.g. in a `Counter` collection keyed by `serviceType + date`),
incremented atomically with `findOneAndUpdate({ $inc: { seq: 1 } })`, formatted as prefix + padded
number (R0003, M0001, matching the PDF mockups).
