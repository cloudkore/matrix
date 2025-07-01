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
                // No longer calling populateCountryDatalist() as we're using custom autocomplete
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
                    listItem.innerHTML = `
                        <div class="timezone-entry">
                            <span class="timezone-name">${timezone.replace(/_/g, ' ')}</span>
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

        // --- Autocomplete Logic ---
        const timezoneInput = document.getElementById('timezone-input');
        const autocompleteSuggestionsDiv = document.getElementById('autocomplete-suggestions');

        /**
         * Shows autocomplete suggestions based on user input.
         * @param {string} inputValue - The current value of the input field.
         */
        function showAutocompleteSuggestions(inputValue) {
            autocompleteSuggestionsDiv.innerHTML = ''; // Clear previous suggestions
            if (!inputValue) {
                autocompleteSuggestionsDiv.style.display = 'none';
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
                    // Changed 'click' to 'mousedown' to handle timing with blur event
                    suggestionItem.addEventListener('mousedown', (event) => {
                        event.preventDefault(); // Prevent blur from firing before value is set
                        timezoneInput.value = countryName;
                        hideAutocompleteSuggestions();
                        timezoneInput.focus(); // Keep focus on input after selection
                    });
                    autocompleteSuggestionsDiv.appendChild(suggestionItem);
                });
                autocompleteSuggestionsDiv.style.display = 'block';
            } else {
                autocompleteSuggestionsDiv.style.display = 'none';
            }
        }

        /**
         * Hides the autocomplete suggestions.
         */
        function hideAutocompleteSuggestions() {
            // No longer need a timeout if using mousedown and preventDefault
            autocompleteSuggestionsDiv.style.display = 'none';
        }

        // Event listener for input changes to trigger autocomplete
        timezoneInput.addEventListener('input', (event) => {
            showAutocompleteSuggestions(event.target.value);
        });

        // Event listener to hide suggestions when input loses focus
        // Ensure this doesn't interfere with mousedown on suggestions
        timezoneInput.addEventListener('blur', hideAutocompleteSuggestions);

        // Event listener for adding a timezone
        document.getElementById('add-timezone-btn').addEventListener('click', function() {
            const newTimezone = timezoneInput.value.trim();
            if (newTimezone) {
                addTimezone(newTimezone);
                timezoneInput.value = ''; // Clear input
                hideAutocompleteSuggestions(); // Hide suggestions after adding
            }
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
