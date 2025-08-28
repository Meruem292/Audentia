#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>

// =============================================================
// == EDIT THE VALUES BELOW ====================================
// =============================================================

// Replace with your network credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Replace with your deployed application's URL (without https://)
const char* server_host = "your-app-name.vercel.app"; 

// Replace with your API Key from .env.local
const char* api_key = "YOUR_REVENDO_API_KEY";

// =============================================================
// =============================================================

// Server details
const char* server_path = "/api/esp32/image";
const int server_port = 443;

// Upload interval (milliseconds)
const int uploadInterval = 5000;

// Persistent secure client
WiFiClientSecure client;

//==============================================================
//== CAMERA PIN CONFIGURATION for ESP32-S3-WROOM-1 =============
//==============================================================
#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM     10
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       19
#define Y4_GPIO_NUM       21
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM       5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

//==============================================================
// Function to connect to server (reuse connection)
//==============================================================
bool connectToServer() {
  if (client.connected()) return true; // Already connected
  Serial.printf("Connecting to server: %s\n", server_host);
  if (!client.connect(server_host, server_port)) {
    Serial.println("Connection to server failed!");
    return false;
  }
  Serial.println("Connected to server!");
  return true;
}

//==============================================================
// Function to take and upload a picture
//==============================================================
void takeAndUploadPhoto() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }

  Serial.printf("Picture taken! Size: %zu bytes\n", fb->len);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, skipping upload.");
    esp_camera_fb_return(fb);
    return;
  }

  if (!connectToServer()) {
    esp_camera_fb_return(fb);
    return;
  }

  // Send HTTP POST request
  client.printf("POST %s HTTP/1.1\r\n", server_path);
  client.printf("Host: %s\r\n", server_host);
  client.printf("x-api-key: %s\r\n", api_key);
  client.println("Content-Type: image/jpeg");
  client.printf("Content-Length: %d\r\n", fb->len);
  client.println();
  client.write(fb->buf, fb->len);

  Serial.println("Request sent. Waiting for response...");

  unsigned long timeout = millis();
  while (client.connected() && millis() - timeout < 5000) {
    while (client.available()) {
      String line = client.readStringUntil('\n');
      Serial.println(line);
    }
  }

  esp_camera_fb_return(fb);
}

//==============================================================
// Setup
//==============================================================
void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);

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

  // Smaller frame size for speed
  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 12;
  config.fb_count = 2; // Increased buffer count
  config.fb_location = CAMERA_FB_IN_PSRAM; // <-- THIS IS THE FIX

  // Init camera
  if (esp_camera_init(&config) != ESP_OK) {
    Serial.println("Camera init failed");
    return;
  }

  // Connect to Wi-Fi once
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\nWiFi connected! IP: %s\n", WiFi.localIP().toString().c_str());

  // Prepare secure client
  client.setInsecure(); // Insecure for development, use certificate in production
}

//==============================================================
// Loop
//==============================================================
void loop() {
  takeAndUploadPhoto();
  delay(uploadInterval);
}
