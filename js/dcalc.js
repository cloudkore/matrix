// Global variable to store countdown interval ID
let countdownInterval = null;

/**
 * Formats the time difference using calendar-accurate logic.
 * @param {Date} startDate - The earlier date
 * @param {Date} endDate - The later date
 * @returns {string} Human-readable difference string
 */
function formatDifferenceAccurate(startDate, endDate) {
    if (startDate > endDate) [startDate, endDate] = [endDate, startDate];

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();
    let hours = endDate.getHours() - startDate.getHours();
    let minutes = endDate.getMinutes() - startDate.getMinutes();
    let seconds = endDate.getSeconds() - startDate.getSeconds();

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
    if (days < 0) {
        months--;
        const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
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
 * Main date calculation function with live countdown support
 */
function calculateDays() {
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('errorMessage');
    const calculateBtn = document.querySelector('.btn-calculate');
    const originalButtonHTML = calculateBtn.innerHTML;

    resultDiv.textContent = '';
    errorDiv.textContent = '';

    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    if (!startDateInput || !endDateInput) {
        errorDiv.textContent = 'Please select both start and end dates.';
        resultDiv.textContent = 'Enter two dates to see the difference.';
        return;
    }

    calculateBtn.disabled = true;
    calculateBtn.innerHTML = '<span class="braille-spinner-icon"></span> Calculating...';

    setTimeout(() => {
        const startDate = new Date(startDateInput);
        const endDate = new Date(endDateInput);
        const now = new Date();

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            errorDiv.textContent = 'Invalid date format. Please use a valid date.';
            resultDiv.textContent = 'Enter two dates to see the difference.';
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = originalButtonHTML;
            return;
        }

        if (endDate.getTime() > now.getTime()) {
            resultDiv.innerHTML = 'Time remaining: <span id="countdownDisplay"></span>';
            const countdownDisplayElement = document.getElementById('countdownDisplay');

            countdownInterval = setInterval(() => {
                const currentTime = new Date();
                if (endDate.getTime() <= currentTime.getTime()) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                    countdownDisplayElement.textContent = "Time's up! The end date has passed.";
                    calculateBtn.disabled = false;
                    calculateBtn.innerHTML = originalButtonHTML;
                } else {
                    countdownDisplayElement.textContent = formatDifferenceAccurate(currentTime, endDate);
                }
            }, 1000);

            calculateBtn.disabled = false;
            calculateBtn.innerHTML = originalButtonHTML;
        }
        else if (
            endDate.toDateString() === now.toDateString() &&
            startDate.getTime() < now.getTime()
        ) {
            resultDiv.textContent = `Time lapsed: ${formatDifferenceAccurate(startDate, now)}`;
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = originalButtonHTML;
        }
        else {
            resultDiv.textContent = `Time lapsed: ${formatDifferenceAccurate(startDate, endDate)}`;
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = originalButtonHTML;
        }
    }, 1500);
}