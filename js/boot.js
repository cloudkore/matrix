window.addEventListener("DOMContentLoaded", () => {
  const bootScreen = document.getElementById("bootScreen");
  const bootLog = document.getElementById("bootLog"); // Get the bootLog element
  const bootLoaderText = document.getElementById("bootLoaderText"); // Get the new loader text element
  const loadingAnimation = document.getElementById("loadingAnimation"); // Get the new loading animation element

  // Optional: Load a boot sound (replace 'assets/boot_sound.mp3' with your path)
  // Ensure you have an 'assets' folder with this file or remove this line.
  const bootSound = new Audio('assets/boot.mp3');
  bootSound.volume = 0.3; // Adjust volume as needed
  bootSound.play().catch(e => console.error("Boot sound playback failed:", e));

  const messages = [
    "Matrix OS BOOT INITIATED",
    "C-Ninja Corp. 2019",
    "Build: v0.2.1-alpha",
    "",
    "Verifying system integrity",
    "Kernel & Services: OK",
    "",
    "Auth Protocols Init:",
    "  Firebase Auth Active[OK]",
    "  Token validation enabled",
    "",
    "Database connections:",
    "  Firestore NoSQL: OK",
    "  Supabase Postgres Online",
    "  Data sync running",
    "",
    "Distributed services:",
    "  AWS Cloud Established",
    "  Edge Functions Active",
    "  TCP/IP configured",
    "",
    "Runtime environment setup:",
    "  Emulators detected",
    "  Java Env (JVM) loaded",
    "  Bash scripts ok",
    "  Mods module init",
    "",
    "GitHub Repo Access:",
    "  Fetching WebApp core",
    "  Repo sync complete"
];

  const spinnerFrames = ['⣾', '⣷', '⣯', '⣟', '⡿', '⢿', '⣻', '⣽'];
  let spinnerIndex = 0;
  let percent = 0;
  let messageIndex = 0; // Track which message to display next from the `messages` array

  const interval = setInterval(() => {
    percent += Math.floor(Math.random() * 3) + 1;
    if (percent >= 100) percent = 100;

    // --- Update the main boot log (journal) ---
    // Determine if it's time to add a new message to the bootLog
    // Divide 100% by the number of messages to find the threshold for each message
    const percentPerMessage = 100 / messages.length;
    if (percent >= (messageIndex * percentPerMessage) && messageIndex < messages.length) {
        const line = document.createElement('div');
        line.className = 'boot-log-line'; // For fade-in effect defined in CSS
        line.textContent = messages[messageIndex];
        bootLog.appendChild(line);

        // Scroll to bottom of log to keep new messages visible
        bootLog.scrollTop = bootLog.scrollHeight;
        messageIndex++;
    }

    // --- Update the bottom loader/status line ---
    // Spinner
    const spinner = spinnerFrames[spinnerIndex];
    spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;

    // Dynamic color from white to red for the bootLoaderText
    // We'll use the #c0c0c0 (light grey) from CSS as the "white" start point
    const startR = parseInt('c0', 16); // c0 in decimal
    const startG = parseInt('c0', 16);
    const startB = parseInt('c0', 16);

    const endR = 255; // Full red
    const endG = 0;
    const endB = 0;

    // Calculate interpolated color components
    const currentR = Math.floor(startR + (endR - startR) * (percent / 100));
    const currentG = Math.floor(startG + (endG - startG) * (percent / 100));
    const currentB = Math.floor(startB + (endB - startB) * (percent / 100));

    bootLoaderText.style.color = `rgb(${currentR}, ${currentG}, ${currentB})`;


    // Update text
    let currentStatusText = "Loading...";
    if (messageIndex > 0 && messageIndex <= messages.length) {
        // Use the last message displayed in the log as the status, or a generic "Loading..."
        currentStatusText = messages[messageIndex - 1];
    }

    // Ensure the loading animation always shows unless complete
    if (percent < 100) {
        bootLoaderText.innerText = `[${percent}%] ${currentStatusText}`;
        loadingAnimation.textContent = spinner;
    } else {
        bootLoaderText.innerText = `[100%] Processing WebApp`;
        loadingAnimation.textContent = ''; // Clear spinner
        bootLoaderText.classList.add('blinker'); // Add blinker for final text
        // Ensure final color is red when 100% is reached
        bootLoaderText.style.color = `rgb(${endR}, ${endG}, ${endB})`;
    }


    // Complete loading
    if (percent >= 100) {
      clearInterval(interval);
      // Ensure the very last message is added if the loop finishes exactly at 100%
      if (messageIndex < messages.length) {
        const line = document.createElement('div');
        line.className = 'boot-log-line';
        line.textContent = messages[messages.length - 1]; // Add the very last message
        bootLog.appendChild(line);
        bootLog.scrollTop = bootLog.scrollHeight;
      }

      setTimeout(() => {
        bootScreen.classList.add("fade-out");
        bootScreen.addEventListener("transitionend", () => {
          bootScreen.remove(); // Use remove() instead of display = 'none' for cleaner DOM
        }, { once: true }); // Ensure listener runs only once
      }, 1000); // Wait a bit after 100% is reached before fading
    }
  }, 80); // Interval speed
});
