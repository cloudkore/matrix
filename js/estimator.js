$(document).ready(function() {
    // Kins Estimator
    $('#calculateKins').on('click', function() {
        const kinsPerHour = parseFloat($('#kinsPerHour').val());
        const span = parseFloat($('#span').val());
        const kinsResult = $('#kinsResult');
        const calculateButton = $(this); // Get a reference to the clicked button

        // Store original button text
        const originalButtonText = calculateButton.text();

        // Disable button and show spinner
        calculateButton.prop('disabled', true);
        calculateButton.html('<span class="braille-spinner-icon"></span> Calculating...'); // Replace text with spinner
        kinsResult.html(''); // Clear previous results

        // Simulate a delay for calculation
        setTimeout(function() {
            if (isNaN(kinsPerHour) || isNaN(span) || kinsPerHour < 0 || span < 0) {
                kinsResult.html('<span style="color: red;">Please enter valid positive numbers for Kins per hour and Span.</span>');
                // Restore button state on error
                calculateButton.prop('disabled', false);
                calculateButton.text(originalButtonText);
                return;
            }

            const totalYen = kinsPerHour * 24 * span;
            const totalKinsPerWeek = kinsPerHour * 24 * 7;
            const totalKinsPerMonth = kinsPerHour * 24 * 30; // Assuming 30 days in a month
            const totalKinsPerYear = kinsPerHour * 24 * 365; // Assuming 365 days in a year

            const result = `
                Estimated Total Kins in ${span} days: ${totalYen.toFixed(2)}<br>
                Kins per hour: ${kinsPerHour.toFixed(2)}<br>
                Kins per week: ${totalKinsPerWeek.toFixed(2)}<br>
                Kins per month: ${totalKinsPerMonth.toFixed(2)}<br>
                Kins per year: ${totalKinsPerYear.toFixed(2)}
            `;
            kinsResult.html(result);

            // Restore button state after calculation
            calculateButton.prop('disabled', false);
            calculateButton.text(originalButtonText);
        }, 1000); // 1-second delay
    });

    // Level Estimator
    let countdownInterval; // To store the interval ID for clearing

    $('#calculateLevel').on('click', function() {
        const currentLevel = parseInt($('#currentLevel').val());
        const currentExperience = parseFloat($('#currentExperience').val());
        const experiencePerHourPercent = parseFloat($('#experiencePerHour').val());
        const levelResult = $('#levelResult');
        const countdownTimerElement = $('#countdownTimer');
        const calculateButton = $(this); // Get a reference to the clicked button

        // Store original button text
        const originalButtonText = calculateButton.text();

        // Disable button and show spinner
        calculateButton.prop('disabled', true);
        calculateButton.html('<span class="braille-spinner-icon"></span> Calculating...'); // Replace text with spinner
        levelResult.html(''); // Clear previous results
        countdownTimerElement.text(''); // Clear previous countdown

        // Clear any existing countdown
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        // Simulate a delay for calculation
        setTimeout(function() {
            if (isNaN(currentLevel) || isNaN(currentExperience) || isNaN(experiencePerHourPercent) ||
                currentLevel < 0 || currentExperience < 0 || currentExperience > 100 || experiencePerHourPercent < 0) {
                levelResult.html('<span style="color: red;">Please enter valid numbers. Current Experience should be between 0 and 100.</span>');
                // Restore button state on error
                calculateButton.prop('disabled', false);
                calculateButton.text(originalButtonText);
                return;
            }

            const experienceRequiredForNextLevel = (currentLevel + 1) * 1000;
            const absoluteExperience = (currentExperience / 100) * experienceRequiredForNextLevel;
            const remainingExperience = experienceRequiredForNextLevel - absoluteExperience;

            if (experiencePerHourPercent === 0) {
                levelResult.html('<span style="color: red;">Experience per hour cannot be zero.</span>');
                // Restore button state on error
                calculateButton.prop('disabled', false);
                calculateButton.text(originalButtonText);
                return;
            }
            const experiencePerHour = (experiencePerHourPercent / 100) * experienceRequiredForNextLevel;

            const timeToNextLevelHours = remainingExperience / experiencePerHour;

            if (timeToNextLevelHours < 0) {
                levelResult.html('You have already reached or surpassed 100% for this level! Consider leveling up.');
                // Restore button state on error
                calculateButton.prop('disabled', false);
                calculateButton.text(originalButtonText);
                return;
            }

            const timeToNextLevelMilliseconds = timeToNextLevelHours * 3600 * 1000;
            const endTime = Date.now() + timeToNextLevelMilliseconds;

            levelResult.html(`Estimated time to next level: ${timeToNextLevelHours.toFixed(2)} hours`);

            // Restore button state after initial calculation (before countdown starts)
            calculateButton.prop('disabled', false);
            calculateButton.text(originalButtonText);

            // Start the countdown timer
            updateCountdown(endTime);
        }, 1000); // 1-second delay
    });

    function updateCountdown(endTime) {
        const countdownTimerElement = $('#countdownTimer');

        countdownInterval = setInterval(function() {
            const currentTime = Date.now();
            const timeRemaining = endTime - currentTime;

            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);
                countdownTimerElement.text("Time's up! You should have leveled up!");
                return;
            }

            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            countdownTimerElement.text(`Next Level In: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`);
        }, 1000);
    }
});
