// Global variable to store countdown interval ID, so it can be cleared.
let countdownInterval = null;

/**
 * Formats a given total number of milliseconds into a human-readable string
 * showing years, months, days, hours, minutes, and seconds.
 * Note: Years and months are approximate due to varying days in months/leap years.
 * For precise calendar differences (e.g., "exactly 1 year and 1 month"), more complex
 * date arithmetic involving Date objects would be needed, which is typically
 * beyond what's required for a general "time difference" display.
 * @param {number} totalMilliseconds - The total time difference in milliseconds.
 * @returns {string} - A formatted string of the time difference.
 */
function formatDifference(totalMilliseconds) {
    // Ensure the difference is non-negative for display purposes
    let remainingMs = Math.abs(totalMilliseconds);

    // Calculate seconds, minutes, hours, and days
    let seconds = Math.floor(remainingMs / 1000);
    remainingMs %= 1000;

    let minutes = Math.floor(seconds / 60);
    seconds %= 60;

    let hours = Math.floor(minutes / 60);
    minutes %= 60;

    let days = Math.floor(hours / 24);
    hours %= 24;

    // Approximate years and months based on average days to keep the logic simpler.
    // For precise calendar months/years, a different, more complex algorithm is needed.
    const approximateYears = Math.floor(days / 365.25); // Account for leap years
    days %= 365.25;

    const approximateMonths = Math.floor(days / 30.44); // Average days per month
    days %= 30.44;

    // Ensure all remaining parts are integers
    days = Math.floor(days);
    const displayYears = approximateYears;
    const displayMonths = approximateMonths;


    const parts = [];

    if (displayYears > 0) {
        parts.push(`${displayYears} year${displayYears !== 1 ? 's' : ''}`);
    }
    if (displayMonths > 0) {
        parts.push(`${displayMonths} month${displayMonths !== 1 ? 's' : ''}`);
    }
    if (days > 0) {
        parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    }
    if (hours > 0) {
        parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    }
    if (seconds > 0) {
        parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
    }

    if (parts.length === 0) {
        return "Less than a second."; // Or "No difference." depending on context
    }

    // Join parts with commas, and "and" before the last part if more than one.
    if (parts.length > 1) {
        const lastPart = parts.pop();
        return `${parts.join(', ')} and ${lastPart}.`;
    }
    return `${parts[0]}.`;
}


/**
 * Function to calculate the number of days between two dates.
 * It now provides a live countdown if the end date is in the future.
 */
function calculateDays() {
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('errorMessage');
    const calculateBtn = document.querySelector('.btn-calculate');

    // Store original button HTML for restoring its state
    const originalButtonHTML = calculateBtn.innerHTML;

    // Clear previous results and errors
    resultDiv.textContent = '';
    errorDiv.textContent = '';

    // Clear any existing live countdown interval to prevent multiple timers running
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null; // Reset the interval ID
    }

    // Validate if both dates are selected
    if (!startDateInput || !endDateInput) {
        errorDiv.textContent = 'Please select both start and end dates.';
        resultDiv.textContent = 'Enter two dates to see the difference.';
        return;
    }

    // Show spinner directly within the button and disable it
    calculateBtn.disabled = true;
    calculateBtn.innerHTML = '<span class="braille-spinner-icon"></span> Calculating...';

    // Simulate a delay for calculation (e.g., if it were an API call)
    setTimeout(() => {
        const startDate = new Date(startDateInput);
        const endDate = new Date(endDateInput);

        // Set hours, minutes, seconds, and milliseconds to 0 for initial date-only calculation
        // This ensures the fixed duration calculation is purely date-based
        const cleanStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const cleanEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());


        // Check if dates are valid
        if (isNaN(cleanStartDate.getTime()) || isNaN(cleanEndDate.getTime())) {
            errorDiv.textContent = 'Invalid date format. Please use a valid date.';
            resultDiv.textContent = 'Enter two dates to see the difference.';
            // Restore button state on error
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = originalButtonHTML;
            return;
        }

        // --- Determine the display logic (live countdown vs. static difference) ---
        const now = new Date(); // Get current time for live comparison
        // For date-only comparison with `endDate`, normalize `now` to start of day
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Check if the selected endDate is in the future relative to the current moment
        if (endDate.getTime() > now.getTime()) {
            // It's a future date, so start a live countdown
            resultDiv.innerHTML = 'Time remaining: <span id="countdownDisplay"></span>'; // Placeholder for live text
            const countdownDisplayElement = document.getElementById('countdownDisplay');

            countdownInterval = setInterval(() => {
                const currentTime = new Date();
                const remainingMs = endDate.getTime() - currentTime.getTime();

                if (remainingMs <= 0) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                    countdownDisplayElement.textContent = "Time's up! The end date has passed.";
                    // Re-enable button and restore text, as countdown is finished
                    calculateBtn.disabled = false;
                    calculateBtn.innerHTML = originalButtonHTML;
                } else {
                    countdownDisplayElement.textContent = formatDifference(remainingMs);
                }
            }, 1000); // Update every second

            // Re-enable button and restore original text immediately after starting countdown
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = originalButtonHTML;

        } else {
            // If the end date is in the past or today, show a fixed duration between the two selected dates.
            // Ensure calculation is always positive difference
            const totalDifferenceMs = Math.abs(cleanEndDate.getTime() - cleanStartDate.getTime());
            resultDiv.textContent = `The total difference is: ${formatDifference(totalDifferenceMs)}`;

            // Restore button state
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = originalButtonHTML;
        }
    }, 1500); // 1.5-second delay to simulate work/calculation startup
}

// You can add more JavaScript for navbar/footer loading if those files exist
// For example, if you have 'navbar.html' and 'footer.html':
/*
$(function() {
    $("#navbar-placeholder").load("navbar.html");
    $("#footer-placeholder").load("footer.html");
});
*/
