window.addEventListener("DOMContentLoaded", () => {
  const bootScreen = document.getElementById("bootScreen");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");

  const messages = [
    "Connecting to GitHub",
    "Decrypting resources",
    "Fetching Assets",
    "Optimizing Shurikens",
    "Loading Matrix",
    "Installing Plugins",
    "Compiling Chakra",
    "Almost there",
    "Finishing touches",
    "Launching WebApp"
  ];

  const spinnerFrames = ['⣾', '⣷', '⣯', '⣟', '⡿', '⢿', '⣻', '⣽'];
  let spinnerIndex = 0;
  let percent = 0;

  const interval = setInterval(() => {
    percent += Math.floor(Math.random() * 3) + 1;
    if (percent >= 100) percent = 100;

    // Update progress bar
    progressBar.style.width = percent + "%";

    // Pick message
    const msgIndex = Math.floor(percent / (100 / messages.length));
    const safeIndex = Math.min(msgIndex, messages.length - 1);

    // Spinner
    const spinner = spinnerFrames[spinnerIndex];
    spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;

    // Dynamic color from white to red
    const red = 255;
    const gb = Math.floor(255 - (percent * 2.55)); // white to red
    progressText.style.color = `rgb(${red}, ${gb}, ${gb})`;

    // Update text
    progressText.innerText = `[${percent}%] ${spinner} ${messages[safeIndex]}`;

    // Complete loading
    if (percent >= 100) {
      clearInterval(interval);
      bootScreen.classList.add("fade-out");
      setTimeout(() => {
        bootScreen.style.display = "none";
      }, 800); // match with CSS transition
    }
  }, 80);
});