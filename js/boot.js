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
  "Find all your essentials here to get started",
  "More than 4 accounts per device will result in reduced grind!",
  "Sign up with Matrix above to manage with ease",
  "Good luck, Matrix."
];

const dialogueTextElem = document.getElementById("dialogue-text");

let dialogueIndex = 0;
let charIndex = 0;

const typingSpeed = 50; // ms per character
const pauseBetweenLines = 1500; // ms pause after full text is displayed

// -- Utility to get next occurrence of a daily UTC event at hour:min --
function getNextDailyUTCDate(hour, minute) {
  const nowUTC = new Date(new Date().toISOString());
  let target = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate(), hour, minute, 0));
  if (target <= nowUTC) {
    // If event today already passed, schedule for tomorrow
    target.setUTCDate(target.getUTCDate() + 1);
  }
  return target;
}

// -- Utility to get next occurrence of a weekly UTC event on dayOfWeek at hour:min --
function getNextWeeklyUTCDate(dayOfWeek, hour, minute) {
  const nowUTC = new Date(new Date().toISOString());
  const nowDay = nowUTC.getUTCDay();
  let daysToAdd = (dayOfWeek - nowDay + 7) % 7;
  let target = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate(), hour, minute, 0));
  if (daysToAdd === 0 && target <= nowUTC) {
    daysToAdd = 7;
  }
  target.setUTCDate(target.getUTCDate() + daysToAdd);
  return target;
}

// -- Format diff (ms) into string with up to 3 biggest parts --
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
  const nowUTC = new Date(new Date().toISOString());
  const nextReset = getNextDailyUTCDate(0, 0);
  const diff = nextReset - nowUTC;
  return `Server will reset in ${formatTimeDiff(diff)}`;
}

// Maintenance daily at 02:00 GMT
function getMaintenanceDialogue() {
  const nowUTC = new Date(new Date().toISOString());
  const nextMaintenance = getNextDailyUTCDate(2, 0);
  const diff = nextMaintenance - nowUTC;
  return `Maintenance in ${formatTimeDiff(diff)}`;
}

// Seven Beasts challenge (Tue/Thu/Sat), two windows
const sevenBeastsDays = [2, 4, 6];
const sevenBeastsWindows = [
  { open: [9, 0], start: [9, 30], end: [10, 30] },
  { open: [21, 0], start: [21, 30], end: [22, 30] },
];

function getSevenBeastsDialogues() {
  const nowUTC = new Date(new Date().toISOString());
  let nextOpening = null;
  let nextStart = null;
  let nextEnd = null;
  let status = null; // "willOpen", "gateOpen", "live"

  // We'll examine each upcoming window & find current or next
  // windows sorted by next occurrence

  // Generate all upcoming windows for next 7 days:
  const upcomingWindows = [];

  for (let i = 0; i < 7; i++) {
    const day = (nowUTC.getUTCDay() + i) % 7;
    if (!sevenBeastsDays.includes(day)) continue;

    sevenBeastsWindows.forEach(w => {
      const gateOpen = getNextWeeklyUTCDate(day, w.open[0], w.open[1]);
      const start = getNextWeeklyUTCDate(day, w.start[0], w.start[1]);
      const end = getNextWeeklyUTCDate(day, w.end[0], w.end[1]);

      upcomingWindows.push({ gateOpen, start, end });
    });
  }

  // Sort windows by gateOpen
  upcomingWindows.sort((a, b) => a.gateOpen - b.gateOpen);

  for (const w of upcomingWindows) {
    if (nowUTC >= w.gateOpen && nowUTC < w.start) {
      // Gate open before challenge start
      status = "gateOpen";
      nextOpening = w.gateOpen;
      nextStart = w.start;
      break;
    }
    if (nowUTC >= w.start && nowUTC < w.end) {
      // Challenge live
      status = "live";
      nextStart = w.start;
      nextEnd = w.end;
      break;
    }
    if (nowUTC < w.gateOpen) {
      // Next upcoming window
      status = "willOpen";
      nextOpening = w.gateOpen;
      break;
    }
  }

  if (status === "gateOpen") {
    const untilStart = nextStart - nowUTC;
    return {
      willOpen: null,
      hasOpened: `Seven Beasts gate has opened, starts in ${formatTimeDiff(untilStart)}`,
    };
  } else if (status === "live") {
    const untilEnd = nextEnd - nowUTC;
    return {
      willOpen: null,
      hasOpened: `Seven Beasts challenge is live, ends in ${formatTimeDiff(untilEnd)}`,
    };
  } else if (status === "willOpen") {
    const untilOpen = nextOpening - nowUTC;
    return {
      willOpen: `Seven Beasts gate will open in ${formatTimeDiff(untilOpen)}`,
      hasOpened: null,
    };
  } else {
    return {
      willOpen: `Seven Beasts challenge is not scheduled soon.`,
      hasOpened: null,
    };
  }
}

// Yin-Yang Battlefield windows per level group (all happen daily)
const yinYangWindows = [
  {
    levelRange: "Lv30-59",
    open: [17, 0],
    start: [17, 30],
    end: [18, 30],
  },
  {
    levelRange: "Lv60-89",
    open: [19, 0],
    start: [19, 30],
    end: [20, 30],
  },
  {
    levelRange: "Lv90-130",
    open: [21, 0],
    start: [21, 30],
    end: [22, 30],
  }
];

function getYinYangDialogues() {
  const nowUTC = new Date(new Date().toISOString());

  const dialogues = [];

  yinYangWindows.forEach(win => {
    const gateOpen = getNextDailyUTCDate(win.open[0], win.open[1]);
    const start = getNextDailyUTCDate(win.start[0], win.start[1]);
    const end = getNextDailyUTCDate(win.end[0], win.end[1]);

    if (nowUTC >= gateOpen && nowUTC < start) {
      const untilStart = start - nowUTC;
      dialogues.push({
        willOpen: null,
        hasOpened: `Yin-Yang Battlefield ${win.levelRange} has opened, starts in ${formatTimeDiff(untilStart)}`,
      });
    } else if (nowUTC >= start && nowUTC < end) {
      const untilEnd = end - nowUTC;
      dialogues.push({
        willOpen: null,
        hasOpened: `Yin-Yang Battlefield ${win.levelRange} is live, ends in ${formatTimeDiff(untilEnd)}`,
      });
    } else if (nowUTC < gateOpen) {
      const untilOpen = gateOpen - nowUTC;
      dialogues.push({
        willOpen: `Yin-Yang Battlefield ${win.levelRange} will open in ${formatTimeDiff(untilOpen)}`,
        hasOpened: null,
      });
    } else {
      // After today's event ended, countdown to tomorrow's next event
      const gateOpenTomorrow = new Date(gateOpen);
      gateOpenTomorrow.setUTCDate(gateOpenTomorrow.getUTCDate() + 1);
      const untilOpen = gateOpenTomorrow - nowUTC;
      dialogues.push({
        willOpen: `Yin-Yang Battlefield ${win.levelRange} will open in ${formatTimeDiff(untilOpen)}`,
        hasOpened: null,
      });
    }
  });

  return dialogues;
}

// Compose all dynamic dialogues before each cycle
function updateDialogueTexts() {
  const dialogues = [];

  dialogues.push(getServerResetDialogue());
  dialogues.push(getMaintenanceDialogue());

  const sevenBeasts = getSevenBeastsDialogues();
  if (sevenBeasts.willOpen) dialogues.push(sevenBeasts.willOpen);
  if (sevenBeasts.hasOpened) dialogues.push(sevenBeasts.hasOpened);

  const yinYangArr = getYinYangDialogues();
  yinYangArr.forEach(obj => {
    if (obj.willOpen) dialogues.push(obj.willOpen);
    if (obj.hasOpened) dialogues.push(obj.hasOpened);
  });

  // Append your static dialogues after dynamic ones
  return [...dialogues, ...dialogueTextsStatic];
}

let dialogueTexts = updateDialogueTexts();

function typeDialogue() {
  if (charIndex < dialogueTexts[dialogueIndex].length) {
    dialogueTextElem.textContent += dialogueTexts[dialogueIndex].charAt(charIndex);
    charIndex++;
    setTimeout(typeDialogue, typingSpeed);
  } else {
    setTimeout(() => {
      dialogueIndex++;
      if (dialogueIndex >= dialogueTexts.length) {
        dialogueIndex = 0;
        dialogueTexts = updateDialogueTexts(); // refresh dynamic dialogues
      }
      charIndex = 0;
      dialogueTextElem.textContent = "";
      typeDialogue();
    }, pauseBetweenLines);
  }
}

// Start typing when ready
typeDialogue();