#include <HX711.h>

const int trigPin = 15;
const int echoPin = 13;
const int LCdtPin = 4;
const int LCsckPin = 5;

const int binH = 20; // Bin height in cm

const int gL = 14; // Green LED
const int yL = 2;  // Yellow LED
const int rL = 0;  // Red LED
#define sv 0.017 // Speed of sound in cm/us divided by 2
#define aoutPin A0 // Analog pin for capacitive moisture sensor

HX711 scale;

long t;
float dCm;
float trashHeight; // Height of trash
float trashPercentage; // Percentage of bin filled
const int AirMV = 616;
const int WaterMV = 335;
int MV = 0;
float MVp;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(gL, OUTPUT); // Set LED pins as output
  pinMode(yL, OUTPUT);
  pinMode(rL, OUTPUT);
  scale.begin(LCdtPin, LCsckPin);
  scale.tare();
}

void loop() {
  // Measure weight
  long weightraw = scale.read();

  // Measure moisture
  MV = analogRead(aoutPin);
  MVp = map(MV, AirMV, WaterMV, 0, 100);

  // Measure distance
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  t = pulseIn(echoPin, HIGH);
  dCm = t * sv;

  // Calculate trash height
  trashHeight = binH - dCm;
  if (trashHeight < 0) trashHeight = 0; // Ensure no negative trash height

  // Calculate percentage of bin filled
  trashPercentage = (trashHeight / binH) * 100;

  // Initialize light indicators
  int greenState = 0;
  int yellowState = 0;
  int redState = 0;

  // Control LEDs based on trash percentage
  if (trashPercentage <= 25) {
    digitalWrite(gL, HIGH);  // Green LED ON
    digitalWrite(yL, LOW);   // Yellow LED OFF
    digitalWrite(rL, LOW);   // Red LED OFF
    greenState = 1;          // Set indicator for green
  } else if (trashPercentage > 25 && trashPercentage < 75) {
    digitalWrite(gL, LOW);   // Green LED OFF
    digitalWrite(yL, HIGH);  // Yellow LED ON
    digitalWrite(rL, LOW);   // Red LED OFF
    yellowState = 1;         // Set indicator for yellow
  } else if (trashPercentage >= 75) {
    digitalWrite(gL, LOW);   // Green LED OFF
    digitalWrite(yL, LOW);   // Yellow LED OFF
    digitalWrite(rL, HIGH);  // Red LED ON
    redState = 1;            // Set indicator for red
  }

  // Output the results
  Serial.print(weightraw, 2);
  Serial.print(", ");
  Serial.print(MV);
  Serial.print(", ");
  Serial.print(MVp);
  Serial.print(", ");
  Serial.print(trashHeight);
  Serial.print(", ");
  Serial.print(trashPercentage);
  Serial.print(", ");
  Serial.print(greenState);
  Serial.print(", ");
  Serial.print(yellowState);
  Serial.print(", ");
  Serial.println(redState);

  delay(1000);
}
