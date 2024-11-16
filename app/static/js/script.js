/** CLOCK HANDLER */
/**
 * Clock update handler
 */
function updateClock() {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString();
    document.getElementById('realtime-clock').textContent = formattedTime;
}
setInterval(updateClock, 1000);
updateClock();

/** FUNCTION */
/**
 * Get location function
 */
function getLocation() {
    const location = document.getElementById('location').value;
    return location;
}

/** EVENT LISTENER */
/**
 * Event listener
 */
document.addEventListener('DOMContentLoaded', function () {
    /**
     *  Update subscription if location changes
     */
    document.getElementById('location').addEventListener('change', function() {
        const location = getLocation();
        console.log("Location Changed: " + location);
        updateSubscription(getLocation());
    });

    /**
     *  Graph update function
     */
    document.getElementById('update-button').addEventListener('click', function () {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        console.log(`Start Date: ${startDate}, End Date: ${endDate}`);
        alert(`Data updated with Start Date: ${startDate} and End Date: ${endDate}`);
        
        if (!startDate || !endDate) {
            alert("Start Date and End Date must be filled!");
            return;
        }

        const startDateTime = `${startDate}%2020:00:00`;
        const endDateTime = `${endDate}%2023:59:59`;

        const apiUrl = `/api/fetch_data?startdate=${startDateTime}&enddate=${endDateTime}`;
        
        renderChart(apiUrl);
    });
});

/** MQTT HANDLER */
/**
 *  MQTT clientid, host (broker), port, and topic initialization
 */
const clientId = "client-" + Math.random().toString(16).substr(2, 8);
const host = "mqtt.eclipseprojects.io";
const port = 80; // WebSocket Port
let currentTopic = "";

/**
 *  Setup MQTT connection
 */
const client = new Paho.MQTT.Client(host, port, clientId);

/**
 *  Display connection status
 */
const statusDisplay = document.getElementById("status");

/**
 *  Connection callback
 */
client.connect({
    onSuccess: onConnect,
    onFailure: onFailure,
});

/**
 *  Subscription update
 */
function updateSubscription(location) {
    const newTopic = `evomo/final_data/${location}`;
    
    /**
     *   Unsubscribe previous topic
     */
    if (currentTopic) {
        console.log(`Unsubscribing from topic: ${currentTopic}`);
        client.unsubscribe(currentTopic);
    }
    
    /**
     *  Subscribe to new topic
     */
    console.log(`Subscribing to topic: ${newTopic}`);
    client.subscribe(newTopic, {qos: 2});
    currentTopic = newTopic; // Perbarui topik saat ini
}

/**
 *  MQTT connect callback 
 */
function onConnect() {
    statusDisplay.textContent = "Connected to broker";
    console.log("Connected to broker");
    const initialLocation = getLocation();
    updateSubscription(initialLocation);
}

/**
 *  MQTT failed to connect callback 
 */
function onFailure(error) {
    statusDisplay.textContent = "Failed to connect: " + error.errorMessage;
}

/**
 *  Previous energy data
 */
let previousEnergyData = {
    active_energy_import: null,
    active_energy_export: null,
    reactive_energy_import: null,
    reactive_energy_export: null,
    apparent_energy_import: null,
    apparent_energy_export: null
};

/**
 *  Message handler callback
 */
client.onMessageArrived = function(message) {
    try {
        /**
         *  JSON parser
         */
        const data = JSON.parse(message.payloadString);

        /**
         *  Update metrics
         */
        document.getElementById("meter_type").textContent = `${data.meter_type}`;
        document.getElementById("serial_number").textContent = `${data.meter_serial_number}`;
        document.getElementById("active_energy_import").textContent = `${data.active_energy_import}`;
        document.getElementById("active_energy_export").textContent = `${data.active_energy_export}`;
        document.getElementById("reactive_energy_import").textContent = `${data.reactive_energy_import}`;
        document.getElementById("reactive_energy_export").textContent = `${data.reactive_energy_export}`;
        document.getElementById("apparent_energy_import").textContent = `${data.apparent_energy_import}`;
        document.getElementById("apparent_energy_export").textContent = `${data.apparent_energy_export}`;
        
        /**
         *  Update reading time
         */
        const readingTimeElements = Array.from(document.getElementsByClassName("reading_time"));
        readingTimeElements.forEach(element => {
            element.textContent = `Reading Time: ${data.reading_time}`;
        });

        /**
         *  Update bar color indicator
         */
        function updateBarColor(metric, currentValue) {
            const barElement = Array.from(document.getElementsByClassName(`${metric}_bar`));
            const previousValue = previousEnergyData[metric];
            
            if (previousValue !== null) {
                if (currentValue > previousValue) {
                    barElement.forEach(element => {
                        element.style.backgroundColor = '#ff531a';
                    });            
                } else if (currentValue < previousValue) {
                    barElement.forEach(element => {
                        element.style.backgroundColor = '#33ff33';
                    });       
                } else {
                    barElement.forEach(element => {
                        element.style.backgroundColor = 'gray';
                    });       
                }
            }
            previousEnergyData[metric] = currentValue;
        }

        updateBarColor("active_energy_import", data.active_energy_import);
        updateBarColor("active_energy_export", data.active_energy_export);
        updateBarColor("reactive_energy_import", data.reactive_energy_import);
        updateBarColor("reactive_energy_export", data.reactive_energy_export);
        updateBarColor("apparent_energy_import", data.apparent_energy_import);
        updateBarColor("apparent_energy_export", data.apparent_energy_export);

    } catch (e) {
        console.error("Failed to parse JSON", e);
    }
};

/**
 *  MQTT connection lost handler
 */
client.onConnectionLost = function(responseObject) {
    if (responseObject.errorCode !== 0) {
        statusDisplay.textContent = "Connection lost: " + responseObject.errorMessage;
    }
};

/** CHART HANDLER*/
/**
 *  Chart variable
 */
let currentChart = null

/**
 *  Fetch JSON data
 */
async function fetchData(url_api) {
    try {
        const response = await fetch(url_api);
        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

/**
 *  Time converter
 */
function convertUnixToTime(unixTimestamp) {
    const date = new Date(unixTimestamp);
    return date.toLocaleTimeString();
}

/**
 *  Render chart function
 */
async function renderChart(url_api) {
    const data = await fetchData(url_api);
    if (data.length === 0) {
        console.error("No data available to display chart.");
        return;
    }

    // Filter data based on location
    const filteredData = data.filter(point => point.position == getLocation().slice(-1).toUpperCase());

    if (filteredData.length === 0) {
        console.error(`No data available for location: ${getLocation().slice(-1).toUpperCase()}`);
        return;
    }

    const timeLabels = filteredData.map(point => convertUnixToTime(point.reading_time));
    const activeImportValue = filteredData.map(point => point.active_energy_import);

    const ctx = document.getElementById('active_energy_import_chart').getContext('2d');

    if (currentChart) {
        currentChart.destroy();
    }

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Energy (kWh)',
                data: activeImportValue,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                x: {
                    title: { display: true, text: 'Time' }
                },
                y: {
                    title: { display: true, text: 'active_energy_import_chart (kWh)' },
                    beginAtZero: true
                }
            }
        }
    });
}
