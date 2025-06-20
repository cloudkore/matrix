$(document).ready(function() {
    // Helper function to format numbers with dot as thousand separator and no decimals
    function formatNumberWithDots(number) {
        if (isNaN(number) || number === null) return ''; // Handle non-numeric or null input
        // Ensure it's an integer by flooring
        let num = Math.floor(number);
        // Convert to string and add dots as thousand separators
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Helper function to remove dot separators for parsing
    function unformatNumber(formattedString) {
        if (typeof formattedString !== 'string') return ''; // Ensure it's a string
        return formattedString.replace(/\./g, '');
    }

    // Apply input formatting to Kins per hour and Span fields
    $('#kinsPerHour, #span').on('input', function() {
        let input = $(this);
        let value = input.val();
        let cursorPosition = input[0].selectionStart;

        // Step 1: Clean the input value - allow only digits
        let cleanedValueForParsing = value.replace(/[^0-9]/g, '');

        // If the cleaned value is empty, clear the input and return
        if (cleanedValueForParsing.trim() === '') {
            input.val('');
            return;
        }

        // Step 2: Parse the number
        let numberValue = parseFloat(cleanedValueForParsing);

        // If the parsed value is not a valid number (e.g., user typed only non-digits)
        if (isNaN(numberValue)) {
            input.val(''); // Clear the input if it's completely non-numeric
            return;
        }

        // Step 3: Format the number with dots
        let formattedValue = formatNumberWithDots(numberValue);

        // --- Cursor position adjustment logic ---
        // Calculate the part of the original value before the cursor
        const originalValueBeforeCursor = value.substring(0, cursorPosition);
        // Unformat this part to get its clean numeric representation
        const unformattedValueBeforeCursor = unformatNumber(originalValueBeforeCursor);
        // Now format this unformatted part to see what its new length would be with dots
        // Use parseFloat here to ensure it's treated as a number before formatting
        const formattedValueBeforeCursor = formatNumberWithDots(parseFloat(unformattedValueBeforeCursor));

        let newCursorPosition = formattedValueBeforeCursor.length;

        // If the original cursor was at the very end of the input, ensure the new one is too.
        if (cursorPosition === value.length) {
            newCursorPosition = formattedValue.length;
        }
        // --- End cursor position adjustment logic ---

        // Step 4: Update the input field value
        input.val(formattedValue);

        // Step 5: Set the cursor position
        // This must be done AFTER setting the value
        input[0].setSelectionRange(newCursorPosition, newCursorPosition);
    });

    // Kins Estimator
    $('#calculateKins').on('click', function() {
        // Unformat the input values before performing calculations
        const kinsPerHour = parseFloat(unformatNumber($('#kinsPerHour').val()));
        const span = parseFloat(unformatNumber($('#span').val()));

        const kinsResult = $('#kinsResult');
        const calculateButton = $(this); // Get a reference to the clicked button

        // Store original button text
        const originalButtonText = calculateButton.text();

        // Disable button and show spinner
        calculateButton.prop('disabled', true);
        calculateButton.html('<span class="braille-spinner-icon"></span> Calculating'); // Replace text with spinner
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

            // Calculate Kins for a fixed 24-hour period for the first line
            const totalKins24Hours = kinsPerHour * 24;

            // Existing calculations for other periods
            const totalKinsPerWeek = kinsPerHour * 24 * 7;
            const totalKinsPerMonth = kinsPerHour * 24 * 30; // Assuming 30 days in a month
            const totalKinsPerYear = kinsPerHour * 24 * 365; // Assuming 365 days in a year

            const result = `
                Estimated Total Kins in 24 hours: ${formatNumberWithDots(totalKins24Hours)}<br>
                Kins per hour: ${formatNumberWithDots(kinsPerHour)}<br>
                Kins per week: ${formatNumberWithDots(totalKinsPerWeek)}<br>
                Kins per month: ${formatNumberWithDots(totalKinsPerMonth)}<br>
                Kins per year: ${formatNumberWithDots(totalKinsPerYear)}
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
        calculateButton.html('<span class="braille-spinner-icon"></span> Calculating'); // Replace text with spinner
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

            // Define the base XP required for one complete level
            const BASE_XP_PER_LEVEL = 1000; // Assuming 1000 XP is always required for one full level

            // Calculate current experience within the current level, converted to absolute XP
            const currentXPInCurrentLevel = (currentExperience / 100) * BASE_XP_PER_LEVEL;

            // Remaining XP needed for the CURRENT level
            const remainingXPForCurrentLevel = BASE_XP_PER_LEVEL - currentXPInCurrentLevel;

            // Absolute XP gained per hour based on the percentage of BASE_XP_PER_LEVEL
            const xpPerHourAbsolute = (experiencePerHourPercent / 100) * BASE_XP_PER_LEVEL;

            if (xpPerHourAbsolute === 0) {
                levelResult.html('<span style="color: red;">Experience per hour cannot be zero.</span>');
                // Restore button state on error
                calculateButton.prop('disabled', false);
                calculateButton.text(originalButtonText);
                return;
            }

            const timeToNextLevelHours = remainingXPForCurrentLevel / xpPerHourAbsolute;

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
