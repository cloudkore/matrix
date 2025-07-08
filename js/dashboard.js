// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCwEZaP_Oc7MRwfxIXyq0k7sH4LQBEc3YY",
    authDomain: "matrix-nso.firebaseapp.com",
    projectId: "matrix-nso",
    storageBucket: "matrix-nso.appspot.com",
    messagingSenderId: "32108162722",
    appId: "1:32108162722:web:7c80d154d4120111f271fb"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage(); // Firebase Storage is still here but won't be used for user files

// --- Supabase Configuration ---
const SUPABASE_URL = 'https://pshuqmmkxmwgmvhuaujn.supabase.co'; // e.g., 'https://abcdefghijk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzaHVxbW1reG13Z212aHVauWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzI4NDIsImV4cCI6MjA2NDg0ODg0Mn0.SiJ9fEjW-e-x8DOREhuS1snrAe-IuBeE5r3tNzjtPFw'; // e.g., 'eyJ... (public key)'

// CORRECTED LINE: Access the global 'supabase' object from the window
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DOM Elements ---
const setupSection = document.getElementById('setup-section');
const mainDashboard = document.getElementById('main-dashboard');
const usernameInput = document.getElementById('usernameInput');
const currentAvatarDisplay = document.getElementById('currentAvatarDisplay');
const prevAvatarBtn = document.getElementById('prevAvatarBtn');
const nextAvatarBtn = document.getElementById('nextAvatarBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const dashboardUsername = document.getElementById('dashboard-username');
const userAvatar = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logoutBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const customMessageBox = document.getElementById('customMessageBox');
const messageBoxText = document.getElementById('messageBoxText');
// Language Selector DOM element
const languageSelect = document.getElementById('language-select');

const notesModal = document.getElementById('notesModal');
const notesBtn = document.getElementById('notesBtn'); // Corrected typo here
const noteInput = document.getElementById('noteInput');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const savedNotesDisplay = document.getElementById('savedNotesDisplay');

const passwordManagerModal = document.getElementById('passwordManagerModal');
const passwordManagerBtn = document.getElementById('passwordManagerBtn');
const pmServiceNameInput = document.getElementById('pmServiceName');
const pmUsernameInput = document.getElementById('pmUsername');
const pmPasswordInput = document.getElementById('pmPassword');
const savePmEntryBtn = document.getElementById('savePmEntryBtn');
const pmEntryList = document.getElementById('pmEntryList');

const deleteAccountConfirmModal = document.getElementById('deleteAccountConfirmModal');
const confirmDeleteAccountBtn = document.getElementById('confirmDeleteAccountBtn');
const cancelDeleteAccountBtn = document = document.getElementById('cancelDeleteAccountBtn');

// Master password unlock modal (for returning users)
const masterPasswordPromptModal = document.getElementById('masterPasswordPromptModal');
const masterPasswordUnlockInput = document.getElementById('masterPasswordUnlockInput');
const unlockDashboardBtn = document.getElementById('unlockDashboardBtn');
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

// Ephemeral Files DOM elements
const ephemeralFilesModal = document.getElementById('ephemeralFilesModal');
const ephemeralFilesBtn = document.getElementById('ephemeralFilesBtn');
const fileUploadInput = document.getElementById('fileUploadInput');
const uploadFileBtn = document.getElementById('uploadFileBtn');
const fileListDisplay = document.getElementById('fileListDisplay');

// File Deletion Confirmation Modal DOM elements
const deleteFileConfirmModal = document.getElementById('deleteFileConfirmModal');
const confirmDeleteFileBtn = document.getElementById('confirmDeleteFileBtn');
const cancelDeleteFileBtn = document.getElementById('cancelDeleteFileBtn');

// NEW: Note Deletion Confirmation Modal DOM elements
const deleteNoteConfirmModal = document.getElementById('deleteNoteConfirmModal');
const confirmDeleteNoteBtn = document.getElementById('confirmDeleteNoteBtn');
const cancelDeleteNoteBtn = document.getElementById('cancelDeleteNoteBtn');

// NEW: Password Manager Entry Deletion Confirmation Modal DOM elements
const deletePmEntryConfirmModal = document.getElementById('deletePmEntryConfirmModal');
const confirmDeletePmEntryBtn = document.getElementById('confirmDeletePmEntryBtn');
const cancelDeletePmEntryBtn = document.getElementById('cancelDeletePmEntryBtn');


// Progress Bar DOM elements (will still be displayed but percentage might be less accurate for Edge Functions)
const fileUploadProgressBarContainer = document.getElementById('fileUploadProgressBarContainer');
const fileUploadProgressBar = document.getElementById('fileUploadProgressBar');
const fileUploadProgressText = document.getElementById('fileUploadProgressText');

const serverBtn = document.getElementById('serverBtn');


// --- Global Variables ---
let currentAvatarIndex = 0;
let allAvatars = [];
let currentUser = null;
let currentEncryptionKey = null; // This will hold the derived encryption key for the session
let fileToDeleteName = null; // To store the name of the file to be deleted
let noteToDeleteId = null; // NEW: To store the ID of the note to be deleted
let pmEntryToDeleteId = null; // NEW: To store the ID of the password manager entry to be deleted

// Session expiration logic (5 mins inactivity) - ADD THIS BLOCK
let sessionExpiryTimer = null;
function startSessionTimer() {
    clearTimeout(sessionExpiryTimer);
    sessionExpiryTimer = setTimeout(() => {
        console.warn("Session expired due to inactivity. Clearing encryption key.");
        currentEncryptionKey = null;
        sessionStorage.removeItem('currentEncryptionKeyHex');
        showMessageBox(getTranslation("message_box_session_expired_re_enter_master_password"), 'warning'); // Use getTranslation here
    }, 5 * 60 * 1000); // 5 minutes
}

document.addEventListener('mousemove', startSessionTimer);
document.addEventListener('keydown', startSessionTimer);
document.addEventListener('click', startSessionTimer);
startSessionTimer(); // start on load

// Throttle master password unlock attempts - ADD THESE VARIABLES
let failedUnlockAttempts = 0;
const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME = 30 * 1000; // 30 sec
let unlockLocked = false;

// --- Internationalization Variables and Functions ---
let translations = {}; // Global variable to hold the current language translations

// Function to fetch translations based on the selected language
async function loadTranslations(lang) {
    try {
        const response = await fetch(`languages/${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        translations = await response.json();
        console.log(`Translations loaded for ${lang}:`, translations);
        applyTranslations();
        // Store selected language in localStorage for persistence
        localStorage.setItem('selectedLanguage', lang);
    } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to English if loading fails
        if (lang !== 'en') {
            console.warn('Falling back to English translations.');
            loadTranslations('en');
        }
    }
}

// Function to get a translated string by key
function getTranslation(key) {
    // Returns translated text or a fallback string if key is not found
    return translations[key] || `[${key}]`;
}

// Function to apply translations to all elements with data-translate-key attribute
function applyTranslations() {
    console.log("Applying translations...");

    // Translate dashboard title
    document.title = getTranslation('dashboard_title');

    $('[data-translate-key]').each(function() {
        const key = $(this).data('translate-key');
        let translatedText = getTranslation(key);

        // Handle placeholders for input/textarea elements
        if ($(this).is('input[placeholder], textarea[placeholder]')) {
            $(this).attr('placeholder', translatedText);
        } else {
            // Check if the element has children before setting text, to preserve icons etc.
            if ($(this).children().length > 0) {
                // If it has children, only set the text content, preserving inner HTML structure
                $(this).contents().filter(function() {
                    return this.nodeType === 3; // Node.TEXT_NODE
                }).replaceWith(translatedText);
            } else {
                $(this).text(translatedText);
            }
        }
    });

if ($('#dashboard-username').length && currentUser && currentUser.displayName) {
    // First, set the static HTML structure
    $('#main-dashboard h2.welcome-message').html(getTranslation('welcome_message') + ` <span id="dashboard-username"></span>!`);
    // Then, safely insert the display name as plain text into the span
    $('#dashboard-username').text(currentUser.displayName);
}
}

// --- Utility Functions ---
function showMessageBox(messageKeyOrText, type = 'info', duration = 3000) {
    let messageToDisplay = messageKeyOrText;
    // Check if the input is a translation key (i.e., exists in the current translations)
    if (translations[messageKeyOrText]) {
        messageToDisplay = getTranslation(messageKeyOrText);
    }
    messageBoxText.innerText = messageToDisplay;
    customMessageBox.style.display = 'block';

    customMessageBox.style.backgroundColor = '#333';
    customMessageBox.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
    if (type === 'error') {
        customMessageBox.style.backgroundColor = '#ef4444';
        customMessageBox.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
    } else if (type === 'success') {
        customMessageBox.style.backgroundColor = '#22c55e';
        customMessageBox.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
    } else if (type === 'warning') {
        customMessageBox.style.backgroundColor = '#f59e0b';
        customMessageBox.style.boxShadow = '0 0 10px rgba(255, 255, 0, 0.5)';
    }

    setTimeout(() => {
        customMessageBox.style.display = 'none';
    }, duration);
}

function openModal(modalElement) {
    modalElement.style.display = 'flex';
}

function closeModal(modalElement) {
    modalElement.style.display = 'none';
}

// --- Encryption/Decryption Functions (Using derived key) ---
function encryptData(dataToEncrypt) {
    if (!currentEncryptionKey) {
        console.error("Encryption key not available. Cannot encrypt data.");
        showMessageBox(getTranslation("encryption_key_not_available_error"), "error");
        return null;
    }
    const iv = CryptoJS.lib.WordArray.random(128 / 8);
    const encrypted = CryptoJS.AES.encrypt(dataToEncrypt, currentEncryptionKey, { iv: iv });
    return iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.toString();
}

function decryptData(encryptedData) {
    if (!currentEncryptionKey) {
        return null; // Don't show message here, let the calling function handle the unlock prompt
    }
    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 2) throw new Error("Invalid encrypted data format.");
        const iv = CryptoJS.enc.Hex.parse(parts[0]);
        const ciphertext = parts[1];

        const decrypted = CryptoJS.AES.decrypt(ciphertext, currentEncryptionKey, { iv: iv });
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption failed:", error);
        showMessageBox(getTranslation("decryption_failed_error"), "error");
        return null;
    }
}

// --- Key Derivation Functions (Consistent with login.js) ---
const PBKDF2_ITERATIONS = 200000;
const KEY_SIZE = 256 / 32;

function generateSalt() {
    return CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
}

async function deriveKey(masterPassword, salt) {
    return CryptoJS.PBKDF2(masterPassword, CryptoJS.enc.Hex.parse(salt), {
        keySize: KEY_SIZE,
        iterations: PBKDF2_ITERATIONS,
        hasher: CryptoJS.algo.SHA256 // Corrected from SHA265 to SHA256
    });
}

// --- Avatar Loading ---
async function loadAvatars() {
    try {
        const response = await fetch('avatars/avatars.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allAvatars = await response.json();
        if (allAvatars.length > 0) {
            currentAvatarDisplay.src = `avatars/${allAvatars[currentAvatarIndex]}`;
        } else {
            console.warn("No avatars found in avatars.json.");
            currentAvatarDisplay.src = "https://placehold.co/100x100?text=No+Avatars";
        }
    } catch (error) {
        console.error("Error loading avatars:", error);
        showMessageBox(getTranslation("could_not_load_avatars_error"), "error");
        currentAvatarDisplay.src = "https://placehold.co/100x100?text=Error";
    }
}

function updateAvatarDisplay() {
    if (allAvatars.length > 0) {
        currentAvatarDisplay.src = `avatars/${allAvatars[currentAvatarIndex]}`;
    }
}

prevAvatarBtn.onclick = () => {
    currentAvatarIndex = (currentAvatarIndex - 1 + allAvatars.length) % allAvatars.length;
    updateAvatarDisplay();
};

nextAvatarBtn.onclick = () => {
    currentAvatarIndex = (currentAvatarIndex + 1) % allAvatars.length;
    updateAvatarDisplay();
};

// --- Firebase Authentication & Profile Management ---

async function saveProfile(user) {
    console.log("saveProfile called.");
    const username = usernameInput.value.trim();
    const selectedAvatar = allAvatars[currentAvatarIndex];

    const playerDocRef = db.collection('players').doc(user.uid);
    const playerDoc = await playerDocRef.get();
    const data = playerDoc.exists ? playerDoc.data() : {};

    if (!username || !selectedAvatar) {
        showMessageBox(getTranslation("message_box_please_enter_username_avatar"), "error");
        return;
    }

    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = getTranslation("saving_status"); // Use translation key for "Saving..."

    try {
        const updateData = {
            username: username,
            avatar: selectedAvatar,
            level: data.level || 1 // Preserve existing level or set default
        };

        await db.collection('players').doc(user.uid).set(updateData, { merge: true });

        showMessageBox(getTranslation("message_box_profile_saved_success"), "success");

        setupSection.style.display = 'none';
        mainDashboard.style.display = 'block';
        dashboardUsername.textContent = username;
        userAvatar.src = `avatars/${selectedAvatar}`;

        applyTranslations();

    } catch (error) {
        console.error("Error saving profile:", error);
        showMessageBox(getTranslation("message_box_failed_to_save_profile") + error.message, "error");
    } finally {
        saveProfileBtn.disabled = false;
        saveProfileBtn.textContent = getTranslation("save_profile_button");
    }
}

async function setupDashboard(user) {
    currentUser = user;
    const playerDocRef = db.collection('players').doc(user.uid);
    console.log("setupDashboard called for user:", user.uid);

    try {
        const doc = await playerDocRef.get();
        const data = doc.exists ? doc.data() : {};
        console.log("User data from Firestore:", data);

        const hasUsername = !!data.username;
        const hasAvatar = !!data.avatar;
        const hasSalt = !!data.salt; // Check if salt exists (implies master password set)
        const hasMasterPasswordHash = !!data.masterPasswordHash;
        const lastLoginTimestamp = data.lastLogin; // Get existing last login timestamp

        console.log(`Debug: hasUsername: ${hasUsername}, hasAvatar: ${hasAvatar}, hasSalt: ${hasSalt}, hasMasterPasswordHash: ${hasMasterPasswordHash}, lastLogin: ${lastLoginTimestamp}`);

        // Try to restore encryption key from session storage
        const storedKeyHex = sessionStorage.getItem('currentEncryptionKeyHex');
        if (storedKeyHex) {
            try {
                currentEncryptionKey = CryptoJS.enc.Hex.parse(storedKeyHex);
                console.log("Encryption key restored from sessionStorage.");
                // OPTIONAL: You might want to extend the session timer here if a key is successfully restored
                // startSessionTimer();
            } catch (e) {
                console.error("Failed to restore encryption key from sessionStorage:", e);
                sessionStorage.removeItem('currentEncryptionKeyHex'); // Clear invalid key
                currentEncryptionKey = null;
            }
        } else {
            currentEncryptionKey = null; // Ensure it's null if not found
        }

        // Scenario 1: User needs to complete their profile (username or avatar is missing)
        if (!hasUsername || !hasAvatar) {
            console.log("Showing unified setup section: Username or avatar missing.");
            setupSection.style.display = 'flex';
            mainDashboard.style.display = 'none';
            closeModal(masterPasswordPromptModal); // Ensure modal is closed

            usernameInput.value = data.username || '';

            if (allAvatars.length === 0) {
                await loadAvatars();
            }
            const avatarFileName = data.avatar && allAvatars.includes(data.avatar) ? data.avatar : allAvatars[0] || 'default_avatar.png';
            currentAvatarIndex = allAvatars.indexOf(avatarFileName);
            if (currentAvatarIndex === -1 && allAvatars.length > 0) {
                currentAvatarIndex = 0;
            } else if (allAvatars.length === 0) {
                currentAvatarDisplay.src = "https://placehold.co/100x100?text=No+Avatars";
            }
            updateAvatarDisplay();

            applyTranslations(); // Apply translations to setup section elements
            return; // Exit setupDashboard as profile setup is required
        }

        // Scenario 2: User has complete profile. Now just display dashboard.
        // The master password prompt will *only* be shown when accessing sensitive features.
        console.log("User has complete profile. Displaying main dashboard.");
        dashboardUsername.textContent = data.username;
        userAvatar.src = `avatars/${data.avatar}`;
        setupSection.style.display = 'none';
        mainDashboard.style.display = 'block';
        closeModal(masterPasswordPromptModal); // Ensure modal is closed if it was open for some reason

        // Update and display last login time
        const lastLoginDisplay = document.getElementById('lastLoginDisplay');
        if (lastLoginDisplay) {
            if (lastLoginTimestamp) {
                const date = lastLoginTimestamp.toDate(); // Convert Firestore Timestamp to Date object
                lastLoginDisplay.innerHTML = `${getTranslation("last_login_label")}: ${date.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`;
            } else {
                lastLoginDisplay.innerHTML = `${getTranslation("last_login_label")}: ${getTranslation("never")}`; // Or a placeholder like "Never"
            }
            // Update last login timestamp in Firestore
            await playerDocRef.set({ lastLogin: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
        }


        // Apply translations once the dashboard is shown
        applyTranslations();

    } catch (error) {
        console.error("Error setting up dashboard:", error);
        showMessageBox(getTranslation("message_box_failed_to_load_dashboard") + error.message, "error");
        setupSection.style.display = 'none';
        mainDashboard.style.display = 'none';
        closeModal(masterPasswordPromptModal);
    }
}

// Handler for unlocking the dashboard with master password (triggered by modal)
unlockDashboardBtn.onclick = async () => {
    if (unlockLocked) {
        showMessageBox(getTranslation("message_box_too_many_failed_attempts"), "error"); // Use translation key
        return;
    }

    const masterPassword = masterPasswordUnlockInput.value.trim();
    if (!masterPassword) {
        showMessageBox(getTranslation("message_box_please_enter_master_password"), "error");
        return;
    }

    unlockDashboardBtn.disabled = true;
    unlockDashboardBtn.textContent = getTranslation("unlocking_status"); // Use translation key

    try {
        const playerDocRef = db.collection("players").doc(currentUser.uid);
        const playerDoc = await playerDocRef.get();
        const data = playerDoc.data();

        // If no salt or hash, means master password was never set, so prompt for setup
        if (!data || !data.salt || !data.masterPasswordHash) {
            showMessageBox(getTranslation("message_box_no_master_password_set_yet"), "info");
            closeModal(masterPasswordPromptModal);
            return;
        }

        const userSalt = data.salt;
        const storedMasterPasswordHash = data.masterPasswordHash;

        const derivedKeyForVerification = await deriveKey(masterPassword, userSalt);
        const derivedMasterPasswordHash = derivedKeyForVerification.toString(CryptoJS.enc.Hex);

        if (derivedMasterPasswordHash !== storedMasterPasswordHash) {
            failedUnlockAttempts++;
            if (failedUnlockAttempts >= MAX_ATTEMPTS) {
                unlockLocked = true;
                showMessageBox(getTranslation("message_box_incorrect_password_wait"), "error"); // Use translation key
                setTimeout(() => {
                    unlockLocked = false;
                    failedUnlockAttempts = 0;
                    showMessageBox(getTranslation("message_box_try_again"), "info"); // Inform user they can try again
                }, LOCKOUT_TIME);
            } else {
                showMessageBox(getTranslation("message_box_incorrect_master_password"), "error");
            }
            currentEncryptionKey = null; // Ensure key is null on failed attempt
            return;
        }

        currentEncryptionKey = derivedKeyForVerification; // Set the global encryption key for the session
        sessionStorage.setItem('currentEncryptionKeyHex', currentEncryptionKey.toString(CryptoJS.enc.Hex));

        closeModal(masterPasswordPromptModal);
        masterPasswordUnlockInput.value = '';
        failedUnlockAttempts = 0; // Reset attempts on success
        showMessageBox(getTranslation("message_box_dashboard_unlocked"), "success", 4000);
        console.log("Dashboard unlocked successfully.");

        // If the user was trying to access Notes/Password Manager/Files, re-open the respective modal
        if (notesModal.dataset.pendingOpen === 'true') {
            openModal(notesModal);
            loadNotes();
            notesModal.dataset.pendingOpen = 'false';
        } else if (passwordManagerModal.dataset.pendingOpen === 'true') {
            openModal(passwordManagerModal);
            loadPasswords();
            passwordManagerModal.dataset.pendingOpen = 'false';
        } else if (ephemeralFilesModal.dataset.pendingOpen === 'true') {
            openModal(ephemeralFilesModal);
            listFiles();
            ephemeralFilesModal.dataset.pendingOpen = 'false';
        }

    } catch (error) {
        console.error("Error unlocking dashboard:", error);
        showMessageBox(getTranslation("error_unlocking_dashboard_error") + error.message, "error");
        currentEncryptionKey = null; // Ensure key is null on error
    } finally {
        unlockDashboardBtn.disabled = false;
        unlockDashboardBtn.textContent = getTranslation("unlock_dashboard_button");
    }
};

// Add event listener for 'Enter' key on masterPasswordUnlockInput
masterPasswordUnlockInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        unlockDashboardBtn.click();
    }
});


// Event listener for profile save button
saveProfileBtn.onclick = () => {
    if (currentUser) {
        saveProfile(currentUser);
    } else {
        showMessageBox(getTranslation("message_box_please_login_first"), "error");
    }
};

// --- Authentication State Listener ---
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        setTimeout(() => {
            setupDashboard(user);
        }, 2000);
    } else {
        console.log("No user logged in. Redirecting to login.html.");
        setupSection.style.display = 'none';
        mainDashboard.style.display = 'none';
        dashboardUsername.textContent = '';
        userAvatar.src = '';
        usernameInput.value = '';
        currentEncryptionKey = null; // Clear encryption key on logout
        sessionStorage.removeItem('currentEncryptionKeyHex'); // Also remove from sessionStorage to be safe
        closeModal(masterPasswordPromptModal);
        currentAvatarIndex = 0;
        updateAvatarDisplay();
        if (window.location.pathname !== '/login.html') {
            window.location.href = "login.html";
        }
    }
});


// --- Dashboard Actions (Notes, Passwords) ---

// Listener for Notes Modal
notesBtn.onclick = () => {
    if (!currentEncryptionKey) {
        openModal(masterPasswordPromptModal);
        notesModal.dataset.pendingOpen = 'true'; // Mark notes modal to open after unlock
        masterPasswordUnlockInput.value = ''; // Clear previous input
        return;
    }
    openModal(notesModal);
    loadNotes();
};
notesModal.querySelector('.close-button').onclick = () => closeModal(notesModal);
saveNoteBtn.onclick = async () => {
    if (!currentUser || !currentEncryptionKey) {
        showMessageBox(getTranslation("message_box_please_unlock_dashboard"), "error");
        return;
    }
    const noteText = noteInput.value.trim();

    if (!noteText) {
        showMessageBox(getTranslation("message_box_note_empty"), "error");
        return;
    }

    try {
        const encryptedContent = encryptData(noteText);
        if (!encryptedContent) {
            throw new Error(getTranslation("message_box_encryption_failed"));
        }
        await db.collection('players').doc(currentUser.uid).collection('notes').add({
            content: encryptedContent,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        noteInput.value = '';
        showMessageBox(getTranslation("message_box_note_added_success"), "success");
    }
    catch (error) {
        console.error("Error adding note:", error);
        showMessageBox(getTranslation("message_box_failed_to_add_note") + error.message, "error");
    }
};

// NEW: Function to perform note deletion
async function performNoteDeletion(noteId) {
    if (!currentUser) {
        showMessageBox(getTranslation("message_box_please_login_delete_notes"), "error");
        return;
    }
    showMessageBox(getTranslation("message_box_deleting_note"), 'info', 1500);
    try {
        await db.collection('players').doc(currentUser.uid).collection('notes').doc(noteId).delete();
        showMessageBox(getTranslation("message_box_note_deleted_success"), "success");
    } catch (error) {
        console.error("Error deleting note:", error);
        showMessageBox(getTranslation("message_box_failed_to_delete_note") + error.message, "error");
    }
}

async function loadNotes() {
    if (!currentUser || !currentEncryptionKey) {
        savedNotesDisplay.innerHTML = `<p style="text-align: center; color: #94a3b8;">${getTranslation("unlock_dashboard_to_view_notes")}</p>`;
        return;
    }
    db.collection('players').doc(currentUser.uid).collection('notes')
        .orderBy('timestamp', "desc")
        .onSnapshot((snapshot) => {
            savedNotesDisplay.innerHTML = '';
            if (snapshot.empty) {
                savedNotesDisplay.innerHTML = `<p style="text-align: center; color: #94a3b8;">${getTranslation("no_notes_saved")}</p>`;
                return;
            }
            snapshot.forEach(doc => {
                const note = doc.data();
                const decryptedContent = decryptData(note.content);

                const noteDiv = document.createElement('div');
                const timestampP = document.createElement('p');
                // Timestamp is safe to use with innerHTML here as it's not user-controlled
                timestampP.innerHTML = `<strong>${note.timestamp ? new Date(note.timestamp.toDate()).toLocaleString() : getTranslation("saving_status")}</strong>`;

                const contentP = document.createElement('p');
                if (decryptedContent === null) {
                    contentP.style.color = 'red';
                    contentP.textContent = getTranslation("decryption_failed_invalid_data");
                } else {
                    // XSS PREVENTION: Use textContent for user-provided content
                    contentP.textContent = decryptedContent;
                }

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-note-btn btn btn-danger';
                deleteButton.dataset.noteId = doc.id;
                deleteButton.textContent = getTranslation("Delete");

                noteDiv.appendChild(timestampP);
                noteDiv.appendChild(contentP);
                noteDiv.appendChild(deleteButton);
                savedNotesDisplay.appendChild(noteDiv);
            });
            document.querySelectorAll('.delete-note-btn').forEach(button => {
                button.onclick = async (event) => {
                    noteToDeleteId = event.target.dataset.noteId; // Store note ID for confirmation
                    openModal(deleteNoteConfirmModal); // Open confirmation modal
                };
            });
        }, (error) => {
            console.error("Error loading notes:", error);
            showMessageBox(getTranslation("failed_to_load_notes_error") + error.message, "error");
        });
}

// Handle confirmation for note deletion
confirmDeleteNoteBtn.onclick = async () => {
    closeModal(deleteNoteConfirmModal);
    if (noteToDeleteId) {
        await performNoteDeletion(noteToDeleteId);
        noteToDeleteId = null; // Clear the stored note ID
    }
};

// Handle cancellation for note deletion
cancelDeleteNoteBtn.onclick = () => {
    closeModal(deleteNoteConfirmModal);
    showMessageBox(getTranslation("cancelled!"), "info", 2000); // Specific message for note deletion cancellation
    noteToDeleteId = null; // Clear the stored note ID if the user cancels
};


// Listener for Password Manager Modal
passwordManagerBtn.onclick = () => {
    if (!currentEncryptionKey) {
        openModal(masterPasswordPromptModal);
        passwordManagerModal.dataset.pendingOpen = 'true';
        masterPasswordUnlockInput.value = ''; // Clear previous input
        return;
    }
    openModal(passwordManagerModal);
    loadPasswords();
};
passwordManagerModal.querySelector('.close-button').onclick = () => closeModal(passwordManagerModal);
savePmEntryBtn.onclick = async () => {
    if (!currentUser || !currentEncryptionKey) {
        showMessageBox(getTranslation("message_box_please_unlock_dashboard"), "error");
        return;
    }
    const serviceName = pmServiceNameInput.value.trim();
    const pmUsername = pmUsernameInput.value.trim();
    const pmPassword = pmPasswordInput.value.trim();

    if (!serviceName || !pmUsername || !pmPassword) {
        showMessageBox(getTranslation("message_box_pm_all_fields_required"), "error");
        return;
    }

    try {
        const encryptedPassword = encryptData(pmPassword);
        if (!encryptedPassword) {
            throw new Error(getTranslation("message_box_encryption_failed"));
        }
        await db.collection('players').doc(currentUser.uid).collection('passwords').add({
            serviceName: serviceName,
            username: pmUsername,
            password: encryptedPassword,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        pmServiceNameInput.value = '';
        pmUsernameInput.value = '';
        pmPasswordInput.value = '';
        showMessageBox(getTranslation("message_box_password_added_success"), "success");
    } catch (error) {
        console.error("Error adding password:", error);
        showMessageBox(getTranslation("message_box_failed_to_add_password") + error.message, "error");
    }
};

// NEW: Function to perform password manager entry deletion
async function performPmEntryDeletion(entryId) {
    if (!currentUser) {
        showMessageBox(getTranslation("message_box_please_login_delete_pm_entries"), "error");
        return;
    }
    showMessageBox(getTranslation("message_box_deleting_pm_entry"), 'info', 1500);
    try {
        await db.collection('players').doc(currentUser.uid).collection('passwords').doc(entryId).delete();
        showMessageBox(getTranslation("message_box_pm_entry_deleted_success"), "success");
    } catch (error) {
        console.error("Error deleting password entry:", error);
        showMessageBox(getTranslation("message_box_failed_to_delete_pm_entry") + error.message, "error");
    }
}

async function loadPasswords() {
    if (!currentUser || !currentEncryptionKey) {
        pmEntryList.innerHTML = `<p style="text-align: center; color: #94a3b8;">${getTranslation("unlock_dashboard_to_view_passwords")}</p>`;
        return;
    }
    db.collection('players').doc(currentUser.uid).collection('passwords')
        .orderBy('timestamp', "desc")
        .onSnapshot((snapshot) => {
            pmEntryList.innerHTML = '';
            if (snapshot.empty) {
                pmEntryList.innerHTML = `<p style="text-align: center; color: #94a3b8;">${getTranslation("no_passwords_saved")}</p>`;
                return;
            }
            snapshot.forEach(doc => {
                const entry = doc.data();
                const decryptedContent = decryptData(entry.password);

                const entryDiv = document.createElement('div');
                const serviceP = document.createElement('p');
                serviceP.innerHTML = `<strong>${getTranslation("service_label")}:</strong> `;
                const serviceNameSpan = document.createElement('span');
                // XSS PREVENTION: Use textContent for user-provided serviceName
                serviceNameSpan.textContent = entry.serviceName;
                serviceP.appendChild(serviceNameSpan);

                const usernameP = document.createElement('p');
                usernameP.innerHTML = `<strong>${getTranslation("username_label")}:</strong> `;
                const usernameSpan = document.createElement('span');
                // XSS PREVENTION: Use textContent for user-provided username
                usernameSpan.textContent = entry.username;
                usernameP.appendChild(usernameSpan);

                const passwordP = document.createElement('p');
                passwordP.innerHTML = `<strong>${getTranslation("password_label")}:</strong> `;
                const decryptedPasswordSpan = document.createElement('span');
                decryptedPasswordSpan.className = 'decrypted-password';

                if (decryptedContent === null) {
                    decryptedPasswordSpan.style.color = 'red';
                    decryptedPasswordSpan.textContent = getTranslation("decryption_failed_invalid_data");
                } else {
                    // XSS PREVENTION: Use textContent for decrypted password
                    decryptedPasswordSpan.textContent = decryptedContent;
                }
                passwordP.appendChild(decryptedPasswordSpan);

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-pm-btn btn btn-danger';
                deleteButton.dataset.entryId = doc.id;
                deleteButton.textContent = getTranslation("Delete");

                entryDiv.appendChild(serviceP);
                entryDiv.appendChild(usernameP);
                entryDiv.appendChild(passwordP);
                entryDiv.appendChild(deleteButton);
                pmEntryList.appendChild(entryDiv);
            });
            document.querySelectorAll('.delete-pm-btn').forEach(button => {
                button.onclick = async (event) => {
                    pmEntryToDeleteId = event.target.dataset.entryId; // Store entry ID for confirmation
                    openModal(deletePmEntryConfirmModal); // Open confirmation modal
                };
            });
        }, (error) => {
            console.error("Error loading passwords:", error);
            showMessageBox(getTranslation("failed_to_load_passwords_error") + error.message, "error");
        });
}

// Handle confirmation for password manager entry deletion
confirmDeletePmEntryBtn.onclick = async () => {
    closeModal(deletePmEntryConfirmModal);
    if (pmEntryToDeleteId) {
        await performPmEntryDeletion(pmEntryToDeleteId);
        pmEntryToDeleteId = null; // Clear the stored entry ID
    }
};

// Handle cancellation for password manager entry deletion
cancelDeletePmEntryBtn.onclick = () => {
    closeModal(deletePmEntryConfirmModal);
    showMessageBox(getTranslation("cancelled!"), "info", 2000); // Specific message for PM entry deletion cancellation
    pmEntryToDeleteId = null; // Clear the stored entry ID if the user cancels
};

// --- Ephemeral Files Functionality ---
ephemeralFilesBtn.onclick = () => {
    if (!currentEncryptionKey) { // Only prompt for master password if key not available
        openModal(masterPasswordPromptModal);
        ephemeralFilesModal.dataset.pendingOpen = 'true'; // Mark files modal to open after unlock
        masterPasswordUnlockInput.value = ''; // Clear previous input
        return;
    }
    openModal(ephemeralFilesModal);
    listFiles();
};
ephemeralFilesModal.querySelector('.close-button').onclick = () => closeModal(ephemeralFilesModal);

uploadFileBtn.onclick = async () => {
    if (!currentUser) {
        showMessageBox(getTranslation("message_box_please_login_upload_files"), "error");
        return;
    }
    const file = fileUploadInput.files[0];
    if (!file) {
        showMessageBox(getTranslation("message_box_select_file_upload"), "error");
        return;
    }

    // --- NEW: File Size Limit Check ---
    const MAX_FILE_SIZE_MB = 5;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // Convert MB to Bytes

    if (file.size > MAX_FILE_SIZE_BYTES) {
        showMessageBox(getTranslation("Limit Exceeded!") + ` (${MAX_FILE_SIZE_MB}MB)`, "error", 5000);
        fileUploadInput.value = ''; // Clear the input
        return; // Prevent upload
    }
    // --- END NEW ---

    // Display progress elements
    fileUploadProgressBarContainer.style.display = 'block';
    fileUploadProgressBar.style.width = '0%';
    fileUploadProgressText.style.display = 'block';
    fileUploadProgressText.innerText = '0%';

    showMessageBox(getTranslation("message_box_uploading_file"), 'info', 0); // Keep message box open until upload completes

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', currentUser.uid);
        formData.append('fileName', file.name); // Send original file name

        const idToken = await currentUser.getIdToken();

        // --- START: XMLHttpRequest for upload progress ---
        const xhr = new XMLHttpRequest();

        // Setup the progress event listener
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                fileUploadProgressBar.style.width = `${percent}%`;
                fileUploadProgressText.innerText = `${percent}%`;
            }
        };

        // Setup the load (completion) event listener
        const responsePromise = new Promise((resolve, reject) => {
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (e) {
                        reject(new Error('Invalid JSON response from server.'));
                    }
                } else {
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        reject(new Error(errorData.message || `Server error: ${xhr.status}`));
                    } catch (e) {
                        reject(new Error(`HTTP error! Status: ${xhr.status}`));
                    }
                }
            };

            // Setup the error event listener
            xhr.onerror = () => {
                reject(new Error('Network error during file upload.'));
            };

            xhr.onabort = () => {
                reject(new Error('File upload aborted.'));
            };
        });


        xhr.open('POST', `${SUPABASE_URL}/functions/v1/upload-file`);
        xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
        xhr.send(formData);

        const result = await responsePromise;
        // --- END: XMLHttpRequest for upload progress ---

        console.log('File uploaded:', result);

        showMessageBox(getTranslation("message_box_file_uploaded_success"), "success", 3000); // Show success for 3 seconds
        fileUploadInput.value = ''; // Clear the input
        listFiles(); // Refresh file list
    } catch (error) {
        console.error("Error uploading file:", error);
        showMessageBox(getTranslation("message_box_failed_to_upload_file") + error.message, "error", 5000); // Show error for longer
    } finally {
        // Hide progress bar elements after upload attempt (success or failure)
        setTimeout(() => {
            fileUploadProgressBarContainer.style.display = 'none';
            fileUploadProgressText.style.display = 'none';
            fileUploadProgressBar.style.width = '0%'; // Reset bar
        }, 1000); // Give a moment for the final message to show
    }
};

// Function to handle the actual file deletion
async function performFileDeletion(fileName) {
    if (!currentUser) {
        showMessageBox(getTranslation("message_box_please_login_delete_files"), "error");
        return;
    }
    showMessageBox(getTranslation("message_box_deleting_file"), 'info', 1500);

    try {
        const idToken = await currentUser.getIdToken();
        // Reverting to fetch API call for Edge Function
        const response = await fetch(`${SUPABASE_URL}/functions/v1/delete-file`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ userId: currentUser.uid, fileName: fileName })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete file');
        }

        showMessageBox(getTranslation("message_box_file_deleted_success"), "success");
        listFiles(); // Refresh list after deletion
    } catch (error) {
        console.error("Error deleting file:", error);
        showMessageBox(getTranslation("message_box_failed_to_delete_file") + error.message, "error");
    }
}


async function listFiles() {
    if (!currentUser) {
        fileListDisplay.innerHTML = `<p style="text-align: center; color: #94a3b8;">${getTranslation("message_box_please_login_upload_files")}</p>`;
        return;
    }

    try {
        const idToken = await currentUser.getIdToken();
        // Reverting to fetch API call for Edge Function
        const response = await fetch(`${SUPABASE_URL}/functions/v1/list-files`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ userId: currentUser.uid })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to list files');
        }

        const files = await response.json();
        fileListDisplay.innerHTML = ''; // Clear existing list

        if (files.length === 0) {
            fileListDisplay.innerHTML = `<p style="text-align: center; color: #94a3b8;">${getTranslation("no_files_saved")}</p>`;
            return;
        }

        for (const file of files) { // Using for...of for async operations if needed, or simple forEach
            const fileElement = document.createElement('div');
            fileElement.classList.add('file-item');

            let formattedTimestamp = '';
            // Assuming the Edge Function returns `createdAt` in a format Date can parse
            if (file.createdAt) {
                const date = new Date(file.createdAt);
                formattedTimestamp = `Uploaded: ${date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }

            fileElement.innerHTML = `
    <span class="file-name">${file.name}</span>
    <span class="file-timestamp" style="font-size: 0.8em; color: #aaa; margin-left: 10px;">${formattedTimestamp}</span>
    <div class="file-actions">
        <button class="download-file-action-btn btn btn-info btn-sm"
                data-signed-url="${file.signedUrl}"
                data-original-file-name="${file.name}">
            ${getTranslation("download_file_button")}
        </button>
        <button class="delete-file-btn btn btn-danger btn-sm"
                data-file-name="${file.name}">
            ${getTranslation("delete_file_button")}</button>
    </div>
            `;
            fileListDisplay.appendChild(fileElement);
        }

        // --- Event Delegation for both Download and Delete buttons ---
        // Attach the listener once to the parent container (fileListDisplay)
        fileListDisplay.onclick = async (event) => {
            const target = event.target; // The actual element that was clicked

            // Handle Delete Button Click - Show confirmation modal
            if (target.classList.contains('delete-file-btn')) {
                fileToDeleteName = target.dataset.fileName; // Store file name for confirmation
                openModal(deleteFileConfirmModal);
            }

            // Handle Download Button Click
            if (target.classList.contains('download-file-action-btn')) {
                const signedUrl = target.dataset.signedUrl;
                const originalFileName = target.dataset.originalFileName;

                if (!signedUrl || !originalFileName) {
                    showMessageBox(getTranslation("download_link_error"), "error");
                    return;
                }

                showMessageBox(getTranslation("message_box_preparing_download"), "info", 2000);

                try {
                    const response = await fetch(signedUrl);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    const blob = await response.blob();

                    // --- START MODIFICATION HERE ---
                    // Check if Android interface is available
                    if (typeof Android !== 'undefined' && Android.onBlobDataReceived) {
                        const reader = new FileReader();
                        reader.onloadend = function() {
                            const base64DataWithPrefix = reader.result; // e.g., "data:image/png;base64,..."
                            // Extract just the Base64 part after the comma
                            const pureBase64 = base64DataWithPrefix.split(',')[1];
                            const mimeType = blob.type || 'application/octet-stream'; // Get the actual MIME type of the blob

                            // Call the Android function with the Base64 data, MIME type, and original filename
                            Android.onBlobDataReceived(pureBase64, mimeType, originalFileName);
                            showMessageBox(getTranslation("message_box_download_started"), "success", 2000);
                            console.log("File data sent to Android via JavaScript interface for download.");
                        };
                        reader.onerror = function(event) {
                            console.error("FileReader error during blob conversion:", event.target.error);
                            showMessageBox(getTranslation("message_box_failed_to_download_file") + " (JS read error)", "error");
                            if (typeof Android !== 'undefined' && Android.onBlobError) {
                                Android.onBlobError("FileReader error during blob conversion: " + event.target.error.message);
                            }
                        };
                        reader.readAsDataURL(blob); // Convert blob to Data URL (Base64)
                    } else {
                        // Fallback for regular browsers (or if Android interface isn't hooked up)
                        console.warn("Android interface not available. Falling back to default browser download.");
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = originalFileName; // Use the original file name for download
                        document.body.appendChild(a);
                        a.click(); // Programmatically click the link
                        window.URL.revokeObjectURL(url); // Clean up the object URL
                        showMessageBox(getTranslation("message_box_download_started"), "success", 2000);
                    }

                } catch (error) {
                    console.error("Error during download:", error);
                    showMessageBox(getTranslation("message_box_failed_to_download_file") + error.message, "error");
                }
            }
        };

    } catch (error) {
        console.error("Error listing files:", error);
        showMessageBox(getTranslation("failed_to_load_files_error") + error.message, "error");
    }
}

// Handle confirmation for file deletion
confirmDeleteFileBtn.onclick = async () => {
    closeModal(deleteFileConfirmModal);
    if (fileToDeleteName) {
        await performFileDeletion(fileToDeleteName);
        fileToDeleteName = null; // Clear the stored file name
    }
};

// Handle cancellation for file deletion
cancelDeleteFileBtn.onclick = () => {
    closeModal(deleteFileConfirmModal); // Close the correct modal
    showMessageBox(getTranslation("cancelled!"), "info", 2000); // Specific message for file deletion cancellation
    fileToDeleteName = null; // Clear the stored file name if the user cancels
};


// --- Logout and Delete Account ---
logoutBtn.onclick = async () => {
    try {
        await auth.signOut();
        showMessageBox(getTranslation("message_box_logged_out_success"), "success");
    } catch (error) {
        console.error("Error logging out:", error);
        showMessageBox(getTranslation("message_box_failed_to_log_out") + error.message, "error");
    } finally {
        // Ensure encryption key is cleared from memory and session storage on logout
        currentEncryptionKey = null;
        sessionStorage.removeItem('currentEncryptionKeyHex'); // Clear from session storage
    }
};

// Open the confirmation modal when deleteAccountBtn is clicked
deleteAccountBtn.onclick = () => {
    openModal(deleteAccountConfirmModal);
};

// Handle confirmation of account deletion
confirmDeleteAccountBtn.onclick = async () => {
    closeModal(deleteAccountConfirmModal);
    showMessageBox(getTranslation("message_box_initiating_account_deletion"), 'info', 0); // Keep message box open

    if (!currentUser) {
        showMessageBox(getTranslation("message_box_please_login_first"), "error");
        return;
    }

    try {
        const idToken = await currentUser.getIdToken();

        // 1. Delete Supabase data (files and metadata) via Edge Function
        console.log("Calling delete-user-data Edge Function...");
        const supabaseDeleteResponse = await fetch(`${SUPABASE_URL}/functions/v1/delete-user-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}` // Still send Firebase ID token for potential future validation in Edge Function
            },
            body: JSON.stringify({ id: currentUser.uid }) // Send userId explicitly
        });

        if (!supabaseDeleteResponse.ok) {
            const errorData = await supabaseDeleteResponse.json();
            throw new Error(errorData.message || 'Failed to delete Supabase data');
        }
        console.log("Supabase data deletion successful.");
        showMessageBox(getTranslation("message_box_supabase_data_deleted_success"), "success", 2000);


        // 2. Delete Firebase notes and passwords from Firestore
        console.log("Deleting user notes from Firestore...");
        const notesRef = db.collection('players').doc(currentUser.uid).collection('notes');
        const notesSnapshot = await notesRef.get();
        const deleteNotesPromises = [];
        notesSnapshot.forEach(doc => {
            deleteNotesPromises.push(doc.ref.delete());
        });
        await Promise.all(deleteNotesPromises);
        console.log("User notes deleted from Firestore.");

        console.log("Deleting user passwords from Firestore...");
        const passwordsRef = db.collection('players').doc(currentUser.uid).collection('passwords');
        const passwordsSnapshot = await passwordsRef.get();
        const deletePasswordsPromises = [];
        passwordsSnapshot.forEach(doc => {
            deletePasswordsPromises.push(doc.ref.delete());
        });
        await Promise.all(deletePasswordsPromises);
        console.log("User passwords deleted from Firestore.");

        // 3. Delete user's Firebase profile document
        console.log("Deleting user profile document from Firestore...");
        await db.collection('players').doc(currentUser.uid).delete();
        console.log("User profile document deleted from Firestore.");

        // 4. Delete Firebase authentication account
        console.log("Deleting Firebase authentication account...");
        await currentUser.delete();
        console.log("Firebase authentication account deleted.");

        showMessageBox(getTranslation("message_box_account_deleted_success"), "success", 3000);
        setTimeout(() => {
            window.location.href = "login.html";
        }, 3000);

    } catch (error) {
        console.error("Error during full account deletion:", error);
        let errorMessage = getTranslation("message_box_failed_to_delete_account");
        if (error.message) {
            errorMessage += `: ${error.message}`;
        }
        showMessageBox(errorMessage, "error", 5000);

        if (error.code === 'auth/requires-recent-login') {
            showMessageBox(getTranslation("message_box_account_requires_recent_login"), "warning", 5000);
            setTimeout(() => {
                auth.signOut().then(() => {
                    window.location.href = "login.html";
                });
            }, 3000);
        }
    }
};

// Handle cancellation of account deletion
cancelDeleteAccountBtn.onclick = () => {
    closeModal(deleteAccountConfirmModal);
    showMessageBox(getTranslation("message_box_account_deletion_cancelled"), "info", 2000);
};


// --- Modal Close Button Handlers (for all modals) ---
document.querySelectorAll('.close-button').forEach(button => {
    button.onclick = (e) => {
        const modalId = e.target.dataset.modal;
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            closeModal(modalElement);
        }
    };
});

// Update Forgot Master Password button behavior
forgotPasswordBtn.onclick = () => {
    showMessageBox(getTranslation("message_box_master_password_cannot_be_reset"), "info", 5000);
};

// NEW: Add functionality for the Server button
serverBtn.onclick = () => {
    window.open("https://support.teamobi.com/login-game-3.html", "_blank");
};

// Initial load for avatars
loadAvatars();


// --- jQuery Document Ready for Language Selector and initial language load ---
$(document).ready(function() {
    // Set initial language based on localStorage or default to English
    const storedLang = localStorage.getItem('selectedLanguage') || 'en';
    if (languageSelect) {
        languageSelect.value = storedLang;
    }
    loadTranslations(storedLang);

    // Event listener for language selection
    if (languageSelect) {
        $('#language-select').on('change', function() {
            const selectedLang = $(this).val();
            loadTranslations(selectedLang);
        });
    }
});
