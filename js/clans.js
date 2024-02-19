// Function to handle button click and document click events
function handleButtonClick(event) {
  const button = document.getElementById('accessButton');
  const spinner = button.querySelector('.spinner-border');
  const loadingText = button.querySelector('.loading-text');
  const clansList = document.getElementById('clansList');

  if (clansList.style.display === 'none') {
    spinner.style.display = 'inline-block';
    loadingText.textContent = 'Loading...';

    // Simulate loading delay
    setTimeout(function() {
      spinner.style.display = 'none';
      loadingText.textContent = 'Close';
      clansList.style.display = 'block'; // Show the clans list
      loadClansList(); // Load the clans list content
    }, 2000); // Adjust the delay time as needed
  } else {
    clansList.style.display = 'none'; // Hide the clans list
    loadingText.textContent = 'Access'; // Reset the button text
  }

  // Prevent the click event from propagating to the document
  event.stopPropagation();
}

// Function to load the clans list
function loadClansList() {
  const clansList = document.getElementById('clansList');

  // Fetch clans.txt file
  fetch('assets/clans.txt')
    .then(response => response.text())
    .then(data => {
      // Split the text into an array of clan names
      const clans = data.split('\n');
      
      // Create list items for each clan
      const listItems = clans.map(clan => `<div style="padding: 10px; color: white;">${clan}</div>`).join('');

      // Append the list items to the clansList div
      clansList.innerHTML = listItems;
    })
    .catch(error => console.error('Error loading clans:', error));
}

// Event listener to hide the clans list when clicking outside of it
document.addEventListener('click', function(event) {
  const clansList = document.getElementById('clansList');
  const accessButton = document.getElementById('accessButton');

  // Check if the clicked element is inside the clans list or the access button
  if (event.target !== clansList && !clansList.contains(event.target) && event.target !== accessButton && !accessButton.contains(event.target)) {
    clansList.style.display = 'none';
    accessButton.querySelector('.loading-text').textContent = 'Access'; // Reset the button text
  }
});
