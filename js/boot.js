window.addEventListener("DOMContentLoaded", () => {
  const bootScreen = document.getElementById("bootScreen");
  const bootLog = document.getElementById("bootLog"); // Get the bootLog element
  const bootLoaderText = document.getElementById("bootLoaderText"); // Get the new loader text element
  const loadingAnimation = document.getElementById("loadingAnimation"); // Get the new loading animation element

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

const dialogueTextsStatic = [
  "Welcome to Matrix™",
  "Find all your essentials here to get started.",
  "More than 4 accounts per device will result in reduced grind!",
  "Sign up with Matrix above to manage with ease.",
  "Good luck, Matrix."
];

const dialogueTextElem = document.getElementById("dialogue-text");

let dialogueIndex = 0;
let charIndex = 0;

const typingSpeed = 50; // ms per character
const pauseBetweenLines = 1500; // ms pause after full text is displayed

// --- Time injection helper ---
let injectedTime = null;
function getNow() {
  return injectedTime ? new Date(injectedTime) : new Date();
}
// To inject time externally:
// window.injectTimeForDialogues = function(dateOrISOString) { injectedTime = new Date(dateOrISOString); }

//////////////////////////////////////////////////////////
// Utility functions

function getUTCDateAt(hour, minute, dayOffset = 0, baseDate = null) {
  const now = baseDate ? new Date(baseDate) : getNow();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset, hour, minute, 0));
}

function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function getNextWeeklyUTCDate(targetDay, hour, minute, baseDate = null) {
  const now = baseDate ? new Date(baseDate) : getNow();
  const todayDay = now.getUTCDay();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute, 0));
  let daysToAdd = (targetDay + 7 - todayDay) % 7;
  if (daysToAdd === 0 && todayUTC <= now) {
    daysToAdd = 7;
  }
  return addDays(todayUTC, daysToAdd);
}

function getNextDailyUTCDate(hour, minute, baseDate = null) {
  const now = baseDate ? new Date(baseDate) : getNow();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute, 0));
  if (todayUTC > now) return todayUTC;
  else return addDays(todayUTC, 1);
}

function formatTimeDiff(diffMs) {
  if (diffMs < 0) return "0 seconds";
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days > 0) parts.push(days + (days === 1 ? " day" : " days"));
  if (hours > 0) parts.push(hours + (hours === 1 ? " hour" : " hours"));
  if (minutes > 0) parts.push(minutes + (minutes === 1 ? " minute" : " minutes"));
  if (seconds > 0) parts.push(seconds + (seconds === 1 ? " second" : " seconds"));

  return parts.slice(0, 3).join(", ") || "0 seconds";
}

// Server reset daily at 00:00 GMT
function getServerResetDialogue() {
  const nowUTC = getNow();
  const nextReset = getNextDailyUTCDate(0, 0);
  const diff = nextReset - nowUTC;
  return `Server will reset in ${formatTimeDiff(diff)}.`;
}

// Maintenance daily at 02:00 GMT
function getMaintenanceDialogue() {
  const nowUTC = getNow();
  const nextMaintenance = getNextDailyUTCDate(2, 0);
  const diff = nextMaintenance - nowUTC;
  return `Maintenance in ${formatTimeDiff(diff)}.`;
}

//////////////////////////////////////////////////////////
// Seven Beasts challenge (Tue/Thu/Sat)
const sevenBeastsDays = [2, 4, 6]; // Tuesday, Thursday, Saturday

const sevenBeastsWindowsTemplate = [
  { openH: 9, openM: 0, startH: 9, startM: 30, endH: 10, endM: 30 },
  { openH: 21, openM: 0, startH: 21, startM: 30, endH: 22, endM: 30 },
];

function getUpcomingSevenBeastsSessions() {
  const now = getNow();
  let sessions = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    let dayCandidate = (now.getUTCDay() + dayOffset) % 7;
    if (!sevenBeastsDays.includes(dayCandidate)) continue;

    let baseDate = addDays(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())), dayOffset);

    sevenBeastsWindowsTemplate.forEach(ws => {
      let open = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate(), ws.openH, ws.openM, 0));
      let start = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate(), ws.startH, ws.startM, 0));
      let end = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate(), ws.endH, ws.endM, 0));
      sessions.push({ open, start, end });
    });
  }

  sessions.sort((a, b) => a.open - b.open);
  return sessions;
}

function getSevenBeastsDialogues() {
  const now = getNow();
  const sessions = getUpcomingSevenBeastsSessions();

  for (const session of sessions) {
    if (now < session.open) {
      let untilOpen = session.open - now;
      let color = untilOpen <= 30 * 60 * 1000 ? "yellow" : null;
      return {
        willOpen: { text: `Seven Beasts gate will open in ${formatTimeDiff(untilOpen)}.`, color },
        hasOpened: null,
      };
    }
    if (now >= session.open && now < session.start) {
      let remainGate = session.start - now;
      return {
        willOpen: null,
        hasOpened: { text: `Seven Beasts gate has opened for ${formatTimeDiff(remainGate)} — enter now!`, color: "green" },
      };
    }
    if (now >= session.start && now < session.end) {
      let remainLive = session.end - now;
      return {
        willOpen: null,
        hasOpened: { text: `Seven Beasts challenge is live for ${formatTimeDiff(remainLive)} — gates closed!`, color: "red" },
      };
    }
  }

  let nextSessionDay = getNextWeeklyUTCDate(sevenBeastsDays[0], sevenBeastsWindowsTemplate[0].openH, sevenBeastsWindowsTemplate[0].openM, now);
  let diff = nextSessionDay - now;
  return {
    willOpen: { text: `Seven Beasts challenge is not scheduled soon. Next gate will open in ${formatTimeDiff(diff)}.`, color: null },
    hasOpened: null,
  };
}

//////////////////////////////////////////////////////////
// Yin-Yang Battlefield windows per level group

const yinYangWindows = [
  { levelRange: "Lv30-59", openH: 17, openM: 0, startH: 17, startM: 30, endH: 18, endM: 30 },
  { levelRange: "Lv60-89", openH: 19, openM: 0, startH: 19, startM: 30, endH: 20, endM: 30 },
  { levelRange: "Lv90-130", openH: 21, openM: 0, startH: 21, startM: 30, endH: 22, endM: 30 },
];

function getYinYangDialogues() {
  const now = getNow();
  let dialogues = [];

  yinYangWindows.forEach(win => {
    let openToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), win.openH, win.openM, 0));
    let startToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), win.startH, win.startM, 0));
    let endToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), win.endH, win.endM, 0));

    if (now < openToday) {
      let untilOpen = openToday - now;
      let color = untilOpen <= 30 * 60 * 1000 ? "yellow" : null;
      dialogues.push({
        willOpen: { text: `Yin-Yang Battlefield ${win.levelRange} will open in ${formatTimeDiff(untilOpen)}.`, color },
        hasOpened: null,
      });
    } else if (now >= openToday && now < startToday) {
      let remainGate = startToday - now;
      dialogues.push({
        willOpen: null,
        hasOpened: { text: `Yin-Yang Battlefield ${win.levelRange} is now open for ${formatTimeDiff(remainGate)} — enter now!`, color: "green" }
      });
    } else if (now >= startToday && now < endToday) {
      let remainLive = endToday - now;
      dialogues.push({
        willOpen: null,
        hasOpened: { text: `Yin-Yang Battlefield ${win.levelRange} is live for ${formatTimeDiff(remainLive)} — door closed!`, color: "red" }
      });
    } else {
      let openTomorrow = new Date(openToday);
      openTomorrow.setUTCDate(openTomorrow.getUTCDate() + 1);
      let untilOpenTomorrow = openTomorrow - now;
      dialogues.push({
        willOpen: { text: `Yin-Yang Battlefield ${win.levelRange} will open in ${formatTimeDiff(untilOpenTomorrow)}.`, color: null },
        hasOpened: null,
      });
    }
  });

  return dialogues;
}

//////////////////////////////////////////////////////////
// Compose dialogue list with color info

function updateDialogueTexts() {
  const dialogues = [];

  dialogues.push({ text: getServerResetDialogue(), color: null });
  dialogues.push({ text: getMaintenanceDialogue(), color: null });

  const sevenBeasts = getSevenBeastsDialogues();
  if (sevenBeasts.willOpen) dialogues.push(sevenBeasts.willOpen);
  if (sevenBeasts.hasOpened) dialogues.push(sevenBeasts.hasOpened);

  const yinYangArr = getYinYangDialogues();
  yinYangArr.forEach(obj => {
    if (obj.willOpen) dialogues.push(obj.willOpen);
    if (obj.hasOpened) dialogues.push(obj.hasOpened);
  });

  dialogueTextsStatic.forEach(txt => dialogues.push({ text: txt, color: null }));

  return dialogues;
}

//////////////////////////////////////////////////////////
// Typing effect with dynamic color

let dialogueTexts = updateDialogueTexts();

function typeDialogue() {
  if (dialogueIndex >= dialogueTexts.length) {
    dialogueIndex = 0;
    dialogueTexts = updateDialogueTexts();
  }

  // Set color only at the start of each dialogue line
  if (charIndex === 0) {
    let color = dialogueTexts[dialogueIndex].color;
    dialogueTextElem.style.color = color || "";
    dialogueTextElem.textContent = "";
  }

  if (charIndex < dialogueTexts[dialogueIndex].text.length) {
    dialogueTextElem.textContent += dialogueTexts[dialogueIndex].text.charAt(charIndex);
    charIndex++;
    setTimeout(typeDialogue, typingSpeed);
  } else {
    setTimeout(() => {
      charIndex = 0;
      dialogueIndex++;
      typeDialogue();
    }, pauseBetweenLines);
  }
}

// Expose for time injection testing
window.injectTimeForDialogues = function(dateOrISOString) {
  injectedTime = dateOrISOString ? new Date(dateOrISOString) : null;
  dialogueTexts = updateDialogueTexts();
  dialogueIndex = 0;
  charIndex = 0;
  dialogueTextElem.textContent = "";
  typeDialogue();
};

// Start typing effect live
typeDialogue();