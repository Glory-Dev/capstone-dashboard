// Function to generate fake data
function generateGarbageBinData(startTime, numberOfEntries, intervalSeconds) {
    const data = [];
    const startTimestamp = new Date(startTime).getTime();

    for (let i = 0; i < numberOfEntries; i++) {
        const timestamp = new Date(startTimestamp + i * intervalSeconds * 1000).toISOString();
        data.push({
            time: timestamp,
            weight: (Math.random() * 5).toFixed(2), // Random weight between 0-5 kg
            height: (Math.random() * 8).toFixed(2), // Random height between 0-8 meters
            moisture: (Math.random() * 100).toFixed(2) // Random moisture percentage between 0-100%
        });
    }

    return data;
}

// Generate data starting at 10:00 AM, 1000 entries, 30-second intervals
const garbageBinData = generateGarbageBinData("2024-11-26T10:00:00", 100, 30);
const largeGarbageBinData = garbageBinData.slice(-50);

// Log or use the data
console.log(largeGarbageBinData);
