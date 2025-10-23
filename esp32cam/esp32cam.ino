#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include "board_config.h"
#include <ArduinoJson.h>

// =======================
// Cấu hình WiFi
// =======================
const char *ssid = "GreenLee";
const char *password = "1234Gl5678";

// =======================
// Địa chỉ Flask server
// =======================
const char *serverUrl = "http://10.193.249.198:5000/upload";

// =======================
// Chân PIR Sensor
// =======================
#define PIR_PIN 13   // ⚠️ GPIO13 = D13 (chọn chân không xung đột camera)
#define LED_PIN 33   // LED onboard hoặc LED báo phát hiện chuyển động

// =======================
// Thời gian chờ giữa 2 lần chụp (ms)
// =======================
const unsigned long CAPTURE_COOLDOWN = 10000; // 10 giây

// Biến kiểm soát
unsigned long lastCaptureTime = 0;
bool motionDetected = false;

// =======================
void sendImageToServer(); // khai báo trước

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("🚀 ESP32-CAM khởi động...");

  // -----------------------
  // Cấu hình PIR
  // -----------------------
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // -----------------------
  // Cấu hình camera
  // -----------------------
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QVGA;  // 320x240 cho nhanh
  config.jpeg_quality = 15;
  config.fb_count = 2;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("❌ Lỗi khởi tạo camera: 0x%x\n", err);
    return;
  }

  // -----------------------
  // Kết nối WiFi
  // -----------------------
  WiFi.begin(ssid, password);
  WiFi.setSleep(false);

  Serial.print("📡 Đang kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Đã kết nối WiFi!");
  Serial.print("Địa chỉ IP: ");
  Serial.println(WiFi.localIP());

  Serial.println("\nNhập 'c' để chụp thủ công hoặc chờ PIR phát hiện.");
}

// =======================
// Hàm gửi ảnh đến Flask server
// =======================
void sendImageToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ Mất kết nối WiFi!");
    return;
  }

  delay(300);
  Serial.println("📸 Đang chụp ảnh...");
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("❌ Lỗi chụp ảnh!");
    return;
  }

  size_t img_len = fb->len;
  uint8_t *img_buf = new uint8_t[img_len];
  memcpy(img_buf, fb->buf, img_len);
  esp_camera_fb_return(fb);

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "image/jpeg");

  Serial.println("📤 Đang gửi ảnh lên server...");
  int httpResponseCode = http.POST(img_buf, img_len);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("📥 Phản hồi từ server:");
    Serial.println(response);

    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, response);
    if (error) {
      Serial.print("Lỗi parse JSON: ");
      Serial.println(error.c_str());
      delete[] img_buf;
      return;
    }

    const char *status = doc["status"];
    JsonArray faces = doc["faces"].as<JsonArray>();

    if (status && strcmp(status, "ok") == 0 && faces.size() > 0) {
      const char *name = faces[0]["name"];
      if (name && strcmp(name, "Unknown") != 0) {
        Serial.printf("✅ %s đã điểm danh thành công!\n", name);
      } else {
        Serial.println("⚠️ Bạn chưa có trong hệ thống.");
      }
    } else {
      Serial.println("⚠️ Không nhận diện được khuôn mặt!");
    }

  } else {
    Serial.printf("⚠️ Lỗi gửi ảnh: %d\n", httpResponseCode);
  }

  http.end();
  delete[] img_buf;
}

// =======================
// Vòng lặp chính
// =======================
void loop() {
  //Phát hiện chuyển động từ PIR
  int pirState = digitalRead(PIR_PIN);

  if (pirState == HIGH && !motionDetected) {
    motionDetected = true;
    digitalWrite(LED_PIN, HIGH);
    unsigned long now = millis();

    if (now - lastCaptureTime > CAPTURE_COOLDOWN) {
      Serial.println("👀 Phát hiện chuyển động! Chụp ảnh...");
      sendImageToServer();
      lastCaptureTime = now;
    } else {
      Serial.println("⚠️ Bỏ qua do đang trong thời gian cooldown.");
    }

  } else if (pirState == LOW && motionDetected) {
    motionDetected = false;
    digitalWrite(LED_PIN, LOW);
    Serial.println("🟢 Không còn chuyển động.");
  }

  delay(100);
}
