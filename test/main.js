let weightChart, heightChart, moistureChart; // Store chart instances

const updateCharts = () => {
    fetch('sensor_data.json')
        .then(response => response.json())
        .then(largeGarbageBinData => {
            // Extract time, weight, height, and moisture
            const labels = largeGarbageBinData.map(entry => new Date(entry.time).toLocaleTimeString());
            const weightData = largeGarbageBinData.map(entry => parseFloat(entry.weight));
            const heightData = largeGarbageBinData.map(entry => parseFloat(entry.height));
            const moistureData = largeGarbageBinData.map(entry => parseFloat(entry.moisture));

            // Update Weight Chart
            if (weightChart) {
                weightChart.data.labels = labels;
                weightChart.data.datasets[0].data = weightData;
                weightChart.update(); // Update the chart
            } else {
                const weightCtx = document.getElementById("weightChart").getContext("2d");
                weightChart = new Chart(weightCtx, {
                    type: "line",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Weight of Waste (kg)",
                            data: weightData,
                            backgroundColor: "rgba(54, 162, 235, 0.2)",
                            borderColor: "rgba(54, 162, 235, 1)",
                            borderWidth: 1,
                            pointRadius: 0,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: { y: { beginAtZero: true, max: 5 } }
                    }
                });
            }

            // Update Height Chart
            if (heightChart) {
                heightChart.data.labels = labels;
                heightChart.data.datasets[0].data = heightData;
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
                            borderWidth: 1,
                            pointRadius: 0,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: { y: { beginAtZero: true, max: 8 } }
                    }
                });
            }

            // Update Moisture Chart
            if (moistureChart) {
                moistureChart.data.labels = labels;
                moistureChart.data.datasets[0].data = moistureData;
                moistureChart.update();
            } else {
                const moistureCtx = document.getElementById("moistureChart").getContext("2d");
                moistureChart = new Chart(moistureCtx, {
                    type: "line",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Moisture (%)",
                            data: moistureData,
                            backgroundColor: "rgba(75, 192, 192, 0.2)",
                            borderColor: "rgba(75, 192, 192, 1)",
                            borderWidth: 1,
                            pointRadius: 0,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: { y: { beginAtZero: true, max: 100 } }
                    }
                });
            }
        })
        .then(() => {
            console.log("updates")
        })
        .catch(error => console.error("Error fetching the JSON data:", error));
};

// Initial load and auto-update every 30 seconds
updateCharts(); // Initial call
setInterval(updateCharts, 30000); // Update every 30 seconds
