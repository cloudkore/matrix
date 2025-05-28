// js/uptime_display.js

function calculateUptime() {
    // Inception date
    var inceptionDate = new Date('2019-02-01T17:05:40');

    // Current date
    var currentDate = new Date();

    // Calculate the difference in milliseconds
    var timeDifference = currentDate - inceptionDate;

    // Calculate total seconds, minutes, hours
    var totalSeconds = Math.floor(timeDifference / 1000);
    var totalMinutes = Math.floor(totalSeconds / 60);
    var totalHours = Math.floor(totalMinutes / 60);

    // Calculate remaining seconds, minutes, hours
    var seconds = totalSeconds % 60;
    var minutes = totalMinutes % 60;
    var hours = totalHours % 24;

    // Calculate actual years and months based on calendar differences
    var inceptionYear = inceptionDate.getFullYear();
    var inceptionMonth = inceptionDate.getMonth();
    var inceptionDay = inceptionDate.getDate();

    var currentYear = currentDate.getFullYear();
    var currentMonth = currentDate.getMonth();
    var currentDay = currentDate.getDate();

    var years = currentYear - inceptionYear;
    var months = currentMonth - inceptionMonth;
    var days = currentDay - inceptionDay; // This is the remaining days for the display

    // Adjust months and years if current date is before inception date in the current year/month
    if (days < 0) {
        months--;
        // Get days in previous month
        var prevMonthDate = new Date(currentYear, currentMonth, 0); // Day 0 of current month gives last day of previous month
        days += prevMonthDate.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    // Format the uptime display
    var uptime = years + " years " + months + " months\n" + days + " days " + hours + " hours\n" + minutes + " minutes " + seconds + " seconds";

    // Update the element if it exists
    var uptimeElement = document.getElementById('ut');
    if (uptimeElement) {
        uptimeElement.innerText = uptime;
    } else {
        console.warn("Uptime element with ID 'ut' not found. Please ensure the HTML element exists.");
    }

    // Update the counter every second
    setTimeout(calculateUptime, 1000);
}

// Start the counter when the window loads
window.addEventListener('load', calculateUptime);
