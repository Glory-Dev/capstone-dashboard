let massChart, heightChart, moistureValue, predictedChart; // Store chart instances
let moisturePercentageCircle, fillPercentageCircle; // Store circle chart instances
const filePath = './assets/data/sensor_data.json'; // Replace with the actual path or URL

// Plugin to add a percentage label inside doughnut charts
Chart.register({
    id: 'centerLabelPlugin',
    beforeDraw(chart) {
        const applicableCharts = ['moisturePercentageCircle', 'fillPercentageCircle'];
        if (!applicableCharts.includes(chart.canvas.id)) return;

        const { width, height, ctx } = chart;
        const percentage = chart.data.datasets[0].data[0]; // Get the percentage
        const color = chart.data.datasets[0].backgroundColor[0]; // Get the circle color
        const label = chart.data.labels[0]; // Get the label (title)

        const fontSizePercentage = (height / 100) * 15; // Font size for the percentage
        const fontSizeLabel = (height / 100) * 8; // Font size for the label
        const centerY = height / 2; // Chart center Y-coordinate

        ctx.save();

        // Draw the percentage
        ctx.font = `${fontSizePercentage}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color; // Set the color to match the circle
        ctx.fillText(`${percentage}%`, width / 2, centerY - fontSizeLabel);

        // Draw the label (title) below the percentage
        ctx.font = `${fontSizeLabel}px Arial`;
        ctx.fillStyle = '#666'; // A slightly darker neutral color for the title
        ctx.fillText(label, width / 2, centerY + fontSizeLabel);

        ctx.restore();
    }
});

// Plugin to add a legend box
Chart.register({
    id: 'customLegendBoxPlugin',
    afterDraw(chart) {
        const applicableCharts = ['massChart', 'heightChart', "moistureValue"];
        if (!applicableCharts.includes(chart.canvas.id)) return;

        const { ctx, chartArea, canvas } = chart;
        const { top, right, width } = chartArea;
        const boxWidth = 230;
        const boxHeight = 100;
        const margin = 10; // Adjust margin for spacing between the box and the chart

        let title = '';
        let mean = 0;
        let actualValue = 0;
        let coefficientOfVariation = 0;

        if (chart.canvas.id === 'massChart') {
            title = 'Mass Chart';
            mean = chart.data.datasets[0].data.reduce((a, b) => a + b, 0) / chart.data.datasets[0].data.length;
            actualValue = chart.data.datasets[0].data[chart.data.datasets[0].data.length - 1];
            coefficientOfVariation = ((actualValue - mean) / mean) * 100;
        } else if (chart.canvas.id === 'heightChart') {
            title = 'Height Chart';
            mean = chart.data.datasets[0].data.reduce((a, b) => a + b, 0) / chart.data.datasets[0].data.length;
            actualValue = chart.data.datasets[0].data[chart.data.datasets[0].data.length - 1];
            coefficientOfVariation = ((actualValue - mean) / mean) * 100;
        } else if (chart.canvas.id === 'moistureValue') {
            title = 'Moisture Chart';
            mean = chart.data.datasets[0].data.reduce((a, b) => a + b, 0) / chart.data.datasets[0].data.length;
            actualValue = chart.data.datasets[0].data[chart.data.datasets[0].data.length - 1];
            coefficientOfVariation = ((actualValue - mean) / mean) * 100;
        }
        // Draw the box above the chart
        const boxX = right - (width / 3) ; // Positioned Right
        const boxY = top - boxHeight - margin; // Positioned above the chart area

        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Add text inside the box
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';

        const textX = boxX + 10;
        const textY = boxY + 20;

        ctx.fillText(title, textX, textY);
        ctx.fillText(`Mean: ${mean.toFixed(1)}`, textX, textY + 20);
        ctx.fillText(`Actual Value: ${actualValue.toFixed(1)}`, textX, textY + 40);
        ctx.fillText(`Coefficient of Variation: ${coefficientOfVariation.toFixed(2)}%`, textX, textY + 60);

        ctx.restore();
    },
});

// Horizontal line => Thershold
const horizontalLinePlugin = {
    id: 'horizontalLinePlugin',
    beforeDraw(chart, args, options) {
        const { ctx, chartArea, scales } = chart;
        const { left, right } = chartArea;
        const yScale = scales.y;

        // Get the pixel position for the threshold value
        const yPosition = yScale.getPixelForValue(options.yValue);

        // Draw the horizontal line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(left, yPosition);
        ctx.lineTo(right, yPosition);
        ctx.strokeStyle = options.color || 'red'; // Default line color is red
        ctx.lineWidth = options.lineWidth || 2; // Default line width is 2
        ctx.stroke();
        ctx.restore();
    }
};

const updateCharts = () => {
    // fetch('https://glory-dev.github.io/capstone-dashboard/src/assets/data/sensor_data.json')
    fetch(filePath)
        .then(response => response.json())
        .then(data => {
            // Use only the last 15 data entries
            const recentData = data.slice(-15);

            // Extract data
            const labels = recentData.map(entry => new Date(entry.time).toLocaleTimeString());
            const massData = recentData.map(entry => parseFloat(entry.mass));
            const heightData = recentData.map(entry => parseFloat(entry.height));
            const moistureAnalogData = recentData.map(entry => parseFloat(entry.moisture_analog_value));

            // Last values for circular charts
            const lastEntry = recentData[recentData.length - 1];
            const moisturePercentage = parseFloat(lastEntry.moisture_percentage);
            const fillPercentage = parseFloat(lastEntry.fill_percentage);

            // Mass Vlaue
            const massValue = document.getElementById("massValue");
            massValue.innerHTML = `${massData[massData.length - 1]} kg`;


            // Update Mass Chart with circles at points
            if (massChart) {
                massChart.data.labels.push(labels[labels.length - 1]);
                massChart.data.datasets[0].data.push(massData[massData.length - 1]);

                if (massChart.data.labels.length > 15) {
                    massChart.data.labels.shift();
                    massChart.data.datasets[0].data.shift();
                }
                massChart.update();
            } else {
                const massCtx = document.getElementById("massChart").getContext("2d");
                massChart = new Chart(massCtx, {
                    type: "line",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Mass (kg)",
                            data: massData,
                            backgroundColor: "rgba(54, 162, 235, 0.2)",
                            borderColor: "rgba(54, 162, 235, 1)",
                            borderWidth: 1,
                            pointRadius: 5, // Increase point radius
                            pointStyle: 'circle', // Circle shape
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: { y: { beginAtZero: true, max: 7 } },
                        layout: {
                            padding: {
                                top: 80
                            }
                        },
                        plugins: {
                        horizontalLinePlugin: {
                            yValue: 5, // Threshold for mass
                            lineWidth: 1 // Line width
                        }
                    }
                    },
                    plugins: [horizontalLinePlugin] // Add the plugin here
                });
            }

            // Update Height Chart with circles at points
            if (heightChart) {
                heightChart.data.labels.push(labels[labels.length - 1]);
                heightChart.data.datasets[0].data.push(heightData[heightData.length - 1]);

                if (heightChart.data.labels.length > 15) {
                    heightChart.data.labels.shift();
                    heightChart.data.datasets[0].data.shift();
                }
                heightChart.update();
            } else {
                const heightCtx = document.getElementById("heightChart").getContext("2d");
                heightChart = new Chart(heightCtx, {
                    type: "line",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Height of Waste (m)",
                            data: heightData,
                            backgroundColor: "rgba(255, 99, 132, 0.2)",
                            borderColor: "rgba(255, 99, 132, 1)",
                            borderWidth: 2,
                            pointRadius: 5, // Increase point radius
                            pointStyle: 'circle', // Circle shape
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: { y: { beginAtZero: true, max: 25 } },
                        layout: {
                            padding: {
                                top: 80
                            }
                        },
                        plugins: {
                            horizontalLinePlugin: {
                                yValue: 20, // Threshold for mass
                                lineWidth: 1 // Line width
                            }
                        }
                    },
                    plugins: [horizontalLinePlugin] // Add the plugin here
                });
            }

            // Update Moisture Analog Chart with circles at points
            if (moistureValue) {
                moistureValue.data.labels.push(labels[labels.length - 1]);
                moistureValue.data.datasets[0].data.push(moistureAnalogData[moistureAnalogData.length - 1]);

                if (moistureValue.data.labels.length > 15) {
                    moistureValue.data.labels.shift();
                    moistureValue.data.datasets[0].data.shift();
                }
                moistureValue.update();
            } else {
                const moistureCtx = document.getElementById("moistureValue").getContext("2d");
                moistureValue = new Chart(moistureCtx, {
                    type: "line",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Moisture Analog Value",
                            data: moistureAnalogData,
                            backgroundColor: "rgba(75, 192, 192, 0.2)",
                            borderColor: "rgba(75, 192, 192, 1)",
                            borderWidth: 1,
                            pointRadius: 5, // Increase point radius
                            pointStyle: 'circle', // Circle shape
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: { y: { beginAtZero: false, min:300, max:750 } },
                        layout: {
                            padding: {
                                top: 80
                            }
                        },
                        plugins: {
                            horizontalLinePlugin: {
                                yValue: 600, // Threshold for mass
                                lineWidth: 1 // Line width
                            }
                        }
                    },
                    plugins: [horizontalLinePlugin] // Add the plugin here

                });
            }

            // Update Moisture Percentage Circle
            const moisturePercentageCtx = document.getElementById("moisturePercentageCircle").getContext("2d");
            if (moisturePercentageCircle) {
                moisturePercentageCircle.data.datasets[0].data = [moisturePercentage, 100 - moisturePercentage];
                moisturePercentageCircle.update();
            } else {
                moisturePercentageCircle = new Chart(moisturePercentageCtx, {
                    type: "doughnut",
                    data: {
                        labels: ["Moisture (%)", "Remaining"],
                        datasets: [{
                            data: [moisturePercentage, 100 - moisturePercentage],
                            backgroundColor: ["rgba(75, 192, 192, 1)", "rgba(200, 200, 200, 0.25)"],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        cutout: "80%",
                        plugins: {
                            centerLabelPlugin: true
                        }
                    }
                });
            }

            // Update Fill Percentage Circle
            const fillPercentageCtx = document.getElementById("fillPercentageCircle").getContext("2d");
            if (fillPercentageCircle) {
                fillPercentageCircle.data.datasets[0].data = [fillPercentage, 100 - fillPercentage];
                fillPercentageCircle.update();
            } else {
                fillPercentageCircle = new Chart(fillPercentageCtx, {
                    type: "doughnut",
                    data: {
                        labels: ["Fill (%)", "Remaining"],
                        datasets: [{
                            data: [fillPercentage, 100 - fillPercentage],
                            backgroundColor: ["rgba(255, 159, 64, 1)", "rgba(200, 200, 200, 0.25)"],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        cutout: "80%",
                        plugins: {
                            centerLabelPlugin: true
                        }
                    }
                });
            }
        })
};

async function calculateEmptyingTimeFromFile(filePath, thresholdHeight = 14) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Error fetching the JSON file: ${response.statusText}`);
        }

        const data = await response.json();
        return calculateEmptyingTime(data, thresholdHeight);
    } catch (error) {
        console.error("An error occurred:", error.message);
        return "Unable to calculate emptying time.";
    }
}

function calculateEmptyingTime(data, thresholdHeight = 17) {
    let startTime = null; // Time when the height exceeds the threshold
    let endTime = null;   // Time when the height drops to <= 2 cm

    for (let entry of data) {
        const { time, height } = entry;

        if (height <= 3) {
            // Record the time when the height drops to <= 2 cm
            startTime = new Date(time);
        }

        if (height >= thresholdHeight) {
            // Record the time when the height first exceeds the threshold
            endTime = new Date(time);
            break; // Exit the loop as we found both start and end times
        }
    }

    if (startTime && endTime) {
    fetch(filePath)
        .then(response => response.json())
        .then(data => {
            // Filter the data based on time range
            const filteredData = data.filter(entry => {
                const entryTime = new Date(entry.time);
                return entryTime >= startTime && entryTime <= endTime;
            });

            // Extract the height values and time labels
            const heights = filteredData.map(entry => entry.height);
            const labels = filteredData.map(entry => {
                const date = new Date(entry.time);
                return date.toLocaleString(); // Format the time as a readable string
            });

            // Create the graph
            const ctx = document.getElementById('predictedChart').getContext('2d');
            new Chart(ctx, {
                type: 'line', // You can choose 'bar', 'line', etc.
                data: {
                    labels: labels, // Time values on the x-axis
                    datasets: [{
                        label: 'Height',
                        data: heights,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            type: 'category',
                            title: {
                                display: true,
                                text: 'Time'
                            },
                            ticks: {
                                minRotation: 0, // Rotate labels vertically
                                maxRotation: 0
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Height'
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));


        const duration = (endTime - startTime) / (1000 * 60 * 60); // Duration in hours
        return `Time taken for bin to be emptied: <b>${duration} hours.</b>`;
    } else {
        return "The conditions were not met (threshold height exceeded and returned to <= 3 cm).";
    }
}


// Initial load and auto-update every 30 seconds
updateCharts();
setInterval(updateCharts, 10000);

// 
calculateEmptyingTimeFromFile(filePath, 14)
    .then(result => predictionTime.innerHTML = result)
    .catch(error => console.error("Error:", error));