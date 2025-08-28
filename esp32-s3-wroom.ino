//==============================================================
// ESP32-CAM Base64 Photo Sender (for EcoVend / Audentia)
// Board: AI-THINKER ESP32-CAM
//==============================================================

#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include "Base64.h" // Install Base64 library via Library Manager

// --- CONFIGURE YOUR SETTINGS HERE ---
const char* ssid = "God bless ";
const char* password = "angpangetmo";

const char* server_host = "audentia.vercel.app";
const char* server_path = "/api/esp32/image";
const int server_port = 443;

// This key must match the REVENDO_API_KEY in your web app's .env file
const char* api_key = "a4b8c1d6-e2f3-4a5b-8c7d-9e0f1a2b3c4d";
// --- END CONFIGURATION ---

// Camera pin config for AI-THINKER model
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

WiFiClientSecure client;

//==============================================================
// Connect to Server
//==============================================================
bool connectToServer(int retries = 3) {
  client.stop();

  for (int i = 0; i < retries; i++) {
    Serial.printf("🔌 Connecting to server %s (%d/%d)...\n", server_host, i + 1, retries);
    if (client.connect(server_host, server_port)) {
      Serial.println("✅ Connected to server!");
      return true;
    }
    Serial.println("⚠️ Connection failed, retrying in 2s...");
    delay(2000);
  }

  Serial.println("❌ Could not connect to server.");
  return false;
}

//==============================================================
// Take photo, convert to Base64, send JSON
//==============================================================
void takeAndSendBase64Photo() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("❌ Camera capture failed");
    return;
  }

  Serial.printf("📸 Picture taken! Size: %zu bytes\n", fb->len);

  // Convert JPEG to Base64
  String image_base64 = base64::encode(fb->buf, fb->len);

  // Free camera buffer
  esp_camera_fb_return(fb);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi disconnected, skipping send.");
    return;
  }

  if (!connectToServer()) {
    return;
  }

  // Build JSON
  String json = "{\"image\":\"" + image_base64 + "\"}";

  // Send POST request
  client.printf("POST %s HTTP/1.1\r\n", server_path);
  client.printf("Host: %s\r\n", server_host);
  client.printf("x-api-key: %s\r\n", api_key);
  client.println("User-Agent: ESP32-CAM Client");
  client.println("Connection: close");
  client.println("Content-Type: application/json");
  client.printf("Content-Length: %d\r\n", json.length());
  client.println();
  client.print(json);

  Serial.println("📤 JSON sent, waiting for server response...");

  // Read response
  unsigned long timeout = millis();
  String response = "";
  while (client.connected() && millis() - timeout < 10000) {
    while (client.available()) {
      char c = client.read();
      response += c;
    }
  }

  Serial.println("\n⬅️ Server Response:");
  Serial.println(response);

  client.stop();
  Serial.println("ℹ️ Connection closed.");
}

//==============================================================
// Setup
//==============================================================
void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println("\n--- ESP32-CAM Base64 Sender ---");

  // Camera config
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
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = 12;
  config.fb_count = 1;
  config.fb_location = CAMERA_FB_IN_PSRAM;

  if (esp_camera_init(&config) != ESP_OK) {
    Serial.println("❌ Camera init failed");
    return;
  }
  Serial.println("✅ Camera initialized.");

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("📡 Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\n✅ WiFi connected! IP: %s\n", WiFi.localIP().toString().c_str());

  client.setInsecure(); // Skip SSL cert verification
  client.setTimeout(15000);
}

//==============================================================
// Loop
//==============================================================
void loop() {
  Serial.println("\nType 'send' and press Enter to take and send a photo.");

  while (!Serial.available()) {
    delay(100);
  }

  String command = Serial.readStringUntil('\n');
  command.trim();

  if (command.equalsIgnoreCase("send")) {
    takeAndSendBase64Photo();
  } else if (!command.isEmpty()) {
    Serial.print("Unknown command: ");
    Serial.println(command);
  }
}
