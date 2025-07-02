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
        font-family: sans-serif;
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
            font-family: sans-serif;
            border-radius: 3px;
        ">OK</button>
    `;
    document.body.appendChild(alertBox);

    document.getElementById('alert-ok-btn').addEventListener('click', () => {
        document.body.removeChild(alertBox);
    });
}

/**
 * Attempts to get the 2-letter ISO country code for a given IANA timezone.
 * Falls back to a common country if the timezone is associated with multiple or none.
 * @param {string} timezone - The IANA timezone string (e.g., "America/New_York").
 * @returns {string} - The 2-letter ISO country code in lowercase, or 'un' if not found.
 */
function getCountryCodeFromTimezone(timezone) {
    const zone = moment.tz.zone(timezone);
    if (zone && zone.countries && zone.countries().length > 0) {
        return zone.countries()[0].toLowerCase();
    }

    const commonTimezoneToCountryMap = {
        'America/New_York': 'us',
        'Europe/London': 'gb',
        'Europe/Berlin': 'de',
        'Asia/Tokyo': 'jp',
        'Australia/Sydney': 'au',
        'Asia/Kolkata': 'in',
        'America/Los_Angeles': 'us',
        'Europe/Paris': 'fr',
        'America/Toronto': 'ca',
        'Europe/Moscow': 'ru',
        'Africa/Johannesburg': 'za',
        'America/Mexico_City': 'mx',
        'Asia/Shanghai': 'cn',
        'Pacific/Auckland': 'nz',
        'America/Sao_Paulo': 'br',
        'Africa/Cairo': 'eg',
        'Europe/Madrid': 'es',
        'Europe/Rome': 'it',
        'Europe/Amsterdam': 'nl',
        'Sweden': 'se',
        'Norway': 'no',
        'Finland': 'fi',
        'Greece': 'gr',
        'UTC': 'un'
    };

    if (commonTimezoneToCountryMap[timezone]) {
        return commonTimezoneToCountryMap[timezone];
    }

    const timezoneParts = timezone.split('/');
    if (timezoneParts.length > 0) {
        const region = timezoneParts[0].toLowerCase();
        const regionToCountryMap = {
            'america': 'us', 'europe': 'eu', 'asia': 'cn', 'africa': 'za',
            'australia': 'au', 'pacific': 'fj', 'atlantic': 'is', 'indian': 'io'
        };
        if (regionToCountryMap[region]) {
            return regionToCountryMap[region];
        }
    }

    return 'un';
}

/**
 * Updates the UTC Live time display.
 */
function updateUTCLiveTime() {
    const utcLiveTimeElement = document.getElementById('utc-live-time');
    if (utcLiveTimeElement) {
        utcLiveTimeElement.textContent = moment().tz('UTC').format('dddd, MMMM Do, h:mm:ss A');
    }
}

/**
 * Updates the default Local Time display in the tracked timezones list.
 */
function updateDefaultLocalTimeDisplay() {
    const localTimeElement = document.getElementById('time-local');
    if (localTimeElement) {
        localTimeElement.textContent = moment().format('h:mm:ss A');
    }
}

/**
 * Updates the display for all dynamically tracked timezones.
 */
function updateTimezones() {
    const timezoneListElement = document.getElementById('timezone-list');
    const noTimezonesMessage = document.getElementById('no-timezones-message');

    const existingDynamicItems = timezoneListElement.querySelectorAll('.list-group-item:not([data-default-timezone="true"])');
    existingDynamicItems.forEach(item => item.remove());

    if (trackedTimezones.length === 0) {
        noTimezonesMessage.style.display = 'block';
    } else {
        noTimezonesMessage.style.display = 'none';
        trackedTimezones.forEach(timezone => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');

            const countryCode = getCountryCodeFromTimezone(timezone);
            const flagSrc = `assets/country-svg/${countryCode}.svg`;
            const flagAlt = `${timezone.replace(/_/g, ' ')} flag`;

            listItem.innerHTML = `
                <div class="timezone-entry">
                    <span class="timezone-name">
                        <img src="${flagSrc}" alt="${flagAlt}" class="country-flag" onerror="this.onerror=null;this.src='https://placehold.co/24x18/cccccc/000000?text=N/A';">
                        ${timezone.replace(/_/g, ' ')}
                    </span>
                    <span class="timezone-time">${moment().tz(timezone).format('h:mm:ss A')}</span>
                    <button class="remove-btn" data-timezone="${timezone}">X</button>
                </div>
            `;
            timezoneListElement.appendChild(listItem);
        });
    }

    document.querySelectorAll('.remove-btn:not([data-timezone="__LOCAL_TIME_FIXED__"])').forEach(button => {
        button.removeEventListener('click', handleRemoveTimezone);
        button.addEventListener('click', handleRemoveTimezone);
    });
}

/**
 * Adds a new timezone to the tracked list.
 * @param {string} input - The user input (country name or timezone string).
 */
function addTimezone(input) {
    let timezoneToAdd = input.trim();
    const normalizedInput = timezoneToAdd.toLowerCase();

    if (Object.keys(countryToTimezoneMap).length === 0) {
        showAlert('Country data is still loading. Please wait a moment and try again.');
        return;
    }

    let foundCountryTimezone = null;
    for (const countryName in countryToTimezoneMap) {
        if (countryName.toLowerCase() === normalizedInput) {
            foundCountryTimezone = countryToTimezoneMap[countryName];
            break;
        }
    }

    if (foundCountryTimezone) {
        timezoneToAdd = foundCountryTimezone;
    }

    if (!moment.tz.zone(timezoneToAdd)) {
        showAlert('Invalid input. Please enter a valid city/timezone (e.g., "America/New_York", "Europe/London", "UTC") or a recognized country name (e.g., "India", "USA").');
        return;
    }

    if (!trackedTimezones.includes(timezoneToAdd)) {
        trackedTimezones.push(timezoneToAdd);
        updateTimezones();
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
    if (timezone === '__LOCAL_TIME_FIXED__') {
        showAlert('Local Time cannot be removed as it is a default display.');
        return;
    }
    trackedTimezones = trackedTimezones.filter(tz => tz !== timezone);
    updateTimezones();
}

// --- Autocomplete Logic for Add Timezone Tab ---
const timezoneInput = document.getElementById('timezone-input');
const autocompleteSuggestionsDiv = document.getElementById('autocomplete-suggestions');

function showAutocompleteSuggestions(inputValue, suggestionsContainer, inputField) {
    suggestionsContainer.innerHTML = '';
    if (!inputValue) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    const normalizedInput = inputValue.toLowerCase();
    const matchingCountries = [];

    if ('utc'.startsWith(normalizedInput)) {
        matchingCountries.push('UTC');
    }

    for (const countryName in countryToTimezoneMap) {
        if (countryName.toLowerCase().startsWith(normalizedInput)) {
            matchingCountries.push(countryName);
        }
    }

    if (matchingCountries.length > 0) {
        matchingCountries.sort();
        matchingCountries.slice(0, 10).forEach(countryName => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('autocomplete-item');
            suggestionItem.textContent = countryName;
            suggestionItem.addEventListener('mousedown', (event) => {
                event.preventDefault();
                inputField.value = countryName;
                suggestionsContainer.style.display = 'none';
                inputField.focus();
            });
            suggestionsContainer.appendChild(suggestionItem);
        });
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
    }
}

function hideAutocompleteSuggestions(suggestionsContainer) {
    suggestionsContainer.style.display = 'none';
}

timezoneInput.addEventListener('input', (event) => {
    showAutocompleteSuggestions(event.target.value, autocompleteSuggestionsDiv, timezoneInput);
});

timezoneInput.addEventListener('blur', () => hideAutocompleteSuggestions(autocompleteSuggestionsDiv));

document.getElementById('add-timezone-btn').addEventListener('click', function() {
    const newTimezone = timezoneInput.value.trim();
    if (newTimezone) {
        addTimezone(newTimezone);
        timezoneInput.value = '';
        hideAutocompleteSuggestions(autocompleteSuggestionsDiv);
    }
});

// --- Time Converter Logic ---
const sourceTimeHourInput = document.getElementById('source-time-hour-input');
const sourceTimeMinuteInput = document.getElementById('source-time-minute-input');
const ampmSelect = document.getElementById('ampm-select');

const sourceTimezoneInput = document.getElementById('source-timezone-input');
const targetTimezoneInput = document.getElementById('target-timezone-input');
const convertTimeBtn = document.getElementById('convert-time-btn');
const convertedTimesList = document.getElementById('converted-times-list');
const converterAutocompleteSuggestionsDiv = document.getElementById('converter-autocomplete-suggestions');
const targetAutocompleteSuggestionsDiv = document.getElementById('target-autocomplete-suggestions');

function convertTime() {
    convertedTimesList.innerHTML = '';

    const hourStr = sourceTimeHourInput.value.trim();
    const minuteStr = sourceTimeMinuteInput.value.trim();
    const ampm = ampmSelect.value;

    let hours = parseInt(hourStr, 10);
    let minutes = parseInt(minuteStr, 10);

    if (hourStr === '' || minuteStr === '' || !sourceTimezoneInput.value.trim() || !targetTimezoneInput.value.trim()) {
        showAlert('Please enter source time (hours and minutes), source timezone, and target timezone.');
        return;
    }

    if (
        isNaN(hours) ||
        hours < 1 || hours > 12 ||
        hourStr.length > 2 ||
        !/^\d{1,2}$/.test(hourStr)
    ) {
        showAlert('Please enter a valid hour between 1 and 12.');
        return;
    }

    if (
        isNaN(minutes) ||
        minutes < 0 || minutes > 59 ||
        minuteStr.length > 2 ||
        !/^\d{1,2}$/.test(minuteStr)
    ) {
        showAlert('Please enter valid minutes between 00 and 59.');
        return;
    }

    let sourceTimezone = sourceTimezoneInput.value.trim();
    let targetTimezone = targetTimezoneInput.value.trim();

    // Normalize source timezone
    const normalizedSourceInput = sourceTimezone.toLowerCase();
    let foundSourceCountryTimezone = null;
    if (normalizedSourceInput === 'utc') {
        foundSourceCountryTimezone = 'UTC';
    } else {
        for (const country in countryToTimezoneMap) {
            if (country.toLowerCase() === normalizedSourceInput) {
                foundSourceCountryTimezone = countryToTimezoneMap[country];
                break;
            }
        }
    }
    if (foundSourceCountryTimezone) {
        sourceTimezone = foundSourceCountryTimezone;
    }

    // Normalize target timezone
    const normalizedTargetInput = targetTimezone.toLowerCase();
    let foundTargetCountryTimezone = null;
    if (normalizedTargetInput === 'utc') {
        foundTargetCountryTimezone = 'UTC';
    } else {
        for (const country in countryToTimezoneMap) {
            if (country.toLowerCase() === normalizedTargetInput) {
                foundTargetCountryTimezone = countryToTimezoneMap[country];
                break;
            }
        }
    }
    if (foundTargetCountryTimezone) {
        targetTimezone = foundTargetCountryTimezone;
    }

    if (!moment.tz.zone(sourceTimezone)) {
        showAlert('Invalid source timezone. Please enter a valid city/timezone (e.g., "America/New_York", "Europe/London", "UTC") or country.');
        return;
    }

    if (!moment.tz.zone(targetTimezone)) {
        showAlert('Invalid target timezone. Please enter a valid city/timezone (e.g., "Asia/Kolkata", "UTC") or country.');
        return;
    }

    // Convert to 24-hour format
    if (ampm === 'PM' && hours < 12) {
        hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
    }

    const adjustedTimeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    const today = moment().format('YYYY-MM-DD');
    const sourceMoment = moment.tz(`${today} ${adjustedTimeString}`, 'YYYY-MM-DD HH:mm', sourceTimezone);

    if (!sourceMoment.isValid()) {
        showAlert('Invalid source time or timezone combination. Please ensure the time is valid (e.g., 02:30).');
        return;
    }

    const convertedMoment = sourceMoment.clone().tz(targetTimezone);

    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');

    const targetCountryCode = getCountryCodeFromTimezone(targetTimezone);
    const targetFlagSrc = `assets/country-svg/${targetCountryCode}.svg`;
    const targetFlagAlt = `${targetTimezone.replace(/_/g, ' ')} flag`;

    listItem.innerHTML = `
        <div class="timezone-entry">
            <span class="timezone-name">
                <img src="${targetFlagSrc}" alt="${targetFlagAlt}" class="country-flag" onerror="this.onerror=null;this.src='https://placehold.co/24x18/cccccc/000000?text=N/A';">
                ${targetTimezone.replace(/_/g, ' ')}
            </span>
            <span class="timezone-time">${convertedMoment.format('h:mm:ss A')}</span>
        </div>
    `;
    convertedTimesList.appendChild(listItem);
}

sourceTimezoneInput.addEventListener('input', (event) => {
    showAutocompleteSuggestions(event.target.value, converterAutocompleteSuggestionsDiv, sourceTimezoneInput);
});

sourceTimezoneInput.addEventListener('blur', () => hideAutocompleteSuggestions(converterAutocompleteSuggestionsDiv));

targetTimezoneInput.addEventListener('input', (event) => {
    showAutocompleteSuggestions(event.target.value, targetAutocompleteSuggestionsDiv, targetTimezoneInput);
});

targetTimezoneInput.addEventListener('blur', () => hideAutocompleteSuggestions(targetAutocompleteSuggestionsDiv));

convertTimeBtn.addEventListener('click', convertTime);

$('a[data-toggle="tab"]').on('shown.bs.tab', function () {
    hideAutocompleteSuggestions(autocompleteSuggestionsDiv);
    hideAutocompleteSuggestions(converterAutocompleteSuggestionsDiv);
    hideAutocompleteSuggestions(targetAutocompleteSuggestionsDiv);
});

window.onload = function() {
    loadCountryTimezoneMap();

    updateUTCLiveTime();
    updateDefaultLocalTimeDisplay();
    updateTimezones();

    setInterval(updateUTCLiveTime, 1000);
    setInterval(updateDefaultLocalTimeDisplay, 1000);
    setInterval(updateTimezones, 1000);
};