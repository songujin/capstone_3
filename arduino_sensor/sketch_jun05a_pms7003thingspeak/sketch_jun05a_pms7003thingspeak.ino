#include "ThingSpeak.h"
#include "secrets.h"
#include <ESP8266WiFi.h>
#include <Arduino.h>
#include <pms.h>

Pmsx003 pms(D1, D2);

char ssid[] = "Note8 hsh";   // your network SSID (name) 
char pass[] = "20071151";   // your network password
int keyIndex = 0;            // your network key Index number (needed only for WEP)
WiFiClient  client;

unsigned long myChannelNumber = 790637;
const char * myWriteAPIKey = "C6IXMM6CBSR5U9F9";
String myStatus = "";

//https://m.blog.naver.com/PostView.nhn?blogId=zeta0807&logNo=221320404934&proxyReferer=https%3A%2F%2Fwww.google.com%2F

void setup(void) {
    Serial.begin(115200);
    while (!Serial) {};
    Serial.println("Pmsx003");
    WiFi.mode(WIFI_STA); 
    ThingSpeak.begin(client);  // Initialize ThingSpeak
  
    pms.begin();
    pms.waitForData(Pmsx003::wakeupTime);
    pms.write(Pmsx003::cmdModeActive);
}

////////////////////////////////////////

auto lastRead = millis();

void loop(void) {
      if(WiFi.status() != WL_CONNECTED){
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(SECRET_SSID);
    while(WiFi.status() != WL_CONNECTED){
      WiFi.begin(ssid, pass);  // Connect to WPA/WPA2 network. Change this line if using open or WEP network
      Serial.print(".");
      delay(5000);     
    } 
    Serial.println("\nConnected.");
  }
  
    const auto n = Pmsx003::Reserved;
    Pmsx003::pmsData data[n];

    Pmsx003::PmsStatus status = pms.read(data, n);
    switch (status) {
        case Pmsx003::OK:
        {
            Serial.println("_________________");
            auto newRead = millis();
            Serial.print("Wait time ");
            Serial.println(newRead - lastRead);
            lastRead = newRead;

            // For loop starts from 3
            // Skip the first three data (PM1dot0CF1, PM2dot5CF1, PM10CF1)
            for (size_t i = Pmsx003::PM1dot0; i < n; ++i) { 
                Serial.print(data[i]);
                Serial.print("\t");
                Serial.print(Pmsx003::dataNames[i]);
                Serial.print(" [");
                Serial.print(Pmsx003::metrics[i]);
                Serial.print("]");
                Serial.println();
                   ThingSpeak.setField(1, data[0]);
                   ThingSpeak.setField(2, data[1]);
                   ThingSpeak.setField(3, data[2]);
                    myStatus = String("Goooood");
                    ThingSpeak.setStatus(myStatus);
                    int x = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);
                      if(x == 200){
                        Serial.println("Channel update successful.");
                      }
                      else{
                        Serial.println("Problem updating channel. HTTP error code " + String(x));
                      }
                 
            }
            break;
        }
        case Pmsx003::noData:
            break;
        default:
            Serial.println("_________________");
            Serial.println(Pmsx003::errorMsg[status]);
    };
    delay(1000);
}
