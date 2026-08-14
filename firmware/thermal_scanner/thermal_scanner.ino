/**
 * Non-contact IR thermometer — MLX90614 over I2C.
 * Wiring: SDA->GPIO21, SCL->GPIO22 (or per your board's default I2C pins).
 */
#include <Wire.h>
#include <Adafruit_MLX90614.h>

Adafruit_MLX90614 mlx = Adafruit_MLX90614();

void setup() {
  Serial.begin(115200);
  mlx.begin();
}

void loop() {
  double tempC = mlx.readObjectTempC();

  Serial.print("{\"type\":\"temperature_reading\",\"celsius\":");
  Serial.print(tempC, 1);
  Serial.println("}");

  delay(1500); // kiosk-app should show a short "hold still" countdown while this stabilizes
}
