// Function to load the content of clans.html using AJAX
  function loadClansContent() {
    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    // Define the URL of the clans.html file
    var url = 'assets/clans.html';

    // Configure the XMLHttpRequest object
    xhr.open('GET', url, true);

    // Set up a callback function to handle the response
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          // If the request is successful, update the content of the clansContent div
          document.getElementById('clansContent').innerHTML = xhr.responseText;
        } else {
          // If there's an error, log it to the console
          console.error('Error loading clans content:', xhr.status);
        }
      }
    };

    // Send the request
    xhr.send();
  }

  // Call the function to load the clans content when the page loads
  window.onload = loadClansContent;
