//==============================================================
// ESP32-CAM Photo Upload (for EcoVend / Audentia)
// Board: AI-THINKER ESP32-CAM
//==============================================================
// IMPORTANT: 
//  - Connect GPIO 0 to GND when flashing.
//  - After flashing, disconnect GPIO 0 from GND and press RESET.
//==============================================================

#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>

// --- IMPORTANT: CONFIGURE YOUR SETTINGS HERE ---
// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server details
const char* server_host = "YOUR_DEPLOYED_APP_URL"; // e.g., audentia.vercel.app
const char* server_path = "/api/esp32/image";
const int server_port = 443;

// API Key (from your .env file)
const char* api_key = "a4b8c1d6-e2f3-4a5b-8c7d-9e0f1a2b3c4d";
// --- END OF CONFIGURATION ---


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

// Persistent secure client
WiFiClientSecure client;

//==============================================================
// Connect to Server with retries
//==============================================================
bool connectToServer(int retries = 3) {
  client.stop(); // Close any previous connection

  for (int i = 0; i < retries; i++) {
    Serial.printf("🔌 Connecting to server %s (%d/%d)...\n", server_host, i + 1, retries);
    if (client.connect(server_host, server_port)) {
      Serial.println("✅ Connected to server!");
      return true;
    }
    Serial.printf("⚠️ Connection failed. Retrying in 2 seconds...\n");
    delay(2000);
  }

  Serial.println("❌ Could not connect to server after multiple retries.");
  return false;
}

//==============================================================
// Take and upload a photo
//==============================================================
void takeAndUploadPhoto() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("❌ Camera capture failed");
    return;
  }

  Serial.printf("📸 Picture taken! Size: %zu bytes, Resolution: %dx%d\n", fb->len, fb->width, fb->height);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi disconnected, skipping upload.");
    esp_camera_fb_return(fb);
    return;
  }

  if (!connectToServer()) {
    esp_camera_fb_return(fb);
    return;
  }

  Serial.println("📤 Sending request...");

  // Build and send request headers
  client.printf("POST %s HTTP/1.1\r\n", server_path);
  client.printf("Host: %s\r\n", server_host);
  client.printf("x-api-key: %s\r\n", api_key);
  client.println("User-Agent: ESP32-CAM Client");
  client.println("Connection: close");
  client.println("Content-Type: image/jpeg");
  client.printf("Content-Length: %d\r\n", fb->len);
  client.println();

  // Send JPEG data
  client.write(fb->buf, fb->len);
  
  // Free the buffer AFTER sending
  esp_camera_fb_return(fb);

  Serial.println("... Waiting for server response ...");

  // Read server response
  unsigned long timeout = millis();
  String response_headers = "";
  String response_body = "";
  bool headers_received = false;

  while (client.connected() && millis() - timeout < 10000) {
      while (client.available()) {
          if (!headers_received) {
              String line = client.readStringUntil('\n');
              response_headers += line + "\n";
              if (line == "\r") {
                  headers_received = true;
              }
          } else {
              response_body += (char)client.read();
          }
      }
  }

  Serial.println("\n⬅️ Server Response Headers:");
  Serial.print(response_headers);
  Serial.println("\n⬅️ Server Response Body:");
  Serial.print(response_body);

  if (response_headers.indexOf("HTTP/1.1 200") != -1) {
    Serial.println("\n✅ Upload successful!");
  } else {
    Serial.println("\n❌ Upload failed! Check server logs and API key.");
  }
  
  client.stop();
  Serial.println("\nℹ️ Connection closed.");
}

//==============================================================
// Setup
//==============================================================
void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println("\n--- ESP32-CAM EcoVend Client ---");

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
  config.frame_size = FRAMESIZE_VGA; // 640x480
  config.jpeg_quality = 12;          // 0-63 (lower = better quality)
  config.fb_count = 1;               // Use 1 frame buffer if PSRAM is limited
  config.fb_location = CAMERA_FB_IN_PSRAM;

  // Init camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("❌ Camera init failed with error 0x%x\n", err);
    return;
  }
  Serial.println("✅ Camera initialized successfully.");

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("📡 Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\n✅ WiFi connected! IP: %s\n", WiFi.localIP().toString().c_str());

  // Configure secure client
  client.setInsecure(); // Skip certificate validation for simplicity
  client.setTimeout(15000); // 15 seconds
}

//==============================================================
// Loop
//==============================================================
void loop() {
  Serial.println("\nType 'send' and press Enter to take and upload a photo.");
  
  while (!Serial.available()) {
    delay(100);
  }

  String command = Serial.readStringUntil('\n');
  command.trim();

  if (command.equalsIgnoreCase("send")) {
    takeAndUploadPhoto();
  } else if (!command.isEmpty()) {
    Serial.print("Unknown command: ");
    Serial.println(command);
  }
}
