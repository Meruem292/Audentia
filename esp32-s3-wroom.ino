#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>

// =============================================================
// == USER CONFIGURATION =======================================
// =============================================================

// -- WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// -- Server Details
// Replace with your deployed Vercel/Firebase URL
const char* server_host = "YOUR_APP_HOSTNAME"; 
const char* server_path = "/api/esp32/image";
const int server_port = 443;

// -- API Key
// Make sure this matches the REVENDO_API_KEY in your .env.local file
const char* api_key = "YOUR_REVENDO_API_KEY";

// -- Upload Interval (milliseconds)
const int uploadInterval = 5000;

// =============================================================

// Persistent secure client
WiFiClientSecure client;

//==============================================================
//== CAMERA PIN CONFIGURATION (for AI-THINKER ESP32-CAM) =======
//==============================================================
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

//==============================================================
// Function to connect to server (reusing the connection)
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
  while (client.connected() && millis() - timeout < 5000) { // Increased timeout for server processing
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

  // Smaller frame size for speed and smaller payload
  config.frame_size = FRAMESIZE_QVGA; // 320x240
  config.jpeg_quality = 12; // Lower quality for smaller size
  config.fb_count = 1;

  // Init camera
  if (esp_camera_init(&config) != ESP_OK) {
    Serial.println("Camera init failed. Halting.");
    while(true);
  }

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\nWiFi connected! IP: %s\n", WiFi.localIP().toString().c_str());

  // Prepare secure client
  client.setInsecure(); // Insecure for development. For production, use certificates.
  connectToServer();
}

//==============================================================
// Loop
//==============================================================
void loop() {
  takeAndUploadPhoto();
  delay(uploadInterval);
}
