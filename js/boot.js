window.addEventListener("DOMContentLoaded", () => {
  const bootScreen = document.getElementById("bootScreen");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");

  const messages = [
    "Connecting to GitHub...",
    "Decrypting Ninja Secrets...",
    "Fetching Assets...",
    "Optimizing Shurikens...",
    "Loading Matrix...",
    "Installing Backdoors...",
    "Compiling Chakra...",
    "Almost there...",
    "Finishing touches...",
    "Launching NinjaBase..."
  ];

  let percent = 0;

  const interval = setInterval(() => {
    percent += Math.floor(Math.random() * 3) + 1; // 1-3% per step
    if (percent >= 100) percent = 100;

    progressBar.style.width = percent + "%";

    // Update text every ~10%
    const msgIndex = Math.floor(percent / (100 / messages.length));
    progressText.innerText = `[${percent}%] ${messages[msgIndex]}`;

    if (percent >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        bootScreen.style.display = "none";
      }, 1000);
    }
  }, 80);
});