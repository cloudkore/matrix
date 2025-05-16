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

    progressBar.style.width = percent + "%";

    const msgIndex = Math.floor(percent / (100 / messages.length));
    const safeIndex = Math.min(msgIndex, messages.length - 1);

    const spinner = spinnerFrames[spinnerIndex];
    spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;

    progressText.innerText = `[${percent}%] ${spinner} ${messages[safeIndex]}`;

    if (percent >= 100) {
  clearInterval(interval);
  bootScreen.classList.add("fade-out");
  setTimeout(() => {
    bootScreen.style.display = "none";
  }, 800); // same as CSS transition duration
}
  }, 80);
});