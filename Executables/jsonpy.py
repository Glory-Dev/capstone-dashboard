import json
from datetime import datetime
import time
import os

# Function to process and convert the data into the desired JSON format
def convert_to_json(input_file, output_file):
    data_list = []  # List to hold the JSON objects
    last_position = 0  # Track the last read position in the file

    while True:  # Keep the process running continuously
        with open(input_file, 'r') as txt_file:
            # Move the file pointer to the last read position
            txt_file.seek(last_position)
            # Read the new lines from the file
            new_lines = txt_file.readlines()

            for line in new_lines:
                # Remove leading/trailing whitespace and check if the line is not empty
                line = line.strip()
                if line:
                    # Split the line by comma and check if it contains exactly 7 values
                    data = line.split(',')
                    if len(data) == 7:
                        weight = data[0].strip()  # Weight (Mass)
                        MV = data[1].strip()  # Voltage measurement
                        MVp = data[2].strip()  # Voltage percentage
                        height = data[3].strip()  # Trash height
                        trash_percentage = data[4].strip()  # Trash percentage
                        mode = data[5].strip()  # Mode (most frequent value)

                        # Get current time
                        current_time = datetime.now().isoformat() + 'Z'

                        # Create a JSON object with the required format
                        json_object = {
                            "time": current_time,
                            "weight": weight,
                            "MV": MV,
                            "MVp": MVp,
                            "height": height,
                            "trash_percentage": trash_percentage,
                            "mode": mode
                        }

                        # Append the JSON object to the list
                        data_list.append(json_object)

            # Update the last read position in the file
            last_position = txt_file.tell()

        # Write the entire list of JSON objects to the output file (overwriting every time)
        with open(output_file, 'w') as json_file:
            json.dump(data_list, json_file, indent=4)

        print(f"Data written to {output_file}. Sleeping for 1 second...")

        # Wait a second before checking for new lines
        time.sleep(1)  # You can adjust this sleep time to your needs

# Define the input and output file paths
input_file = r"C:\Users\Adham\Downloads\ESP8266\jsonmaker\sensor_data.txt"
output_file = r"C:\Users\Adham\Downloads\ESP8266\jsonmaker\sensor_data.json"

# Call the function to continuously convert the data
convert_to_json(input_file, output_file)
