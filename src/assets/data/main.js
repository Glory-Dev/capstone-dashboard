let massChart, heightChart, moistureValue; // Store chart instances
let moisturePercentageCircle, fillPercentageCircle; // Store circle chart instances

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

        const { ctx, chartArea } = chart;
        const { top, right } = chartArea;
        const boxWidth = 200;
        const boxHeight = 100;
        const margin = 10; // Adjust margin for more spacing

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

        // Draw the box at the top-right
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.fillRect(right - boxWidth - margin, top + margin, boxWidth, boxHeight);
        ctx.strokeRect(right - boxWidth - margin, top + margin, boxWidth, boxHeight);

        // Add text inside the box
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';

        const textX = right - boxWidth - margin + 10;
        const textY = top + margin + 20;

        ctx.fillText(title, textX, textY);
        ctx.fillText(`Mean: ${mean.toFixed(1)}`, textX, textY + 20);
        ctx.fillText(`Actual Value: ${actualValue.toFixed(1)}`, textX, textY + 40);
        ctx.fillText(`CV: ${coefficientOfVariation.toFixed(2)}%`, textX, textY + 60);

        ctx.restore();
    },
});

const updateCharts = () => {
    // fetch('https://glory-dev.github.io/capstone-dashboard/src/assets/data/sensor_data.json')
    fetch('./assets/data/sensor_data.json')
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
                        scales: { y: { beginAtZero: true, max: 5 } }
                    }
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
                        scales: { y: { beginAtZero: true, max: 20 } }
                    }
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
                        scales: { y: { beginAtZero: false, min:300, max: 600 } }
                    }
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


// Initial load and auto-update every 30 seconds
updateCharts();
setInterval(updateCharts, 10000);
