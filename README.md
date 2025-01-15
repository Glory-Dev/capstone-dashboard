
# SMART MONITORING SYSTEM DOCUMENTS
- [Capstone Documents drive](https://drive.google.com/drive/folders/1kvBn-YJEM9WTtCZP2Ex0dNJnZ2Q74wc_)
- [Trial 2 data samples](https://github.com/Glory-Dev/capstone-dashboard/blob/main/Data%20samples/sample%20data.txt)
- [ESP8266 C++ Code](https://github.com/Glory-Dev/capstone-dashboard/tree/main/ESP8266)
- [ESP8266 C++ Code Explanation](#https://github.com/Glory-Dev/capstone-dashboard?tab=readme-ov-file#ARDUINO_SOURCE_CODE_EXPLANATION)
- [C++ & Python code & Executables (to create the JSON file](https://github.com/Glory-Dev/capstone-dashboard/tree/main/Executables)
- [Web Dashboard](https://github.com/Glory-Dev/capstone-dashboard/tree/main/src)

# ARDUINO_SOURCE_CODE_EXPLANATION

| <i>included at `assets/ESP8266/ESP8266.ino`</i>
---

Include the HX711 library, which provides functions to read data from the HX711 load cell amplifier (used for weight measurement):
```C++
#include  <HX711.h>
```
\
Define the pins for the ultrasonic sensor.    
-   `trigPin`  sends a signal.
-   `echoPin`  receives the reflected signal.
- `LCdtPin ` & `LCsckPin ` Specify the data 
-   Clock `LCsckPin` pins for the HX711 load cell module.
```C++
const int trigPin = 15;  
const  int  echoPin = 13;
const  int LCdtPin = 4;  
const  int LCsckPin = 5;
```
\
Setting the bin's height in centimeters to calculate how full the bin is.
```C++
const  int binH = 20; // Bin height in cm
```

> Change this number if you want to change the height threshold.

\
Specify in the alerts of the system by assigning pin numbers for the (green, yellow, and red) LEDs **which is used to show the bin's fill level**:
```C++
const  int gL = 14; // Green LED  
const  int yL = 2; // Yellow LED  
const  int rL = 0; // Red LED
```
\
Create an instance of the HX711 class to communicate with the load cell.
```C++
HX711 scale;
```

\
Define variables to store data and set reference values for the moisture sensor:
```C++
long t; // Time taken by the ultrasonic pulse to travel to the object and back
float dCm; // Distance measured by ultrasonic sensor  
float trashHeight; // The height of the trash in the bin
float trashPercentage; // Percentage of bin filled
```
```C++
const  int AirMV = 616; // Sensor reading when dry (air).
const  int WaterMV = 335; //Sensor reading when fully wet (water).
```

\
Obtain readings from the moisture sensor
```C++
int MV = 0; // Raw value  
float MVp; // Moisture percentage
```

\
Initialize serial communication at a baud rate of 115200 for debugging and monitoring sensor data.
> *Baud rate: the measure of the number of changes to the signal (per second) that propagate through a transmission medium.*

This is the part the sets the ultrasonic sensor pins:
-   This is the part that.
-   Initializes the HX711 module for weight measurement and resets the load cell to zero using tare().
```C++
void  setup() {  
	Serial.begin(115200);
	pinMode(trigPin, OUTPUT); // send the signal (output)
	pinMode(echoPin, INPUT); // receive the reflected signal (input)
	
	//  configure the LED pins as outputs
	pinMode(gL, OUTPUT); // Green LED
	pinMode(yL, OUTPUT); // Yellow LED
	pinMode(rL, OUTPUT); // Red LED
	
	scale.begin(LCdtPin, LCsckPin);  
	scale.tare();  
}
```

\
Define a function  to read the raw weight data from the load cell:
```C++
void  loop() {  
	long weightraw = scale.read();
	
	// This reads the moisture sensor value and maps it to a percentage:
	// 0% for dry (air) and 100% for wet (water)
	MV = analogRead(aoutPin);  
	MVp = map(MV, AirMV, WaterMV, 0, 100);
	
	//
	digitalWrite(trigPin, LOW); // sends an ultrasonic pulse
	delayMicroseconds(2); 
	digitalWrite(trigPin, HIGH);  
	delayMicroseconds(10);  
	digitalWrite(trigPin, LOW);  
	t = pulseIn(echoPin, HIGH); // calculates the time (t) it takes for the signal to return (echoPin).
	dCm = t * sv; // converts the time into distance (dCm) using the speed of sound.

	// This calculates the height of trash in the bin by subtracting the distance from the bin's height and ensures no negative height.
	trashHeight = binH - dCm;  
	if (trashHeight < 0) trashHeight = 0;
	
	// Calculate the percentage of the bin filled based on trash height.
	trashPercentage = (trashHeight / binH) * 100;

	// Initiate variables to track the state of each LED
	int greenState = 0;  
	int yellowState = 0;  
	int redState = 0;

	// Condition the LEDs to on or off based on the fill percentage:
	//- Green for <25%.
	//- Yellow for 25–75%.
	//- Red for ≥75%.
	if (trashPercentage <= 25) {  
		digitalWrite(gL, HIGH);  
		digitalWrite(yL, LOW);  
		digitalWrite(rL, LOW);  
		greenState = 1;  
	} else  if (trashPercentage > 25 && trashPercentage < 75) {  
		digitalWrite(gL, LOW);  
		digitalWrite(yL, HIGH);  
		digitalWrite(rL, LOW);  
		yellowState = 1;  
	} else  if (trashPercentage >= 75) {  
		digitalWrite(gL, LOW);  
		digitalWrite(yL, LOW);  
		digitalWrite(rL, HIGH);  
		redState = 1;  
	}
    
	// Print the sensor readings and LED states to the serial monitor
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

	// This delays for 1 second before restarting the loop to stabilize measurements.q
	delay(1000);  
}
```
