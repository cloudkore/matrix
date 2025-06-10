document.addEventListener('DOMContentLoaded', () => {
    // Get the file input and the span for displaying the file name
    const fileUploadInput = document.getElementById('fileUploadInput');
    const fileUploadFileName = document.getElementById('fileUploadFileName');

    // Ensure both elements exist before adding the event listener
    if (fileUploadInput && fileUploadFileName) {
        fileUploadInput.addEventListener('change', (event) => {
            // Get the name of the selected file
            const fileName = event.target.files[0] ? event.target.files[0].name : '';

            // Update the text content of the span
            // It checks if getTranslation function exists (from dashboard.js)
            // and uses a fallback if it doesn't, though it should be available.
            fileUploadFileName.textContent = fileName || (typeof getTranslation === 'function' ? getTranslation("no_file_chosen") : 'No file chosen');
        });
    }
});
