
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Server } from "lucide-react";

export default function DeviceSetupPage() {
  const apiKey = process.env.REVENDO_API_KEY || "Your API key is not set in .env";
  // In a real deployed environment, you'd replace this with your actual domain
  const serverUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002"; 
  const serverHost = new URL(serverUrl).hostname;
  const serverPort = serverUrl.startsWith("https") ? 443 : 80;
  const serverPath = "/api/esp32/image";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Device Setup</h1>
        <p className="text-muted-foreground">
          Configure your ESP32-CAM with these settings.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> Server Details</CardTitle>
            <CardDescription>
                Use these values in your ESP32 code to connect to the server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="serverHost">Server Host</Label>
                <Input id="serverHost" value={serverHost} readOnly />
            </div>
             <div className="space-y-2">
                <Label htmlFor="serverPath">API Path</Label>
                <Input id="serverPath" value={serverPath} readOnly />
            </div>
            <div className="space-y-2">
                <Label htmlFor="serverPort">Server Port</Label>
                <Input id="serverPort" value={serverPort} readOnly />
            </div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> API Key</CardTitle>
             <CardDescription>
                This key authenticates your device with the API. Find it in your .env file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
                <Label htmlFor="apiKey">X-API-KEY Header</Label>
                <Input id="apiKey" value={apiKey} readOnly />
            </div>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8 bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Example ESP32 Arduino Code Snippet</h3>
        <pre className="text-xs bg-background p-3 rounded-md overflow-x-auto">
          <code>
{`// --- CONFIGURE YOUR SETTINGS HERE ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

const char* server_host = "${serverHost}";
const char* server_path = "${serverPath}";
const int server_port = ${serverPort}; // Use 443 for HTTPS, 80 for HTTP

const char* api_key = "${apiKey}";
// --- END CONFIGURATION ---

// Function to send Base64 image to your Next.js API
void sendPhotoToAPI(String base64Photo) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Construct JSON payload
    String jsonPayload = "{\\"image\\":\\"" + base64Photo + "\\"}"

    http.begin(server_host, server_port, server_path);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", api_key);

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);

      // You can now parse the JSON response to get the bottle count
      // For example: if (response.indexOf("bottleCount") > 0) { ... }
      
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  }
}`}
          </code>
        </pre>
      </div>
    </div>
  );
}
