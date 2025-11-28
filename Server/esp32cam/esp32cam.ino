#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include "board_config.h"
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

/* =======================
   CẤU HÌNH CHUNG
   ======================= */
#define USE_PIR 1              // 1 = dùng PIR, 0 = gửi định kỳ
#define PIR_PIN 13
#define LED_PIN 33             // optional: LED báo trạng thái (LOW=off, HIGH=on)

const char* ssid     = "GreenLee";
const char* password = "1234Gl5678";
const char* serverUrl = "http://10.56.150.207:5000/api/recognitions";

// Debug WiFi connection
void printWiFiStatus() {
  Serial.print("WiFi Status: ");
  switch(WiFi.status()) {
    case WL_CONNECTED: Serial.println("Connected"); break;
    case WL_NO_SHIELD: Serial.println("No Shield"); break;
    case WL_IDLE_STATUS: Serial.println("Idle"); break;
    case WL_NO_SSID_AVAIL: Serial.println("No SSID Available"); break;
    case WL_SCAN_COMPLETED: Serial.println("Scan Completed"); break;
    case WL_CONNECT_FAILED: Serial.println("Connect Failed"); break;
    case WL_CONNECTION_LOST: Serial.println("Connection Lost"); break;
    case WL_DISCONNECTED: Serial.println("Disconnected"); break;
    default: Serial.println("Unknown"); break;
  }
}

LiquidCrystal_I2C lcd(0x27, 16, 2);    // Đổi 0x27 -> 0x3F nếu LCD khác
const int SDA_PIN = 14;
const int SCL_PIN = 15;

// Chu kỳ/giới hạn
const unsigned long COOLDOWN_MS = 8000;      // cooldown mỗi lần nhận diện
const uint8_t BURST_SHOTS = 3;               // số khung hình gửi trong 1 lần phát hiện (tăng tỷ lệ nhận)
const unsigned long WIFI_RETRY_EVERY = 10000;// thử reconnect WiFi mỗi 10s khi rớt
const unsigned long LCD_OK_SHOW_MS = 2500;   // thời gian hiển thị kết quả OK
const unsigned long LCD_FAIL_SHOW_MS = 1200; // thời gian hiển thị báo lỗi/ngắn

// Định kỳ nếu không dùng PIR
const unsigned long INTERVAL_MS = 10000;

// Trạng thái
unsigned long lastActionMs = 0;
unsigned long lastWifiTry  = 0;
bool gateLocked = false;   // true = đã gửi trong lần phát hiện PIR, chờ PIR LOW để reset

/* ====== LCD helpers ====== */
static inline void lcd2(const String& l1, const String& l2) {
  lcd.clear();
  lcd.setCursor(0, 0); lcd.print(l1);
  lcd.setCursor(0, 1); lcd.print(l2);
}
static inline String fit16(const String& s) {
  if ((int)s.length() <= 16) return s;
  return s.substring(0, 16);
}

/* ====== Wi-Fi helpers ====== */
void ensureWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  unsigned long now = millis();
  if (now - lastWifiTry < WIFI_RETRY_EVERY) return;

  lastWifiTry = now;
  Serial.println("=== WiFi Reconnection Attempt ===");
  printWiFiStatus();
  
  lcd2("Dang ket noi WiFi", "");
  WiFi.disconnect(true, true);
  delay(100);
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  
  Serial.print("Connecting to: "); Serial.println(ssid);
  WiFi.begin(ssid, password);

  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 12000) {
    delay(500);
    Serial.print(".");
    printWiFiStatus();
  }
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi connected! IP: ");
    Serial.println(WiFi.localIP());
    lcd2("WiFi OK", WiFi.localIP().toString());
    delay(700);
  } else {
    Serial.println("WiFi connection failed!");
    printWiFiStatus();
    lcd2("WiFi that bai", "Thu lai sau");
    delay(600);
  }
}

/* ====== Camera helpers ====== */
bool initCamera() {
  camera_config_t cfg;
  cfg.ledc_channel = LEDC_CHANNEL_0;
  cfg.ledc_timer   = LEDC_TIMER_0;
  cfg.pin_d0       = Y2_GPIO_NUM;   cfg.pin_d1 = Y3_GPIO_NUM;
  cfg.pin_d2       = Y4_GPIO_NUM;   cfg.pin_d3 = Y5_GPIO_NUM;
  cfg.pin_d4       = Y6_GPIO_NUM;   cfg.pin_d5 = Y7_GPIO_NUM;
  cfg.pin_d6       = Y8_GPIO_NUM;   cfg.pin_d7 = Y9_GPIO_NUM;
  cfg.pin_xclk     = XCLK_GPIO_NUM; cfg.pin_pclk = PCLK_GPIO_NUM;
  cfg.pin_vsync    = VSYNC_GPIO_NUM;cfg.pin_href = HREF_GPIO_NUM;
  cfg.pin_sccb_sda = SIOD_GPIO_NUM; cfg.pin_sccb_scl = SIOC_GPIO_NUM;
  cfg.pin_pwdn     = PWDN_GPIO_NUM; cfg.pin_reset = RESET_GPIO_NUM;
  cfg.xclk_freq_hz = 20000000;      // 20 MHz
  cfg.pixel_format = PIXFORMAT_JPEG;

  // Tối ưu tốc độ/gói tin
  cfg.frame_size   = FRAMESIZE_QVGA; // 320x240 giúp gửi nhanh/nhận nhanh
  cfg.jpeg_quality = 12;             // 10-15: cân bằng
  cfg.fb_count     = 2;

  esp_err_t err = esp_camera_init(&cfg);
  return (err == ESP_OK);
}

/* =======================
   GỬI ẢNH → SERVER (1 lần)
   Trả về true nếu nhận diện OK & có tên+msv
   ======================= */
bool sendOneShot() {
  if (WiFi.status() != WL_CONNECTED) {
    lcd2("Mat ket noi WiFi", "");
    return false;
  }

  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    lcd2("Loi chup anh", "");
    return false;
  }

  digitalWrite(LED_PIN, HIGH);

  HTTPClient http;
  http.setTimeout(12000);        // tăng timeout phòng mạng chậm
  http.begin(serverUrl);
  http.addHeader("Content-Type", "image/jpeg");
  int code = http.POST(fb->buf, fb->len);

  bool ok = false;

  if (code > 0) {
    String resp = http.getString();

    // --- DEBUG: in JSON để kiểm tra thực tế ---
    Serial.println("=== RESPONSE BEGIN ===");
    Serial.println(resp);
    Serial.println("=== RESPONSE END ===");

    DynamicJsonDocument doc(16384);  // 16KB để an toàn
    DeserializationError de = deserializeJson(doc, resp);
    if (!de) {
      // Đừng khóa chặt vào status nữa: nếu thiếu status thì coi như OK
      const char* status = doc["status"] | "ok";
      bool isOk = (strcmp(status, "ok") == 0);

      // Bắt cả 2 kiểu: data.faces | faces
      JsonVariant facesVar = doc["data"]["faces"];
      if (facesVar.isNull()) facesVar = doc["faces"];

      // DEBUG: đếm số face
      int facesCount = (facesVar.is<JsonArray>() ? facesVar.as<JsonArray>().size() : -1);
      Serial.print("isOk="); Serial.println(isOk);
      Serial.print("facesCount="); Serial.println(facesCount);

      if (isOk && facesVar.is<JsonArray>() && facesVar.as<JsonArray>().size() > 0) {
        JsonObject f = facesVar[0];

        const char* name = f["name"] | "Unknown";
        const char* msv  = f["studentCode"] | "Unknown";

        // attendance.detail (nếu có)
        const char* state = "-";
        const char* sess  = "-";
        JsonVariant att = f["attendance"];
        if (!att.isNull() && att["detail"].is<JsonObject>()) {
          state = att["detail"]["state"]   | "-";
          sess  = att["detail"]["session"] | "-";
        }

        // recognized: nếu server không gửi, tự suy luận theo name/msv
        bool recognized = f["recognized"] | ((strcmp(name,"Unknown")!=0) && (strcmp(msv,"Unknown")!=0));

        Serial.print("recognized="); Serial.println(recognized);
        Serial.print("name="); Serial.println(name);
        Serial.print("msv=");  Serial.println(msv);

        if (recognized) {
          lcd2(fit16(String(sess) + ": " + String(state)),
              fit16(String(msv) + " " + String(name)));
          delay(LCD_OK_SHOW_MS);
          ok = true;
        } else {
          lcd2("Khong ton tai!", "Chua DK he thong");
          delay(LCD_FAIL_SHOW_MS);
        }
      } else {
        const char* msg = doc["message"] | "Khong nhan dien";
        lcd2("Ket qua:", fit16(String(msg)));
        delay(LCD_FAIL_SHOW_MS);
      }
    } else {
      Serial.print("JSON parse error: ");
      Serial.println(de.c_str());
      lcd2("JSON khong hop le", "");
      delay(LCD_FAIL_SHOW_MS);
    }
  } else {
    Serial.print("HTTP error, code="); Serial.println(code);
    lcd2("Khong gui duoc", "HTTP error");
    delay(LCD_FAIL_SHOW_MS);
  }

  http.end();
  esp_camera_fb_return(fb);
  digitalWrite(LED_PIN, LOW);
  return ok;
}


/* =======================
   GỬI THEO "BURST"
   → thử nhiều khung hình nhanh để tăng tỉ lệ nhận
   ======================= */
bool captureAndRecognizeBurst(uint8_t shots = BURST_SHOTS) {
  for (uint8_t i = 0; i < shots; ++i) {
    if (sendOneShot()) return true; // trúng phát nào dừng luôn
    delay(120); // nghỉ rất ngắn giữa các lần
  }
  return false;
}

/* =======================
   SETUP
   ======================= */
void setup() {
  Serial.begin(115200);
  Serial.println("=== ESP32-CAM Starting ===");
  
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

#if USE_PIR
  pinMode(PIR_PIN, INPUT);
#endif

  // LCD
  Wire.begin(SDA_PIN, SCL_PIN);
  lcd.init();
  lcd.backlight();
  lcd2("Khoi dong...", "");
  delay(1000);

  // Camera
  Serial.println("Initializing camera...");
  if (!initCamera()) {
    Serial.println("Camera init failed!");
    lcd2("Loi camera!", "");
    while (true) delay(1000);
  }
  Serial.println("Camera initialized successfully");

  // Wi-Fi
  Serial.println("Starting WiFi connection...");
  Serial.print("SSID: "); Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(ssid, password);
  unsigned long t0 = millis();
  lcd2("Dang ket noi WiFi", ssid);
  
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 20000) {
    delay(500);
    Serial.print(".");
    printWiFiStatus();
  }
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi connected successfully! IP: ");
    Serial.println(WiFi.localIP());
    lcd2("WiFi OK", WiFi.localIP().toString());
    delay(2000);
  } else {
    Serial.println("WiFi connection failed after timeout!");
    printWiFiStatus();
    lcd2("WiFi that bai", "Kiem tra SSID/Pass");
    delay(3000);
  }

  lcd2("San sang", "Cho nguoi den");
  Serial.println("=== Setup Complete ===");
}

/* =======================
   LOOP
   ======================= */
void loop() {
  ensureWifi(); // tự reconnect nếu mất mạng

#if USE_PIR
  int pir = digitalRead(PIR_PIN);
  unsigned long now = millis();

  // Phát hiện người mới (PIR HIGH) + chưa khóa + qua cooldown
  if (pir == HIGH && !gateLocked && (now - lastActionMs > COOLDOWN_MS)) {
    gateLocked = true;            // khóa lại để không spam khi PIR còn HIGH
    lastActionMs = now;
    lcd2("Phat hien nguoi", "Dang nhan dien...");
    captureAndRecognizeBurst(BURST_SHOTS);
    lcd2("San sang", "Cho nguoi den");
  }

  // Khi người rời đi (PIR LOW) → mở khóa để lần sau chụp tiếp
  if (pir == LOW) {
    gateLocked = false;
  }

  delay(40);
#else
  // Chế độ định kỳ (không dùng PIR)
  unsigned long now = millis();
  if (now - lastActionMs > INTERVAL_MS) {
    lastActionMs = now;
    lcd2("Chup & gui...", "");
    captureAndRecognizeBurst(BURST_SHOTS);
    lcd2("San sang", WiFi.status()==WL_CONNECTED ? WiFi.localIP().toString() : "Dang ket noi...");
  }
  delay(60);
#endif
}
