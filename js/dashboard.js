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
const storage = firebase.storage();

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

const notesModal = document.getElementById('notesModal');
const notesBtn = document.getElementById('notesBtn');
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
const cancelDeleteAccountBtn = document.getElementById('cancelDeleteAccountBtn');

// Master Password setup fields (in setup section)
const masterPasswordInput = document.getElementById('masterPasswordInput');
const confirmMasterPasswordInput = document.getElementById('confirmMasterPasswordInput');
const masterPasswordSetupFields = document.querySelectorAll('.master-password-setup-field');

// Master password unlock modal (for returning users)
const masterPasswordPromptModal = document.getElementById('masterPasswordPromptModal');
const masterPasswordUnlockInput = document.getElementById('masterPasswordUnlockInput');
const unlockDashboardBtn = document.getElementById('unlockDashboardBtn');
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

// --- Global Variables ---
let currentAvatarIndex = 0;
let allAvatars = [];
let currentUser = null;
let currentEncryptionKey = null; // This will hold the derived encryption key for the session

// --- Utility Functions ---
function showMessageBox(message, type = 'info', duration = 3000) {
    messageBoxText.innerText = message;
    customMessageBox.style.display = 'block';

    customMessageBox.style.backgroundColor = '#333';
    customMessageBox.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
    if (type === 'error') {
        customMessageBox.style.backgroundColor = '#ef4444';
        customMessageBox.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
    } else if (type === 'success') {
        customMessageBox.style.backgroundColor = '#22c55e';
        customMessageBox.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
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
        hasher: CryptoJS.algo.SHA256
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
        showMessageBox("Could not load avatars. Please check your network.", "error");
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

    const masterPassword = masterPasswordSetupFields.length > 0 && masterPasswordSetupFields[0].style.display === 'block' ? masterPasswordInput.value : '';
    const confirmMasterPassword = masterPasswordSetupFields.length > 0 && masterPasswordSetupFields[0].style.display === 'block' ? confirmMasterPasswordInput.value : '';

    const playerDocRef = db.collection('players').doc(user.uid);
    const playerDoc = await playerDocRef.get();
    const data = playerDoc.exists ? playerDoc.data() : {};

    const hasSalt = !!data.salt;
    const hasMasterPasswordHash = !!data.masterPasswordHash;

    if (!username || !selectedAvatar) {
        showMessageBox("Please enter a username and select an avatar.", "error");
        return;
    }

    if (masterPasswordSetupFields.length > 0 && masterPasswordSetupFields[0].style.display === 'block') {
        if (masterPassword.length < 8) {
            showMessageBox("Master password must be at least 8 characters long.", "error");
            return;
        }
        if (masterPassword !== confirmMasterPassword) {
            showMessageBox("Master passwords do not match.", "error");
            return;
        }
    }

    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = 'Saving...';

    try {
        let userSalt = data.salt;
        let masterPasswordHashToSave = data.masterPasswordHash;

        if (masterPasswordSetupFields.length > 0 && masterPasswordSetupFields[0].style.display === 'block') {
            userSalt = generateSalt();
            masterPasswordHashToSave = (await deriveKey(masterPassword, userSalt)).toString(CryptoJS.enc.Hex);
            showMessageBox("Generating and storing your master password. Do NOT forget it!", "info", 5000);
        }

        const updateData = {
            username: username,
            avatar: selectedAvatar,
            level: data.level || 1
        };

        if (userSalt) {
            updateData.salt = userSalt;
        }
        if (masterPasswordHashToSave) {
            updateData.masterPasswordHash = masterPasswordHashToSave;
        }

        await db.collection('players').doc(user.uid).set(updateData, { merge: true });

        showMessageBox("Profile saved successfully!", "success");

        setupSection.style.display = 'none';
        mainDashboard.style.display = 'block';
        dashboardUsername.textContent = username;
        userAvatar.src = `avatars/${selectedAvatar}`;

    } catch (error) {
        console.error("Error saving profile:", error);
        showMessageBox("Failed to save profile: " + error.message, "error");
    } finally {
        saveProfileBtn.disabled = false;
        saveProfileBtn.textContent = 'Save Profile';
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
        const hasSalt = !!data.salt;
        const hasMasterPasswordHash = !!data.masterPasswordHash;

        console.log(`Debug: hasUsername: ${hasUsername}, hasAvatar: ${hasAvatar}, hasSalt: ${hasSalt}, hasMasterPasswordHash: ${hasMasterPasswordHash}`);

        // No attempt to load encryption key from sessionStorage here.
        // The key is explicitly set via the unlock modal.
        currentEncryptionKey = null; // Ensure it's null on load

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

            const shouldShowMasterPasswordFieldsInSetup = !(hasSalt && hasMasterPasswordHash);
            console.log(`Debug: shouldShowMasterPasswordFieldsInSetup (for setup screen): ${shouldShowMasterPasswordFieldsInSetup}`);

            if (masterPasswordSetupFields.length > 0) {
                masterPasswordSetupFields.forEach(div => {
                    div.style.display = shouldShowMasterPasswordFieldsInSetup ? 'block' : 'none';
                });
            }

            masterPasswordInput.value = '';
            confirmMasterPasswordInput.value = '';
            return;
        }

        // Scenario 2: User has a complete profile (username and avatar are present)
        console.log("User has complete profile (username and avatar). Displaying main dashboard directly.");
        dashboardUsername.textContent = data.username;
        userAvatar.src = `avatars/${data.avatar}`;
        setupSection.style.display = 'none';
        mainDashboard.style.display = 'block';
        closeModal(masterPasswordPromptModal);

    } catch (error) {
        console.error("Error setting up dashboard:", error);
        showMessageBox("Failed to load dashboard: " + error.message, "error");
        setupSection.style.display = 'none';
        mainDashboard.style.display = 'none';
        closeModal(masterPasswordPromptModal);
    }
}

// Handler for unlocking the dashboard with master password (triggered by modal)
unlockDashboardBtn.onclick = async () => {
    console.log("Unlock Dashboard button clicked.");
    const masterPassword = masterPasswordUnlockInput.value;
    if (!masterPassword) {
        showMessageBox("Please enter your master password.", "error");
        return;
    }

    unlockDashboardBtn.disabled = true;
    unlockDashboardBtn.textContent = 'Unlocking...';

    try {
        const playerDocRef = db.collection('players').doc(currentUser.uid);
        const doc = await playerDocRef.get();
        const data = doc.data();
        const userSalt = data.salt;
        const storedMasterPasswordHash = data.masterPasswordHash;

        if (!userSalt || !storedMasterPasswordHash) {
             showMessageBox("Profile data incomplete. Please go to setup to set your master password.", "error");
             unlockDashboardBtn.disabled = false;
             unlockDashboardBtn.textContent = 'Unlock Dashboard';
             setupSection.style.display = 'flex';
             mainDashboard.style.display = 'none';
             closeModal(masterPasswordPromptModal);
             return;
        }

        const derivedKeyForVerification = await deriveKey(masterPassword, userSalt);
        const derivedMasterPasswordHash = derivedKeyForVerification.toString(CryptoJS.enc.Hex);

        if (derivedMasterPasswordHash !== storedMasterPasswordHash) {
            showMessageBox("Incorrect master password. Please try again.", "error");
            currentEncryptionKey = null;
            return;
        }

        currentEncryptionKey = derivedKeyForVerification; // Set the global encryption key for the session

        closeModal(masterPasswordPromptModal);
        masterPasswordUnlockInput.value = '';
        showMessageBox("Dashboard unlocked! You can now access your encrypted data.", "success", 4000);
        console.log("Dashboard unlocked successfully.");

        // If the user was trying to access Notes/Password Manager, re-open the respective modal
        if (notesModal.dataset.pendingOpen === 'true') {
            openModal(notesModal);
            loadNotes();
            notesModal.dataset.pendingOpen = 'false';
        } else if (passwordManagerModal.dataset.pendingOpen === 'true') {
            openModal(passwordManagerModal);
            loadPasswords();
            passwordManagerModal.dataset.pendingOpen = 'false';
        }

    } catch (error) {
        console.error("Error unlocking dashboard:", error);
        showMessageBox("Error unlocking dashboard: " + error.message, "error");
        currentEncryptionKey = null;
    } finally {
        unlockDashboardBtn.disabled = false;
        unlockDashboardBtn.textContent = 'Unlock Dashboard';
    }
};

// Add event listener for 'Enter' key on masterPasswordUnlockInput
masterPasswordUnlockInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent default form submission behavior (if any)
        unlockDashboardBtn.click(); // Programmatically click the unlock button
    }
});


// Event listener for profile save button
saveProfileBtn.onclick = () => {
    if (currentUser) {
        saveProfile(currentUser);
    } else {
        showMessageBox("Please log in or sign up first.", "error");
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
        sessionStorage.removeItem('currentEncryptionKey'); // Also remove from sessionStorage to be safe
        closeModal(masterPasswordPromptModal);
        currentAvatarIndex = 0;
        updateAvatarDisplay();
        if (window.location.pathname !== '/login.html') {
             window.location.href = "login.html";
        }
    }
});


// --- Dashboard Actions (Notes, Passwords, Ephemeral Files) ---

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
        showMessageBox("Please unlock dashboard.", "error");
        return;
    }
    const noteText = noteInput.value.trim();

    if (!noteText) {
        showMessageBox("Note content cannot be empty.", "error");
        return;
    }

    try {
        const encryptedContent = encryptData(noteText);
        if (!encryptedContent) {
            throw new Error("Encryption failed.");
        }
        await db.collection('players').doc(currentUser.uid).collection('notes').add({
            content: encryptedContent,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        noteInput.value = '';
        showMessageBox("Note added successfully!", "success");
    }
    catch (error) {
        console.error("Error adding note:", error);
        showMessageBox("Failed to add note: " + error.message, "error");
    }
};

async function loadNotes() {
    if (!currentUser || !currentEncryptionKey) {
        savedNotesDisplay.innerHTML = '<p style="text-align: center; color: #94a3b8;">Please unlock dashboard to view notes.</p>';
        return;
    }
    db.collection('players').doc(currentUser.uid).collection('notes')
        .orderBy('timestamp', "desc")
        .onSnapshot((snapshot) => {
            savedNotesDisplay.innerHTML = '';
            if (snapshot.empty) {
                savedNotesDisplay.innerHTML = '<p style="text-align: center; color: #94a3b8;">No notes saved yet.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const note = doc.data();
                const decryptedContent = decryptData(note.content);
                if (decryptedContent === null) {
                    savedNotesDisplay.innerHTML += `
                        <div>
                            <p><strong>${note.timestamp ? new Date(note.timestamp.toDate()).toLocaleString() : 'Saving...'}</strong></p>
                            <p style="color: red;">[Decryption Failed or Invalid Data]</p>
                            <button class="delete-note-btn btn btn-danger" data-note-id="${doc.id}">Delete</button>
                        </div>
                    `;
                    return;
                }
                savedNotesDisplay.innerHTML += `
                    <div>
                        <p><strong>${note.timestamp ? new Date(note.timestamp.toDate()).toLocaleString() : 'Saving...'}</strong></p>
                        <p>${decryptedContent}</p>
                        <button class="delete-note-btn btn btn-danger" data-note-id="${doc.id}">Delete</button>
                    </div>
                `;
            });
            document.querySelectorAll('.delete-note-btn').forEach(button => {
                button.onclick = async (event) => {
                    showMessageBox("Deleting note...", 'info', 1500);
                    const noteId = event.target.dataset.noteId;
                    try {
                        await db.collection('players').doc(currentUser.uid).collection('notes').doc(noteId).delete();
                        showMessageBox("Note deleted successfully!", "success");
                    } catch (error) {
                        console.error("Error deleting note:", error);
                        showMessageBox("Failed to delete note: " + error.message, "error");
                    }
                };
            });
        }, (error) => {
            console.error("Error loading notes:", error);
            showMessageBox("Failed to load notes: " + error.message, "error");
        });
}

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
        showMessageBox("Please unlock dashboard.", "error");
        return;
    }
    const serviceName = pmServiceNameInput.value.trim();
    const pmUsername = pmUsernameInput.value.trim();
    const pmPassword = pmPasswordInput.value.trim();

    if (!serviceName || !pmUsername || !pmPassword) {
        showMessageBox("All fields are required for a password entry.", "error");
        return;
    }

    try {
        const encryptedPassword = encryptData(pmPassword);
        if (!encryptedPassword) {
            throw new Error("Encryption failed.");
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
        showMessageBox("Password added successfully!", "success");
    } catch (error) {
        console.error("Error adding password:", error);
        showMessageBox("Failed to add password: " + error.message, "error");
    }
};

async function loadPasswords() {
    if (!currentUser || !currentEncryptionKey) {
        pmEntryList.innerHTML = '<p style="text-align: center; color: #94a3b8;">Please unlock dashboard to view passwords.</p>';
        return;
    }
    db.collection('players').doc(currentUser.uid).collection('passwords')
        .orderBy('timestamp', "desc")
        .onSnapshot((snapshot) => {
            pmEntryList.innerHTML = '';
            if (snapshot.empty) {
                pmEntryList.innerHTML = '<p style="text-align: center; color: #94a3b8;">No passwords saved yet.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const entry = doc.data();
                const decryptedContent = decryptData(entry.password);
                 if (decryptedContent === null) {
                    pmEntryList.innerHTML += `
                        <div>
                            <p><strong>Service:</strong> ${entry.serviceName}</p>
                            <p><strong>Username:</strong> ${entry.username}</p>
                            <p style="color: red;"><strong>Password:</strong> [Decryption Failed or Invalid Data]</p>
                            <button class="delete-pm-btn btn btn-danger" data-entry-id="${doc.id}">Delete</button>
                        </div>
                    `;
                    return;
                }
                pmEntryList.innerHTML += `
                    <div>
                        <p><strong>Service:</strong> ${entry.serviceName}</p>
                        <p><strong>Username:</strong> ${entry.username}</p>
                        <p><strong>Password:</strong> <span class="decrypted-password">${decryptedContent}</span></p>
                        <button class="delete-pm-btn btn btn-danger" data-entry-id="${doc.id}">Delete</button>
                    </div>
                `;
            });
            document.querySelectorAll('.delete-pm-btn').forEach(button => {
                button.onclick = async (event) => {
                    showMessageBox("Deleting password entry...", 'info', 1500);
                    const entryId = event.target.dataset.entryId;
                    try {
                        await db.collection('players').doc(currentUser.uid).collection('passwords').doc(entryId).delete();
                        showMessageBox("Password entry deleted successfully!", "success");
                    } catch (error) {
                        console.error("Error deleting password entry:", error);
                        showMessageBox("Failed to delete password entry: " + error.message, "error");
                    }
                };
            });
        }, (error) => {
            console.error("Error loading passwords:", error);
            showMessageBox("Failed to load passwords: " + error.message, "error");
        });
}

// Ephemeral Files (assuming you still want this feature)
const ephemeralFilesBtn = document.getElementById('ephemeralFilesBtn');
const ephemeralFilesModal = document.getElementById('ephemeralFilesModal');
const ephemeralFileInput = document.getElementById('ephemeralFileInput');
const uploadEphemeralFileBtn = document.getElementById('uploadEphemeralFileBtn');
const ephemeralFilesList = document.getElementById('ephemeralFilesList');

if (ephemeralFilesBtn && ephemeralFilesModal && ephemeralFileInput && uploadEphemeralFileBtn && ephemeralFilesList) {
    ephemeralFilesBtn.onclick = () => {
        openModal(ephemeralFilesModal);
        loadEphemeralFiles();
    };
    ephemeralFilesModal.querySelector('.close-button').onclick = () => closeModal(ephemeralFilesModal);

    uploadEphemeralFileBtn.onclick = async () => {
        if (!currentUser) {
            showMessageBox("Please log in to upload files.", "error");
            return;
        }
        const file = ephemeralFileInput.files[0];
        if (!file) {
            showMessageBox("Please select a file to upload.", "error");
            return;
        }

        const fileRef = storage.ref().child(`ephemeral_files/${currentUser.uid}/${file.name}`);
        try {
            const snapshot = await fileRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();

            await db.collection('players').doc(currentUser.uid).collection('ephemeral_files').add({
                name: file.name,
                url: downloadURL,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            });
            showMessageBox("File uploaded successfully!", "success");
            ephemeralFileInput.value = '';
        } catch (error) {
            console.error("Error uploading file:", error);
            showMessageBox("Failed to upload file: " + error.message, "error");
        }
    };

    async function loadEphemeralFiles() {
        if (!currentUser) {
            ephemeralFilesList.innerHTML = '<p>Please log in to view ephemeral files.</p>';
            return;
        }
        db.collection('players').doc(currentUser.uid).collection('ephemeral_files')
            .orderBy('timestamp', "desc")
            .onSnapshot((snapshot) => {
                ephemeralFilesList.innerHTML = '';
                if (snapshot.empty) {
                    ephemeralFilesList.innerHTML = '<p>No ephemeral files uploaded yet.</p>';
                    return;
                }
                snapshot.forEach(doc => {
                    const file = doc.data();
                    ephemeralFilesList.innerHTML += `
                        <div>
                            <strong><a href="${file.url}" target="_blank">${file.name}</a></strong>
                            <button class="delete-file-btn btn btn-danger" data-id="${doc.id}" data-url="${file.url}">Delete</button>
                        </div>
                    `;
                });
                document.querySelectorAll('.delete-file-btn').forEach(button => {
                    button.onclick = async (event) => {
                        showMessageBox("Deleting file...", 'info', 1500);
                        const fileId = event.target.dataset.id;
                        const fileUrl = event.target.dataset.url;
                        try {
                            const storageRef = storage.refFromURL(fileUrl);
                            await storageRef.delete();
                            await db.collection('players').doc(currentUser.uid).collection('ephemeral_files').doc(fileId).delete();
                            showMessageBox("File deleted successfully!", "success");
                        } catch (error) {
                            console.error("Error deleting file:", error);
                            showMessageBox("Failed to delete file: " + error.message, "error");
                        }
                    }
                });
            });
    }
} else {
    console.warn("Ephemeral file elements not found in HTML. Ephemeral file functionality will not be active.");
}


// --- Logout and Delete Account ---
logoutBtn.onclick = async () => {
    try {
        await auth.signOut();
        showMessageBox("Logged out successfully!", "success");
    } catch (error) {
        console.error("Error logging out:", error);
        showMessageBox("Failed to log out: " + error.message, "error");
    }
};

// Open the confirmation modal when deleteAccountBtn is clicked
deleteAccountBtn.onclick = () => {
    openModal(deleteAccountConfirmModal);
};

// Handle confirmation of account deletion
confirmDeleteAccountBtn.onclick = async () => {
    closeModal(deleteAccountConfirmModal); // Close modal immediately
    showMessageBox("Initiating account deletion...", 'info', 2000);
    try {
        await db.collection('players').doc(currentUser.uid).delete(); // Delete user's profile document
        await currentUser.delete(); // Delete Firebase authentication account
        showMessageBox("Account and associated profile data deleted successfully! Redirecting...", "success");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    } catch (error) {
        console.error("Error deleting account:", error);
        showMessageBox("Failed to delete account: " + error.message, "error");
        if (error.code === 'auth/requires-recent-login') {
            showMessageBox("Please log in again recently to delete your account. You will be redirected to the login page.", "warning", 5000);
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
    showMessageBox("Account deletion cancelled.", "info", 2000);
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
    showMessageBox("Your master password is tied to your login password. To reset it, please use the 'Forgot Password?' option on the login page.", "info", 5000);
    // Optionally, you could redirect them to the login page:
    // setTimeout(() => { window.location.href = "login.html"; }, 3000);
};

// Initial load for avatars
loadAvatars();
