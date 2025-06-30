let countdownInterval = null;

const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

function formatDifferenceAccurate(startDate, endDate) {
    let s = new Date(startDate.getTime());
    let e = new Date(endDate.getTime());

    if (s.getTime() > e.getTime()) {
        [s, e] = [e, s];
    }

    let years = e.getFullYear() - s.getFullYear();
    let months = e.getMonth() - s.getMonth();
    let days = e.getDate() - s.getDate();
    let hours = e.getHours() - s.getHours();
    let minutes = e.getMinutes() - s.getMinutes();
    let seconds = e.getSeconds() - s.getSeconds();

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

function formatDifferenceAccurateWithoutHoursMinutesSeconds(startDate, endDate) {
    let s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    let e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    if (s.getTime() > e.getTime()) {
        [s, e] = [e, s];
    }

    let years = e.getFullYear() - s.getFullYear();
    let months = e.getMonth() - s.getMonth();
    let days = e.getDate() - s.getDate();

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

    if (parts.length === 0) return "Less than a day.";
    if (parts.length > 1) {
        const last = parts.pop();
        return parts.join(', ') + ' and ' + last + '.';
    }
    return parts[0] + '.';
}


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

    resultDiv.textContent = '';
    errorDiv.textContent = '';
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    progressBarContainer.style.display = 'none';
    progressBarInner.style.width = '0%';

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

        // Fix Option 2: Always zero the time for both input dates
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            errorDiv.textContent = 'Invalid date format. Please use a valid date.';
            resultDiv.textContent = 'Enter two dates to see the difference.';
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = originalButtonHTML;
            return;
        }

        if (startDate.getTime() > endDate.getTime()) {
            errorDiv.textContent = 'Error: Start Date cannot be after End Date.';
            resultDiv.textContent = 'Please correct your date selection.';
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = originalButtonHTML;
            return;
        }

        if (startDate.getTime() === endDate.getTime()) {
            resultDiv.textContent = 'The dates are the same: 0 days.';
            progressBarContainer.style.display = 'none';
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = originalButtonHTML;
            return;
        }

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
                displayPercentageText = "< 0.01";
            } else {
                displayPercentageText = progressPercentage.toFixed(2);
            }

            progressBarInner.style.width = `${progressPercentage.toFixed(2)}%`;
            progressBarLabel.textContent = `Progress: ${displayPercentageText}%`;
            progressBarContainer.style.display = 'block';
        };

        const isStartDateToday = isSameDay(startDate, now);
        const isEndDateToday = isSameDay(endDate, now);
        const isStartDatePast = startDate.getTime() < now.getTime();
        const isEndDateFuture = endDate.getTime() > now.getTime();
        const isStartDateFuture = startDate.getTime() > now.getTime();

        if (isStartDateToday && isEndDateFuture) {
            // Scenario 1: Start is TODAY, End is FUTURE (Live Countdown + Progress Bar)
            resultDiv.innerHTML = 'Time remaining: <span id="countdownDisplay"></span>';
            const countdownDisplayElement = document.getElementById('countdownDisplay');

            updateProgressBar(startDate, endDate, now);

            countdownInterval = setInterval(() => {
                const currentTime = new Date();
                const currentCountdownDisplayElement = document.getElementById('countdownDisplay');
                if (!currentCountdownDisplayElement) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                    return;
                }

                if (endDate.getTime() <= currentTime.getTime()) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                    currentCountdownDisplayElement.textContent = "Time's up! The end date has passed.";
                    progressBarInner.style.width = '100%';
                    progressBarLabel.textContent = 'Progress: 100% (Completed)';
                    calculateBtn.disabled = false;
                    calculateBtn.innerHTML = originalButtonHTML;
                } else {
                    currentCountdownDisplayElement.textContent = formatDifferenceAccurate(currentTime, endDate);
                    updateProgressBar(startDate, endDate, currentTime);
                }
            }, 1000);

        } else if (isStartDatePast && isEndDateFuture) {
            // Scenario 2: Start is PAST, End is FUTURE (Static "Total difference" in months/days + Progress Bar)
            resultDiv.textContent = `Total difference: ${formatDifferenceAccurateWithoutHoursMinutesSeconds(startDate, endDate)}`;
            updateProgressBar(startDate, endDate, now);

        } else {
            // All other scenarios: Static text, NO Progress Bar
            progressBarContainer.style.display = 'none';

            if (isStartDatePast && isEndDateToday) {
                // Scenario 3: Start is PAST, End is TODAY (Static "Time lapsed" in full detail, no progress bar)
                resultDiv.textContent = `Time lapsed: ${formatDifferenceAccurate(startDate, now)}`;
            } else if (isStartDateFuture && isEndDateFuture) {
                // Scenario 4: Start is FUTURE, End is FUTURE (Static "Total difference" in months/days, no progress bar)
                resultDiv.textContent = `Total difference: ${formatDifferenceAccurateWithoutHoursMinutesSeconds(startDate, endDate)}`;
            } else {
                // Scenario 5: Both Start & End in the Past (Static "Total difference" in months/days, no progress bar)
                resultDiv.textContent = `Total difference: ${formatDifferenceAccurateWithoutHoursMinutesSeconds(startDate, endDate)}`;
            }
        }

        calculateBtn.disabled = false;
        calculateBtn.innerHTML = originalButtonHTML;
    }, 1000); // 500ms delay for spinner visibility
}
