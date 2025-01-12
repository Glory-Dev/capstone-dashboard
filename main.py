import matplotlib.pyplot as plt 

# Data
data = [[1.057, 526, 22.0, 6.47, 32.34, 0, 1, 0], [1.055, 531, 30.0, 6.47, 32.34, 0, 1, 0], [1.054, 534, 29.0, 6.45, 32.26, 0, 1, 0], [1.056, 530, 31.0, 6.45, 32.26, 0, 1, 0], [1.053, 535, 29.0, 6.45, 32.26, 0, 1, 0], [1.055, 532, 30.0, 6.45, 32.26, 0, 1, 0], [1.057, 530, 31.0, 6.45, 32.26, 0, 1, 0], [1.056, 524, 33.0, 6.47, 32.34, 0, 1, 0], [1.057, 526, 32.0, 6.47, 32.34, 0, 1, 0], [1.057, 528, 31.0, 6.47, 32.34, 0, 1, 0], [1.054, 532, 30.0, 6.47, 32.34, 0, 1, 0], [1.057, 542, 26.0, 6.45, 32.26, 0, 1, 0], [1.056, 545, 25.0, 6.45, 32.26, 0, 1, 0], [1.052, 545, 25.0, 6.45, 32.26, 0, 1, 0], [1.051, 544, 26.0, 6.47, 32.34, 0, 1, 0], [1.056, 540, 27.0, 6.45, 32.26, 0, 1, 0], [1.054, 540, 27.0, 6.45, 32.26, 0, 1, 0], [1.056, 524, 33.0, 6.47, 32.34, 0, 1, 0], [1.054, 525, 32.0, 6.45, 32.26, 0, 1, 0], [1.053, 535, 29.0, 6.47, 32.34, 0, 1, 0], [1.052, 538, 28.0, 6.45, 32.26, 0, 1, 0], [1.052, 532, 30.0, 6.45, 32.26, 0, 1, 0], [1.054, 531, 30.0, 6.47, 32.34, 0, 1, 0], [1.056, 532, 30.0, 6.47, 32.34, 0, 1, 0], [1.053, 529, 31.0, 6.45, 32.26, 0, 1, 0], [1.054, 536, 28.0, 6.47, 32.34, 0, 1, 0], [1.055, 528, 31.0, 6.47, 32.34, 0, 1, 0], [1.055, 533, 30.0, 6.45, 32.26, 0, 1, 0], [1.054, 532, 30.0, 6.45, 32.26, 0, 1, 0], [1.056, 526, 32.0, 6.45, 32.26, 0, 1, 0], [1.055, 536, 28.0, 6.47, 32.34, 0, 1, 0], [1.052, 536, 28.0, 6.45, 32.26, 0, 1, 0], [1.056, 538, 28.0, 6.45, 32.26, 0, 1, 0], [1.053, 536, 28.0, 6.45, 32.26, 0, 1, 0]]

# Transpose data to separate each column
data_transposed = list(zip(*data))

# Extract data columns
mass_values = data_transposed[0]
moisture_analog_values = data_transposed[1]
moisture_percentages = data_transposed[2]
trash_heights = data_transposed[3]
trash_fill_percentages = data_transposed[4]
light_green = data_transposed[5]
light_yellow = data_transposed[6]
light_red = data_transposed[7]

# Plot settings
x_values = list(range(len(data)))

# 1. Mass Values
plt.figure(figsize=(10, 6))
plt.plot(x_values, mass_values, marker='o', label='Mass Value')
plt.title('Mass Value over Time')
plt.xlabel('Sample Index')
plt.ylabel('Mass Value')
plt.grid()
plt.legend()
plt.show()

# 2. Moisture Analog Values
plt.figure(figsize=(10, 6))
plt.plot(x_values, moisture_analog_values, marker='o', label='Moisture Analog Value', color='orange')
plt.title('Moisture Analog Value over Time')
plt.xlabel('Sample Index')
plt.ylabel('Moisture Analog Value')
plt.grid()
plt.legend()
plt.show()

# 3. Moisture Percentages
plt.figure(figsize=(10, 6))
plt.plot(x_values, moisture_percentages, marker='o', label='Moisture Percentage', color='green')
plt.title('Moisture Percentage over Time')
plt.xlabel('Sample Index')
plt.ylabel('Moisture Percentage (%)')
plt.grid()
plt.legend()
plt.show()

# 4. Trash Heights
plt.figure(figsize=(10, 6))
plt.plot(x_values, trash_heights, marker='o', label='Trash Height', color='red')
plt.title('Trash Height over Time')
plt.xlabel('Sample Index')
plt.ylabel('Trash Height (units)')
plt.grid()
plt.legend()
plt.show()

# 5. Trash Fill Percentages
plt.figure(figsize=(10, 6))
plt.plot(x_values, trash_fill_percentages, marker='o', label='Trash Fill Percentage', color='purple')
plt.title('Trash Fill Percentage over Time')
plt.xlabel('Sample Index')
plt.ylabel('Trash Fill Percentage (%)')
plt.grid()
plt.legend()
plt.show()

# 6. Light Indicators
plt.figure(figsize=(10, 6))
plt.plot(x_values, light_green, marker='o', label='Green Light', color='green')
plt.plot(x_values, light_yellow, marker='o', label='Yellow Light', color='yellow')
plt.plot(x_values, light_red, marker='o', label='Red Light', color='red')
plt.title('Light Indicators over Time')
plt.xlabel('Sample Index')
plt.ylabel('Light State (0=Off, 1=On)')
plt.grid()
plt.legend()
plt.show()
