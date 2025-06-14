const brailleFrames = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
let brailleIndex = 0;

function showBrailleSpinner(span) {
  return setInterval(() => {
    span.textContent = brailleFrames[brailleIndex % brailleFrames.length];
    brailleIndex++;
  }, 100);
}

document.querySelectorAll('.btn-download').forEach(button => {
  button.addEventListener('click', function () {
    const spinner = this.querySelector('.braille-spinner');

    // Add a loading class and disable the button
    this.classList.add('loading');
    this.disabled = true;

    spinner.textContent = ''; // Clear existing content
    const interval = showBrailleSpinner(spinner); // Start the animation

    // Wait 1.5s then download
    setTimeout(() => {
      clearInterval(interval);
      spinner.textContent = ''; // Stop spinner animation
      this.classList.remove('loading'); // Remove loading class
      this.disabled = false; // Re-enable the button

      // Force download
      const link = document.createElement("a");
      link.href = this.dataset.href;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  });
});
