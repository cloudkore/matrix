        // Array to store selected timezones (excluding the fixed "Local Time" entry)
        var trackedTimezones = [];
        // Global variable to store the country-to-timezone map, loaded from JSON
        var countryToTimezoneMap = {};

        /**
         * Fetches the country-to-timezone mapping from a JSON file.
         * This function is asynchronous and populates the global countryToTimezoneMap.
         */
        async function loadCountryTimezoneMap() {
            try {
                // Updated path to fetch from assets/countryTimezones.json
                const response = await fetch('assets/countryTimezones.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                countryToTimezoneMap = await response.json();
                console.log('Country-to-timezone map loaded successfully.');
            } catch (error) {
                console.error('Failed to load country-to-timezone map:', error);
                showAlert('Failed to load country data. Please try refreshing the page.');
            }
        }

        /**
         * Displays a custom alert message.
         * @param {string} message - The message to display.
         */
        function showAlert(message) {
            // Create a simple modal or message box instead of alert()
            const alertBox = document.createElement('div');
            alertBox.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #333;
                color: #fff;
                padding: 20px;
                border: 2px solid #0f0;
                box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
                z-index: 1000;
                font-family: sans-serif; /* Using a generic sans-serif for alerts */
                text-align: center;
                border-radius: 5px;
            `;
            alertBox.innerHTML = `
                <p>${message}</p>
                <button id="alert-ok-btn" style="
                    background-color: #0a0;
                    color: #fff;
                    border: 1px solid #0f0;
                    padding: 8px 15px;
                    cursor: pointer;
                    margin-top: 10px;
                    font-family: sans-serif; /* Using a generic sans-serif for alerts */
                    border-radius: 3px;
                ">OK</button>
            `;
            document.body.appendChild(alertBox);

            document.getElementById('alert-ok-btn').addEventListener('click', () => {
                document.body.removeChild(alertBox);
            });
        }

        /**
         * Returns a sun or moon emoji based on the current hour in a given timezone.
         * @param {string} timezone - The IANA timezone string.
         * @returns {string} - Sun or moon emoji.
         */
        function getSunMoonIcon(timezone) {
            const hour = moment().tz(timezone).hour();
            // Assuming daytime is roughly 6 AM to 6 PM
            if (hour >= 6 && hour < 18) {
                return '☀️'; // Sun emoji
            } else {
                return '🌙'; // Moon emoji
            }
        }

        /**
         * Formats the UTC offset of a given timezone.
         * This function is no longer used for display in updateTimezones, but kept for reference if needed elsewhere.
         * @param {string} timezone - The IANA timezone string.
         * @returns {string} - Formatted UTC offset (e.g., "+05:30", "-04:00", or empty string if offset is 0).
         */
        function formatTimezoneOffset(timezone) {
            const offsetMinutes = moment().tz(timezone).utcOffset(); // in minutes

            if (offsetMinutes === 0) {
                return ''; // If offset is 0, return an empty string
            }

            const sign = offsetMinutes >= 0 ? '+' : '-';
            const absOffsetMinutes = Math.abs(offsetMinutes);
            const hours = Math.floor(absOffsetMinutes / 60);
            const minutes = absOffsetMinutes % 60;

            const formattedHours = String(hours).padStart(2, '0');
            const formattedMinutes = String(minutes).padStart(2, '0');

            return `${sign}${formattedHours}:${formattedMinutes}`; // Removed "UTC" prefix
        }

        /**
         * Updates the UTC Live time display.
         */
        function updateUTCLiveTime() {
            const utcLiveTimeElement = document.getElementById('utc-live-time');
            if (utcLiveTimeElement) {
                // Format UTC time using moment.js
                utcLiveTimeElement.textContent = moment().tz('UTC').format('dddd, MMMM Do, h:mm:ss A');
            }
        }

        /**
         * Updates the default Local Time display in the tracked timezones list.
         */
        function updateDefaultLocalTimeDisplay() {
            const localTimeElement = document.getElementById('time-local');
            if (localTimeElement) {
                // Format local time using moment.js
                localTimeElement.textContent = moment().format('h:mm:ss A');
            }
        }

        /**
         * Updates the display for all dynamically tracked timezones.
         */
        function updateTimezones() {
            const timezoneListElement = document.getElementById('timezone-list');
            const noTimezonesMessage = document.getElementById('no-timezones-message');

            // Clear existing dynamically added list items (not the default local time)
            const existingDynamicItems = timezoneListElement.querySelectorAll('.list-group-item:not([data-default-timezone="true"])');
            existingDynamicItems.forEach(item => item.remove());

            // If there are no dynamically tracked timezones, show message (after accounting for the fixed local time)
            if (trackedTimezones.length === 0) {
                noTimezonesMessage.style.display = 'block';
            } else {
                noTimezonesMessage.style.display = 'none';
                trackedTimezones.forEach(timezone => {
                    const listItem = document.createElement('li');
                    listItem.classList.add('list-group-item');
                    // Incorporate sun/moon icon and ONLY the time, no offset
                    listItem.innerHTML = `
                        <div class="timezone-entry">
                            <span class="timezone-name">${getSunMoonIcon(timezone)} ${timezone.replace(/_/g, ' ')}</span>
                            <span class="timezone-time">${moment().tz(timezone).format('h:mm:ss A')}</span>
                            <button class="remove-btn" data-timezone="${timezone}">X</button>
                        </div>
                    `;
                    timezoneListElement.appendChild(listItem);
                });
            }

            // Attach event listeners to new remove buttons (only for dynamically added ones)
            document.querySelectorAll('.remove-btn:not([data-timezone="__LOCAL_TIME_FIXED__"])').forEach(button => {
                // Remove existing listener to prevent duplicates
                button.removeEventListener('click', handleRemoveTimezone);
                // Add new listener
                button.addEventListener('click', handleRemoveTimezone);
            });
        }

        /**
         * Adds a new timezone to the tracked list.
         * It first checks if the input is a recognized country name,
         * then if it's a valid IANA timezone.
         * @param {string} input - The user input (country name or timezone string).
         */
        function addTimezone(input) {
            let timezoneToAdd = input.trim();
            const normalizedInput = timezoneToAdd.toLowerCase();

            // Check if the countryToTimezoneMap has been loaded
            if (Object.keys(countryToTimezoneMap).length === 0) {
                showAlert('Country data is still loading. Please wait a moment and try again.');
                return;
            }

            // Check if input is a country name in our map
            let foundCountryTimezone = null;
            // Iterate over the keys of the countryToTimezoneMap
            for (const countryName in countryToTimezoneMap) {
                // Normalize the country name from the map for comparison
                if (countryName.toLowerCase() === normalizedInput) {
                    foundCountryTimezone = countryToTimezoneMap[countryName];
                    break;
                }
            }

            if (foundCountryTimezone) {
                timezoneToAdd = foundCountryTimezone;
            }

            // Validate the timezone using moment-timezone
            if (!moment.tz.zone(timezoneToAdd)) {
                showAlert('Invalid input. Please enter a valid city/timezone (e.g., "America/New_York", "Europe/London") or a recognized country name (e.g., "India", "USA").');
                return;
            }

            if (!trackedTimezones.includes(timezoneToAdd)) {
                trackedTimezones.push(timezoneToAdd);
                updateTimezones();
                // Optional: Save to local storage
                // localStorage.setItem('trackedTimezones', JSON.stringify(trackedTimezones));
            } else {
                showAlert('This timezone is already being tracked.');
            }
        }

        /**
         * Handles the removal of a timezone from the list.
         * @param {Event} event - The click event.
         */
        function handleRemoveTimezone(event) {
            const timezone = event.target.dataset.timezone;
            // Prevent removal of the fixed local time entry
            if (timezone === '__LOCAL_TIME_FIXED__') {
                showAlert('Local Time cannot be removed as it is a default display.');
                return;
            }
            trackedTimezones = trackedTimezones.filter(tz => tz !== timezone);
            updateTimezones();
            // Optional: Save to local storage
            // localStorage.setItem('trackedTimezones', JSON.stringify(trackedTimezones));
        }

        // --- Autocomplete Logic for Add Timezone Tab ---
        const timezoneInput = document.getElementById('timezone-input');
        const autocompleteSuggestionsDiv = document.getElementById('autocomplete-suggestions');

        /**
         * Shows autocomplete suggestions based on user input for the Add Timezone tab.
         * @param {string} inputValue - The current value of the input field.
         * @param {HTMLElement} suggestionsContainer - The div to display suggestions in.
         * @param {HTMLElement} inputField - The input field associated with the suggestions.
         */
        function showAutocompleteSuggestions(inputValue, suggestionsContainer, inputField) {
            suggestionsContainer.innerHTML = ''; // Clear previous suggestions
            if (!inputValue) {
                suggestionsContainer.style.display = 'none';
                return;
            }

            const normalizedInput = inputValue.toLowerCase();
            const matchingCountries = [];

            for (const countryName in countryToTimezoneMap) {
                if (countryName.toLowerCase().startsWith(normalizedInput)) {
                    matchingCountries.push(countryName);
                }
            }

            if (matchingCountries.length > 0) {
                matchingCountries.sort(); // Sort alphabetically
                matchingCountries.slice(0, 10).forEach(countryName => { // Limit to 10 suggestions
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('autocomplete-item');
                    suggestionItem.textContent = countryName;
                    suggestionItem.addEventListener('mousedown', (event) => {
                        event.preventDefault(); // Prevent blur from firing before value is set
                        inputField.value = countryName;
                        suggestionsContainer.style.display = 'none'; // Hide suggestions
                        inputField.focus(); // Keep focus on input after selection
                    });
                    suggestionsContainer.appendChild(suggestionItem);
                });
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        }

        /**
         * Hides the autocomplete suggestions for a given container.
         * @param {HTMLElement} suggestionsContainer - The div containing suggestions.
         */
        function hideAutocompleteSuggestions(suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }

        // Event listener for input changes to trigger autocomplete on Add Timezone tab
        timezoneInput.addEventListener('input', (event) => {
            showAutocompleteSuggestions(event.target.value, autocompleteSuggestionsDiv, timezoneInput);
        });

        // Event listener to hide suggestions when input loses focus on Add Timezone tab
        timezoneInput.addEventListener('blur', () => hideAutocompleteSuggestions(autocompleteSuggestionsDiv));

        // Event listener for adding a timezone
        document.getElementById('add-timezone-btn').addEventListener('click', function() {
            const newTimezone = timezoneInput.value.trim();
            if (newTimezone) {
                addTimezone(newTimezone);
                timezoneInput.value = ''; // Clear input
                hideAutocompleteSuggestions(autocompleteSuggestionsDiv); // Hide suggestions after adding
            }
        });

        // --- Time Converter Logic ---
        const sourceTimeInput = document.getElementById('source-time-input');
        const ampmSelect = document.getElementById('ampm-select'); // Get reference to new AM/PM select
        const sourceTimezoneInput = document.getElementById('source-timezone-input');
        const targetTimezoneInput = document.getElementById('target-timezone-input'); // New target timezone input
        const convertTimeBtn = document.getElementById('convert-time-btn');
        const convertedTimesList = document.getElementById('converted-times-list');
        const converterAutocompleteSuggestionsDiv = document.getElementById('converter-autocomplete-suggestions');
        const targetAutocompleteSuggestionsDiv = document.getElementById('target-autocomplete-suggestions'); // New target autocomplete div

        /**
         * Converts the source time from one timezone to a specific target timezone.
         */
        function convertTime() {
            convertedTimesList.innerHTML = ''; // Clear previous converted times

            const sourceTime24hr = sourceTimeInput.value; // e.g., "14:30" or "02:30" (from input type="time")
            const ampm = ampmSelect.value; // "AM" or "PM"
            let sourceTimezone = sourceTimezoneInput.value.trim();
            let targetTimezone = targetTimezoneInput.value.trim(); // Get target timezone input

            if (!sourceTime24hr || !sourceTimezone || !targetTimezone) {
                showAlert('Please enter source time, source timezone, and target timezone.');
                return;
            }

            // Attempt to convert country name to IANA timezone for source
            const normalizedSourceInput = sourceTimezone.toLowerCase();
            let foundSourceCountryTimezone = null;
            for (const country in countryToTimezoneMap) {
                if (country.toLowerCase() === normalizedSourceInput) {
                    foundSourceCountryTimezone = countryToTimezoneMap[country];
                    break;
                }
            }
            if (foundSourceCountryTimezone) {
                sourceTimezone = foundSourceCountryTimezone;
            }

            // Attempt to convert country name to IANA timezone for target
            const normalizedTargetInput = targetTimezone.toLowerCase();
            let foundTargetCountryTimezone = null;
            for (const country in countryToTimezoneMap) {
                if (country.toLowerCase() === normalizedTargetInput) {
                    foundTargetCountryTimezone = countryToTimezoneMap[country];
                    break;
                }
            }
            if (foundTargetCountryTimezone) {
                targetTimezone = foundTargetCountryTimezone;
            }


            // Validate source timezone
            if (!moment.tz.zone(sourceTimezone)) {
                showAlert('Invalid source timezone. Please enter a valid city/timezone or country.');
                return;
            }

            // Validate target timezone
            if (!moment.tz.zone(targetTimezone)) {
                showAlert('Invalid target timezone. Please enter a valid city/timezone or country.');
                return;
            }

            // Parse hours and minutes from the 24-hour time input
            const [hoursStr, minutesStr] = sourceTime24hr.split(':');
            let hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);

            // Adjust hours based on AM/PM selection
            if (ampm === 'PM' && hours < 12) {
                hours += 12;
            } else if (ampm === 'AM' && hours === 12) { // 12 AM (midnight) should be 00 hours
                hours = 0;
            }

            // Reconstruct the 24-hour time string
            const adjustedTimeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

            // Create a moment object for the source time in the source timezone
            const today = moment().format('YYYY-MM-DD');
            const sourceMoment = moment.tz(`${today} ${adjustedTimeString}`, 'YYYY-MM-DD HH:mm', sourceTimezone);

            if (!sourceMoment.isValid()) {
                showAlert('Invalid source time or timezone combination. Please ensure the time is valid (e.g., 02:30).');
                return;
            }

            // Perform conversion to the single target timezone
            const convertedMoment = sourceMoment.clone().tz(targetTimezone);
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.innerHTML = `
                <div class="timezone-entry">
                    <span class="timezone-name">${getSunMoonIcon(targetTimezone)} ${targetTimezone.replace(/_/g, ' ')}</span>
                    <span class="timezone-time">${convertedMoment.format('h:mm:ss A')}</span>
                </div>
            `;
            convertedTimesList.appendChild(listItem);
        }

        // Event listener for input changes to trigger autocomplete on Source Timezone tab
        sourceTimezoneInput.addEventListener('input', (event) => {
            showAutocompleteSuggestions(event.target.value, converterAutocompleteSuggestionsDiv, sourceTimezoneInput);
        });

        // Event listener to hide suggestions when input loses focus on Source Timezone tab
        sourceTimezoneInput.addEventListener('blur', () => hideAutocompleteSuggestions(converterAutocompleteSuggestionsDiv));

        // Event listener for input changes to trigger autocomplete on Target Timezone tab
        targetTimezoneInput.addEventListener('input', (event) => {
            showAutocompleteSuggestions(event.target.value, targetAutocompleteSuggestionsDiv, targetTimezoneInput);
        });

        // Event listener to hide suggestions when input loses focus on Target Timezone tab
        targetTimezoneInput.addEventListener('blur', () => hideAutocompleteSuggestions(targetAutocompleteSuggestionsDiv));

        // Event listener for the Convert Time button
        convertTimeBtn.addEventListener('click', convertTime);

        // Handle tab switching to hide autocomplete suggestions
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            // Hide autocomplete suggestions when tabs are switched
            hideAutocompleteSuggestions(autocompleteSuggestionsDiv);
            hideAutocompleteSuggestions(converterAutocompleteSuggestionsDiv);
            hideAutocompleteSuggestions(targetAutocompleteSuggestionsDiv); // Hide target suggestions too
        });


        // Initial load and continuous updates
        window.onload = function() {
            // Load the country timezone map asynchronously
            loadCountryTimezoneMap();

            // Initial updates
            updateUTCLiveTime();
            updateDefaultLocalTimeDisplay();
            updateTimezones(); // Call to render any pre-existing or loaded tracked timezones

            // Update times every second
            setInterval(updateUTCLiveTime, 1000);
            setInterval(updateDefaultLocalTimeDisplay, 1000);
            setInterval(updateTimezones, 1000); // Update dynamically added timezones as well
        };
