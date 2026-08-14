/**
 * Weight via HX711 load cell amplifier, height via HC-SR04 ultrasonic
 * sensor mounted at the top of the kiosk column, measuring distance down
 * to the top of the student's head (subtract from known kiosk height).
 */
#include "HX711.h"

#define HX711_DOUT 4
#define HX711_SCK 2
#define TRIG_PIN 12
#define ECHO_PIN 14
#define KIOSK_SENSOR_HEIGHT_CM 230.0 // matches "2300mm Max Height" in the mock-up

HX711 scale;

void setup() {
  Serial.begin(115200);
  scale.begin(HX711_DOUT, HX711_SCK);
  scale.set_scale(2280.f); // calibration factor — determine per load cell, see docs/HARDWARE_SETUP.md
  scale.tare();

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

float readHeightCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long durationUs = pulseIn(ECHO_PIN, HIGH, 30000);
  float distanceCm = durationUs * 0.0343 / 2.0;
  return KIOSK_SENSOR_HEIGHT_CM - distanceCm;
}

void loop() {
  float kg = scale.get_units(5);
  float heightCm = readHeightCm();

  Serial.print("{\"type\":\"weight_reading\",\"kg\":");
  Serial.print(kg, 1);
  Serial.println("}");

  Serial.print("{\"type\":\"height_reading\",\"cm\":");
  Serial.print(heightCm, 1);
  Serial.println("}");

  delay(2000);
}
