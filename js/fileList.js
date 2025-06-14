const repoOwner = 'cloudkore';
const repoName = 'matrix';
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/MODs`;

const fileList = document.getElementById('fileList');
const searchInput = document.getElementById('searchInput');

// --- Spinner related variables (assuming showBrailleSpinner is defined globally by braille-spinner.js) ---
let initialSpinnerInterval; // To store the interval ID for the initial loading spinner

// Initial loading state setup for the main list
fileList.classList.add('loading');
const initialSpinner = fileList.querySelector('.braille-spinner');
if (initialSpinner) {
  initialSpinnerInterval = showBrailleSpinner(initialSpinner); // Start the initial loading spinner
}
// ---------------------------------------------------------------------------------------------------------

fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Clear initial loading state and message
    fileList.classList.remove('loading');
    fileList.innerHTML = ''; // Clear the "Loading MODs..." message

    // --- Stop and clear initial spinner on success ---
    if (initialSpinnerInterval) {
      clearInterval(initialSpinnerInterval);
      if (initialSpinner) initialSpinner.textContent = ''; // Clear spinner content
    }
    // ---------------------------------------------------

    data.forEach(file => {
      const listItem = document.createElement('li');
      listItem.classList.add('mod-item');

      const link = document.createElement('a');
      link.textContent = file.name;
      link.href = file.download_url;
      link.download = file.name;

      // Create a spinner span for each individual download link
      const downloadSpinner = document.createElement('span');
      downloadSpinner.classList.add('braille-spinner');
      link.appendChild(downloadSpinner); // Append spinner to the link

      // Add click listener for individual file downloads
      link.addEventListener('click', function (event) {
        // No need to prevent default here as link.download handles it,
        // but we want to ensure the spinner logic runs immediately.

        const currentSpinner = this.querySelector('.braille-spinner');
        let downloadSpinnerInterval;

        if (currentSpinner) {
          // Add a class to the link/mod-item to show the spinner via CSS
          this.classList.add('downloading'); // Add a new class for individual download state
          currentSpinner.textContent = ''; // Clear any previous content
          downloadSpinnerInterval = showBrailleSpinner(currentSpinner); // Start spinner for this download
        }

        // The file download itself is handled by link.click() below,
        // but the visual feedback (spinner) is controlled here for 1.5 seconds.
        setTimeout(() => {
          if (downloadSpinnerInterval) {
            clearInterval(downloadSpinnerInterval);
          }
          if (currentSpinner) {
            currentSpinner.textContent = ''; // Stop and clear spinner
          }
          this.classList.remove('downloading'); // Remove the loading class
        }, 1500); // Spinner duration (1.5 seconds)
      });

      listItem.appendChild(link);
      fileList.appendChild(listItem);
    });
  })
  .catch(error => {
    console.error('Error fetching files:', error);
    fileList.classList.remove('loading'); // Remove loading class on error

    // --- Stop and clear initial spinner on error ---
    if (initialSpinnerInterval) {
      clearInterval(initialSpinnerInterval);
    }
    // -----------------------------------------------

    fileList.innerHTML = "<li>Error loading files. Please try again later.</li>"; // Display error message
  });

// Live search
searchInput.addEventListener('input', function () {
  const searchTerm = this.value.toLowerCase();
  const items = document.querySelectorAll('#fileList li');

  items.forEach(item => {
    const name = item.textContent.toLowerCase();
    item.style.display = name.includes(searchTerm) ? 'list-item' : 'none';
  });
});
