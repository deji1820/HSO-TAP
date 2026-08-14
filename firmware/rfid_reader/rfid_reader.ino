/**
 * RFID tag reader — RC522 module over SPI.
 * Prints one line of JSON per successful tap, read by device-bridge over USB serial.
 * Wiring (typical ESP32 <-> RC522): SDA->GPIO5, SCK->GPIO18, MOSI->GPIO23,
 * MISO->GPIO19, RST->GPIO22, 3.3V->3.3V, GND->GND.
 */
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 5
#define RST_PIN 22
MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();

  Serial.print("{\"type\":\"rfid_tap\",\"uid\":\"");
  Serial.print(uid);
  Serial.println("\"}");

  rfid.PICC_HaltA();
  delay(1000); // debounce repeated taps
}
