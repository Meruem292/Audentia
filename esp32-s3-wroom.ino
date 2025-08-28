// This sketch is for the AI-THINKER ESP32-CAM board.
// IMPORTANT: When uploading, you must connect GPIO 0 to GND.
// After uploading, disconnect GPIO 0 from GND and press the RST button.

#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>

// Select camera model
#define CAMERA_MODEL_AI_THINKER

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server details
const char* server_host = "YOUR_DEPLOYED_APP_URL"; // e.g., my-ecovend-app.vercel.app
const char* server_path = "/api/esp32/image";
const int server_port = 443;
const char* api_key = "YOUR_REVENDO_API_KEY"; // Replace with your actual API key from .env.local

// Upload interval (milliseconds)
const int uploadInterval = 5000;

// Pin definition for CAMERA_MODEL_AI_THINKER
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
  while (client.connected() && millis() - timeout < 5000) { // Increased timeout for server processing
    while (client.available()) {
      String line = client.readStringUntil('\n');
      Serial.println(line);
    }
  }
  // The server may close the connection after sending the response.
  // We can just stop listening instead of throwing an error.
  if (!client.connected()) {
      Serial.println("Server disconnected.");
  }


  esp_camera_fb_return(fb);
}


//==============================================================
// Setup
//==============================================================
void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

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
  
  // Frame size and quality
  config.frame_size = FRAMESIZE_VGA; // (640x480) - A good balance
  config.jpeg_quality = 12; // lower numbers = higher quality
  config.fb_count = 2;
  config.fb_location = CAMERA_FB_IN_PSRAM; // Use PSRAM for frame buffer

  // Init camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
  
  sensor_t * s = esp_camera_sensor_get();
  // initial sensors are flipped vertically and colors are a bit saturated
  if (s->id.PID == OV3660_PID) {
    s->set_vflip(s, 1); // flip it back
    s->set_brightness(s, 1); // up the blightness just a bit
    s->set_saturation(s, -2); // lower the saturation
  }

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\nWiFi connected! IP: %s\n", WiFi.localIP().toString().c_str());

  // Don't use certificates for HTTPS connection (less secure, but simpler for prototype)
  client.setInsecure(); 
}

//==============================================================
// Loop
//==============================================================
void loop() {
  takeAndUploadPhoto();
  delay(uploadInterval);
}
