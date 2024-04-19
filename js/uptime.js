function calculateUptime() {
    // Inception date
    var inceptionDate = new Date('2019-02-01T17:05:40');

    // Current date
    var currentDate = new Date();

    // Calculate the difference in milliseconds
    var timeDifference = currentDate - inceptionDate;

    // Convert milliseconds to years, months, days, hours, minutes, and seconds
    var seconds = Math.floor(timeDifference / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);
    var months = Math.floor(days / 30.44); // Average number of days in a month
    var years = Math.floor(months / 12);

    // Calculate remaining time
    seconds %= 60;
    minutes %= 60;
    hours %= 24;
    days %= 30.44; // Average number of days in a month
    months %= 12;

    // Format the uptime display
    var uptime = years + " years " + months + " months\n" + Math.floor(days) + " days " + hours + " hours\n" + minutes + " minutes " + seconds + " seconds";
    document.getElementById('uptime').innerText = uptime;

    // Update the counter every second
    setTimeout(calculateUptime, 1000);
}

// Start the counter
calculateUptime();