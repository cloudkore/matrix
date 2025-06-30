// Global variable to store countdown interval ID
let countdownInterval = null;

/**
 * Helper function to check if two dates fall on the same calendar day (ignoring time).
 * @param {Date} d1 - First date object.
 * @param {Date} d2 - Second date object.
 * @returns {boolean} True if dates are the same day, false otherwise.
 */
const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

/**
 * Formats the time difference using calendar-accurate logic (years, months, days, hours, minutes, seconds).
 * @param {Date} startDate - The earlier date.
 * @param {Date} endDate - The later date.
 * @returns {string} Human-readable difference string.
 */
function formatDifferenceAccurate(startDate, endDate) {
    let s = new Date(startDate.getTime());
    let e = new Date(endDate.getTime());

    // Ensure 's' is always the earlier date for correct calculation
    if (s.getTime() > e.getTime()) {
        [s, e] = [e, s];
    }

    let years = e.getFullYear() - s.getFullYear();
    let months = e.getMonth() - s.getMonth();
    let days = e.getDate() - s.getDate();
    let hours = e.getHours() - s.getHours();
    let minutes = e.getMinutes() - s.getMinutes();
    let seconds = e.getSeconds() - s.getSeconds();

    // Adjust negative values for time components
    if (seconds < 0) {
        seconds += 60;
        minutes--;
    }
    if (minutes < 0) {
        minutes += 60;
        hours--;
    }
    if (hours < 0) {
        hours += 24;
        days--;
    }
    // Adjust negative values for date components
    if (days < 0) {
        months--;
        const prevMonth = new Date(e.getFullYear(), e.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        months += 12;
        years--;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);

    if (parts.length === 0) return "Less than a second.";
    if (parts.length > 1) {
        const last = parts.pop();
        return parts.join(', ') + ' and ' + last + '.';
    }
    return parts[0] + '.';
}

/**
 * Formats the time difference in calendar-accurate years, months, and days only.
 * @param {Date} startDate - The earlier or later date.
 * @param {Date} endDate - The earlier or later date.
 * @returns {string} Human-readable difference string (years, months, days only).
 */
function formatDifferenceAccurateWithoutHoursMinutesSeconds(startDate, endDate) {
    let s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    let e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    // Ensure 's' is always the earlier date for correct calculation
    if (s.getTime() > e.getTime()) {
        [s, e] = [e, s]; // Swap if s is later than e
    }

    let years = e.getFullYear() - s.getFullYear();
    let months = e.getMonth() - s.getMonth();
    let days = e.getDate() - s.getDate();

    // Adjust negative values for date components
    if (days < 0) {
        months--;
        const prevMonth = new Date(e.getFullYear(), e.getMonth(), 0); // Last day of previous month
        days += prevMonth.getDate(); // Add days in previous month
    }
    if (months < 0) {
        months += 12;
        years--;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

    if (parts.length === 0) return "Less than a day.";
    if (parts.length > 1) {
        const last = parts.pop();
        return parts.join(', ') + ' and ' + last + '.';
    }
    return parts[0] + '.';
}


/**
 * Main date calculation function with live countdown support and refined display logic.
 */
function calculateDays() {
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('errorMessage');
    const calculateBtn = document.querySelector('.btn-calculate');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBarLabel = document.getElementById('progressBarLabel');
    const progressBarInner = document.getElementById('progressBarInner');

    const originalButtonHTML = calculateBtn.innerHTML;

    // Clear previous results, errors, and hide progress bar
    resultDiv.textContent = '';
    errorDiv.textContent = '';
    
    // Stop any existing countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    progressBarContainer.style.display = 'none'; // Hide progress bar by default
    progressBarInner.style.width = '0%'; // Reset progress bar visual

    if (!startDateInput || !endDateInput) {
        errorDiv.textContent = 'Please select both start and end dates.';
        resultDiv.textContent = 'Enter two dates to see the difference.';
        return;
    }

    calculateBtn.disabled = true;
    calculateBtn.innerHTML = '<span class="braille-spinner-icon"></span> Calculating...';

    // Delay calculation slightly for spinner to show, then run immediately without setTimeout around main logic
    setTimeout(() => {
        const startDate = new Date(startDateInput);
        const endDate = new Date(endDateInput);
        const now = new Date(); // Current date and time

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            errorDiv.textContent = 'Invalid date format. Please use a valid date.';
            resultDiv.textContent = 'Enter two dates to see the difference.';
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = originalButtonHTML;
            return;
        }

        // --- Progress Bar Logic Helper Function ---
        const updateProgressBar = (periodStart, periodEnd, currentTimePoint) => {
            let actualPeriodStart = new Date(periodStart.getTime());
            let actualPeriodEnd = new Date(periodEnd.getTime());

            if (actualPeriodStart.getTime() >= actualPeriodEnd.getTime()) {
                progressBarInner.style.width = '0%';
                progressBarLabel.textContent = 'Progress: N/A (Invalid Period)';
                progressBarContainer.style.display = 'block';
                return;
            }

            const totalDurationMs = actualPeriodEnd.getTime() - actualPeriodStart.getTime();
            const elapsedMs = currentTimePoint.getTime() - actualPeriodStart.getTime();

            let progressPercentage = (elapsedMs / totalDurationMs) * 100;

            if (progressPercentage > 100) progressPercentage = 100;
            if (progressPercentage < 0) progressPercentage = 0;

            let displayPercentageText;
            if (progressPercentage > 0 && progressPercentage < 0.01) {
                displayPercentageText = "< 0.01"; // For extremely small non-zero progress
            } else {
                displayPercentageText = progressPercentage.toFixed(2);
            }

            progressBarInner.style.width = `${progressPercentage.toFixed(2)}%`;
            progressBarLabel.textContent = `Progress: ${displayPercentageText}%`;
            progressBarContainer.style.display = 'block';
        };

        const isStartDateToday = isSameDay(startDate, now);
        const isEndDateToday = isSameDay(endDate, now);
        // Check relative time positions (full date-time comparison)
        const isStartDatePast = startDate.getTime() < now.getTime();
        const isEndDateFuture = endDate.getTime() > now.getTime();

        // --- Conditional Display Logic ---
        if (isStartDateToday && isEndDateFuture) {
            // Scenario 1: Start is TODAY, End is FUTURE (Live Countdown + Progress)
            resultDiv.innerHTML = 'Time remaining: <span id="countdownDisplay"></span>';
            const countdownDisplayElement = document.getElementById('countdownDisplay');

            // Initial progress bar update
            updateProgressBar(startDate, endDate, now);

            countdownInterval = setInterval(() => {
                const currentTime = new Date();
                if (endDate.getTime() <= currentTime.getTime()) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                    countdownDisplayElement.textContent = "Time's up! The end date has passed.";
                    progressBarInner.style.width = '100%';
                    progressBarLabel.textContent = 'Progress: 100% (Completed)';
                    calculateBtn.disabled = false;
                    calculateBtn.innerHTML = originalButtonHTML;
                } else {
                    countdownDisplayElement.textContent = formatDifferenceAccurate(currentTime, endDate);
                    updateProgressBar(startDate, endDate, currentTime);
                }
            }, 1000);

        } else if (isStartDatePast && isEndDateToday) {
            // Scenario 2: Start is PAST, End is TODAY (Static Time Lapsed + Progress)
            resultDiv.textContent = `Time lapsed: ${formatDifferenceAccurate(startDate, now)}`;
            updateProgressBar(startDate, now, now);

        } else {
            // All other scenarios: Static Months/Days, NO Progress Bar
            // This covers:
            // - Start Past, End Future (your 20/06/2025 to 23/07/2025 example)
            // - Start Future, End Future (your 01/07/2025 to 31/07/2025 example, where 'now' isn't involved)
            // - Both Start & End in the Past
            // - Start & End are the Same Date (anywhere in time)
            resultDiv.textContent = `Total difference: ${formatDifferenceAccurateWithoutHoursMinutesSeconds(startDate, endDate)}`;
            progressBarContainer.style.display = 'none'; // Ensure progress bar is hidden

        }

        // Reset button state after all logic branches
        calculateBtn.disabled = false;
        calculateBtn.innerHTML = originalButtonHTML;
    }, 1000); // Small delay for visual feedback before calculation completes
}