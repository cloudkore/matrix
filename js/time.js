// JavaScript code which tells Live Time and Network Ping Load Time

function updateDateTimeAndNetworkPing() {
    // Get the current date and time
    const now = new Date();

    // Format the date and time
    const formattedDateTime = now.toLocaleString();

    // Display the date and time in the 'datetime' element
    const datetimeElement = document.getElementById('datetime');
    if (datetimeElement) {
        datetimeElement.innerText = `${formattedDateTime}`;
    }

    // Simulate a network ping load time (replace with actual server endpoint)
    const pingTime = Math.random() * 1000;

    // Display the network ping time in the 'network-ping' element
    const networkPingElement = document.getElementById('network-ping');
    if (networkPingElement) {
        networkPingElement.innerText = `Ping: ${pingTime.toFixed(2)} ms`;
    }

    // Update the network ping time every second (adjust the interval as needed)
    setTimeout(updateDateTimeAndNetworkPing, 1000);
}

// Update the date, time, and network ping time when the page loads
window.onload = updateDateTimeAndNetworkPing;
