#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include <numeric> // For std::accumulate
#include <windows.h> // For serial communication on Windows

using namespace std;

int mostFrequent(const vector<int> &values) {
    int maxCount = 0, freqValue = -1;

    for (int value : values) {
        int currentCount = count(values.begin(), values.end(), value); // Fixed conflict with std::count
        if (currentCount > maxCount) {
            maxCount = currentCount;
            freqValue = value;
        }
    }

    return freqValue;
}

int main() {
    const char *portName = "\\\\.\\COM7";

    // Open the COM port
    HANDLE hSerial = CreateFile(portName, GENERIC_READ | GENERIC_WRITE, 0, 0, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, 0);
    if (hSerial == INVALID_HANDLE_VALUE) {
        cerr << "Error: Could not open COM port." << endl;
        return 1;
    }

    // Configure COM port
    DCB dcbSerialParams = {0};
    dcbSerialParams.DCBlength = sizeof(dcbSerialParams);
    if (!GetCommState(hSerial, &dcbSerialParams)) {
        cerr << "Error: Could not get COM port state." << endl;
        return 1;
    }
    dcbSerialParams.BaudRate = CBR_115200;
    dcbSerialParams.ByteSize = 8;
    dcbSerialParams.StopBits = ONESTOPBIT;
    dcbSerialParams.Parity = NOPARITY;
    if (!SetCommState(hSerial, &dcbSerialParams)) {
        cerr << "Error: Could not set COM port parameters." << endl;
        return 1;
    }

    // Set timeouts
    COMMTIMEOUTS timeouts = {50, 50, 10, 0, 0};
    if (!SetCommTimeouts(hSerial, &timeouts)) {
        cerr << "Error: Could not set timeouts." << endl;
        return 1;
    }

    cout << "Reading data from COM7..." << endl;

    vector<float> weightraw_values, MV_values, MVp_values, trashHeight_values, trashPercentage_values;
    vector<int> gL_values, yL_values, rL_values;
    int count = 0;

    while (true) {
        char buffer[128];
        DWORD bytesRead;

        // Read data from the COM port
        if (ReadFile(hSerial, buffer, sizeof(buffer) - 1, &bytesRead, NULL) && bytesRead > 0) {
            buffer[bytesRead] = '\0';
            string data(buffer);

            // Parse the serial data
            float weightraw, MV, MVp, trashHeight, trashPercentage;
            int gL, yL, rL;

            if (sscanf(data.c_str(), "%f, %f, %f, %f, %f, %d, %d, %d",
                       &weightraw, &MV, &MVp, &trashHeight, &trashPercentage, &gL, &yL, &rL) == 8) {
                weightraw_values.push_back(weightraw);
                MV_values.push_back(MV);
                MVp_values.push_back(MVp);
                trashHeight_values.push_back(trashHeight);
                trashPercentage_values.push_back(trashPercentage);
                gL_values.push_back(gL);
                yL_values.push_back(yL);
                rL_values.push_back(rL);

                count++;

                // After 30 readings (30 seconds)
                if (count == 30) {
                    float weightraw_avg = accumulate(weightraw_values.begin(), weightraw_values.end(), 0.0) / count;
                    float MV_avg = accumulate(MV_values.begin(), MV_values.end(), 0.0) / count;
                    float MVp_avg = accumulate(MVp_values.begin(), MVp_values.end(), 0.0) / count;
                    float trashHeight_avg = accumulate(trashHeight_values.begin(), trashHeight_values.end(), 0.0) / count;
                    float trashPercentage_avg = accumulate(trashPercentage_values.begin(), trashPercentage_values.end(), 0.0) / count;

                    int gL_mode = mostFrequent(gL_values);
                    int yL_mode = mostFrequent(yL_values);
                    int rL_mode = mostFrequent(rL_values);

                    // Print results to terminal
                    cout << "Averages: " << weightraw_avg << ", " << MV_avg << ", " << MVp_avg << ", "
                         << trashHeight_avg << ", " << trashPercentage_avg << endl;
                    cout << "Most Frequent (Modes): " << gL_mode << ", " << yL_mode << ", " << rL_mode << endl;

                    // Write results to file
                    ofstream outFile("sensor_data.txt", ios::out | ios::app);
                    if (outFile) {
                        outFile << weightraw_avg << ", " << MV_avg << ", " << MVp_avg << ", "
                                << trashHeight_avg << ", " << trashPercentage_avg << ", "
                                << gL_mode << ", " << yL_mode << ", " << rL_mode << endl;
                        outFile.close();
                    }

                    // Reset counters and vectors
                    count = 0;
                    weightraw_values.clear();
                    MV_values.clear();
                    MVp_values.clear();
                    trashHeight_values.clear();
                    trashPercentage_values.clear();
                    gL_values.clear();
                    yL_values.clear();
                    rL_values.clear();
                }
            }
        } else {
            cerr << "Error: Failed to read from COM port." << endl;
        }

        Sleep(1000); // 1-second delay between readings
    }

    CloseHandle(hSerial);
    return 0;
}
