window.addEventListener("DOMContentLoaded", () => {
  const bootScreen = document.getElementById("bootScreen");
  const logBox = document.getElementById("bootLogs");

  const steps = [
    "Connecting to GitHub server...",
    "Establishing secure channel...",
    "Authenticating as Ninja...",
    "Fetching repository data...",
    "Cloning matrix core...",
    "Injecting payload...",
    "Encrypting responses...",
    "Loading assets...",
    "Booting up interface...",
    "Finalizing system...",
    "Launch sequence initiated...",
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i < steps.length) {
      logBox.innerHTML += `<div>[${i * 10}%] ${steps[i]}</div>`;
      logBox.scrollTop = logBox.scrollHeight;
      i++;
    } else {
      logBox.innerHTML += `<div>[100%] System ready.</div>`;
      clearInterval(interval);

      setTimeout(() => {
        bootScreen.style.display = "none";
      }, 1000);
    }
  }, 300);
});