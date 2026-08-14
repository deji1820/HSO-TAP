import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

/**
 * Opens the serial connection to the ESP32/Arduino. The firmware side
 * (see /firmware) prints one JSON line per event, e.g.:
 *   {"type":"rfid_tap","uid":"04A3B2C1"}
 *   {"type":"temperature_reading","celsius":36.8}
 *   {"type":"height_reading","cm":170}
 *   {"type":"weight_reading","kg":62.5}
 */
export function openSerial({ path, baudRate }, onEvent) {
  const port = new SerialPort({ path, baudRate });
  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  port.on("open", () => console.log(`[serial] connected on ${path} @ ${baudRate}`));
  port.on("error", (err) => console.error("[serial] error:", err.message));

  parser.on("data", (line) => {
    try {
      const event = JSON.parse(line.trim());
      onEvent(event);
    } catch {
      console.warn("[serial] ignored non-JSON line:", line);
    }
  });

  return port;
}
