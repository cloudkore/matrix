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
// Removed storage initialization as Ephemeral Storage is removed
// const storage = firebase.storage();

let allAvatars = []; // To store all available avatar filenames
let currentAvatarIndex = 0; // To keep track of the currently displayed avatar index
let selectedAvatar = ""; // This will still hold the filename of the avatar chosen

// --- Utility Functions ---

// Custom message box for alerts (instead of alert() or confirm())
function showMessageBox(message, type = 'info', duration = 3000) {
    const messageBox = document.getElementById('customMessageBox');
    const messageText = document.getElementById('messageBoxText');

    messageText.innerText = message;
    messageBox.style.display = 'block';

    // Apply basic styling based on type (optional, can be expanded in CSS)
    messageBox.style.backgroundColor = '#333'; // Default
    messageBox.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)'; // Default green glow
    if (type === 'error') {
        messageBox.style.backgroundColor = '#ef4444';
        messageBox.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
    } else if (type === 'success') {
        messageBox.style.backgroundColor = '#22c55e';
        messageBox.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
    }

    setTimeout(() => {
        messageBox.style.display = 'none';
    }, duration);
}

// Function to open a modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex'; // Use flex to center
}

// Function to close a modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// --- Avatar Management ---

// Function to update the displayed avatar image and its selected state
function updateAvatarDisplay() {
    const avatarDisplay = document.getElementById("currentAvatarDisplay");
    const avatarWrapper = document.getElementById("currentAvatarWrapper");

    if (allAvatars.length > 0) {
        avatarDisplay.src = `avatars/${allAvatars[currentAvatarIndex]}`;
        avatarDisplay.alt = allAvatars[currentAvatarIndex];
        avatarWrapper.classList.add("selected");
    } else {
        avatarDisplay.src = "";
        avatarDisplay.alt = "No Avatars Available";
        avatarWrapper.classList.remove("selected");
    }
}

// Function to load avatars from avatars.json
async function loadAvatars() {
    try {
        const res = await fetch("avatars/avatars.json");
        if (!res.ok) throw new Error("Failed to fetch avatars.json");
        allAvatars = await res.json();

        if (allAvatars.length > 0) {
            currentAvatarIndex = 0;
            updateAvatarDisplay();
            selectedAvatar = allAvatars[currentAvatarIndex];
        } else {
            document.getElementById("currentAvatarDisplay").alt = "No avatars found.";
        }
    } catch (err) {
        console.error("Error loading avatars.json:", err);
        document.getElementById("currentAvatarDisplay").alt = "Failed to load avatars.";
    }
}

// --- Firebase Authentication State Change Listener ---
auth.onAuthStateChanged(async user => {
    if (!user) {
        window.location.href = "login.html"; // Redirect to login.html
        return;
    }

    const uid = user.uid;
    const playerDocRef = db.collection("players").doc(uid);
    const snap = await playerDocRef.get();
    const data = snap.exists ? snap.data() : {};

    // Check if username or avatar is missing (first-time setup)
    if (!data.username || !data.avatar) {
        document.getElementById("setup-section").style.display = "flex";
        await loadAvatars();

        document.getElementById("prevAvatarBtn").onclick = () => {
            currentAvatarIndex = (currentAvatarIndex - 1 + allAvatars.length) % allAvatars.length;
            updateAvatarDisplay();
            selectedAvatar = allAvatars[currentAvatarIndex];
        };

        document.getElementById("nextAvatarBtn").onclick = () => {
            currentAvatarIndex = (currentAvatarIndex + 1) % allAvatars.length;
            updateAvatarDisplay();
            selectedAvatar = allAvatars[currentAvatarIndex];
        };

        document.getElementById("saveProfileBtn").onclick = async () => {
            const username = document.getElementById("usernameInput").value.trim();
            if (!username || !selectedAvatar) {
                showMessageBox("Please enter a username and select an avatar.", 'error');
                return;
            }

            await playerDocRef.set({
                username: username,
                avatar: selectedAvatar,
            }, { merge: true });

            window.location.reload();
        };

    } else {
        // If profile exists, display the main dashboard
        document.getElementById("main-dashboard").style.display = "block";
        document.getElementById("dashboard-username").textContent = data.username;
        document.getElementById("user-avatar").src = `avatars/${data.avatar}`;

        // --- Dashboard Button Event Listeners ---

        // Server Button
        document.getElementById("serverBtn").onclick = () => {
            window.open("https://support.teamobi.com/login-game-3.html", "_blank");
        };

        // --- Notes Functionality ---
        const notesModal = document.getElementById("notesModal");
        const noteInput = document.getElementById("noteInput");
        const saveNoteBtn = document.getElementById("saveNoteBtn");
        const savedNotesDisplay = document.getElementById("savedNotesDisplay");

        document.getElementById("notesBtn").onclick = () => {
            openModal("notesModal");
            loadNotes(); // Load notes when modal opens
        };

        saveNoteBtn.onclick = async () => {
            const noteText = noteInput.value.trim();
            if (!noteText) {
                showMessageBox("Note cannot be empty.", 'error');
                return;
            }
            try {
                // Add a new note to a subcollection 'notes' under the user's player document
                await playerDocRef.collection("notes").add({
                    content: noteText,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp() // Use server timestamp
                });
                noteInput.value = ''; // Clear input
                showMessageBox("Note saved successfully!", 'success');
                // Notes will auto-update via onSnapshot listener
            } catch (error) {
                console.error("Error saving note:", error);
                showMessageBox("Failed to save note.", 'error');
            }
        };

        // Real-time listener for notes
        playerDocRef.collection("notes").orderBy("timestamp", "desc").onSnapshot(snapshot => {
            savedNotesDisplay.innerHTML = ''; // Clear current display
            if (snapshot.empty) {
                savedNotesDisplay.innerHTML = '<p style="text-align: center; color: #94a3b8;">No notes yet. Start writing!</p>';
                return;
            }
            snapshot.forEach(doc => {
                const note = doc.data();
                const noteId = doc.id; // Get document ID for deletion
                const noteElement = document.createElement('div');
                noteElement.innerHTML = `
                    <p><strong>${note.timestamp ? new Date(note.timestamp.toDate()).toLocaleString() : 'Saving...'}</strong></p>
                    <p>${note.content}</p>
                    <button class="btn btn-danger btn-sm delete-note-btn" data-note-id="${noteId}">Delete</button>
                `;
                savedNotesDisplay.appendChild(noteElement);
            });

            // Attach delete listeners
            savedNotesDisplay.querySelectorAll('.delete-note-btn').forEach(button => {
                button.onclick = async (e) => {
                    const noteIdToDelete = e.target.dataset.noteId;
                    try {
                        await playerDocRef.collection("notes").doc(noteIdToDelete).delete();
                        showMessageBox("Note deleted!", 'success');
                    } catch (error) {
                        console.error("Error deleting note:", error);
                        showMessageBox("Failed to delete note.", 'error');
                    }
                };
            });
        }, error => {
            console.error("Error listening to notes:", error);
            showMessageBox("Error loading notes.", 'error');
        });

        // Initial load of notes (also handled by onSnapshot, but good for explicit call)
        async function loadNotes() {
            // The onSnapshot listener above will handle this automatically
        }

        // --- ID/Password Manager Functionality ---
        const passwordManagerModal = document.getElementById("passwordManagerModal");
        const pmServiceNameInput = document.getElementById("pmServiceName");
        const pmUsernameInput = document.getElementById("pmUsername");
        const pmPasswordInput = document.getElementById("pmPassword");
        const savePmEntryBtn = document.getElementById("savePmEntryBtn");
        const pmEntryList = document.getElementById("pmEntryList");

        // IMPORTANT: Replace 'YOUR_ENCRYPTION_SECRET_KEY' with a strong, unique key
        // This key should ideally NOT be hardcoded in client-side code for production apps.
        // For a static site, it's a trade-off. Consider fetching it securely if possible.
        const ENCRYPTION_SECRET_KEY = "YOUR_ENCRYPTION_SECRET_KEY_NINJABASE"; // CHANGE THIS!

        document.getElementById("passwordManagerBtn").onclick = () => {
            openModal("passwordManagerModal");
            loadPmEntries(); // Load entries when modal opens
        };

        // Helper for encryption
        function encrypt(text) {
            return CryptoJS.AES.encrypt(text, ENCRYPTION_SECRET_KEY).toString();
        }

        // Helper for decryption
        function decrypt(ciphertext) {
            try {
                const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_SECRET_KEY);
                return bytes.toString(CryptoJS.enc.Utf8);
            } catch (e) {
                console.error("Decryption failed:", e);
                return "[Decryption Error]"; // Indicate failure
            }
        }

        savePmEntryBtn.onclick = async () => {
            const serviceName = pmServiceNameInput.value.trim();
            const pmUsername = pmUsernameInput.value.trim();
            const pmPassword = pmPasswordInput.value.trim();

            if (!serviceName || !pmUsername || !pmPassword) {
                showMessageBox("All fields are required for a password entry.", 'error');
                return;
            }

            try {
                // Encrypt sensitive data before saving
                const encryptedPassword = encrypt(pmPassword);

                await playerDocRef.collection("passwords").add({
                    serviceName: serviceName,
                    username: pmUsername,
                    password: encryptedPassword, // Store encrypted password
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                pmServiceNameInput.value = '';
                pmUsernameInput.value = '';
                pmPasswordInput.value = '';
                showMessageBox("Password entry saved securely!", 'success');
            } catch (error) {
                console.error("Error saving password entry:", error);
                showMessageBox("Failed to save password entry.", 'error');
            }
        };

        // Real-time listener for password entries
        playerDocRef.collection("passwords").orderBy("timestamp", "desc").onSnapshot(snapshot => {
            pmEntryList.innerHTML = '';
            if (snapshot.empty) {
                pmEntryList.innerHTML = '<p style="text-align: center; color: #94a3b8;">No saved passwords yet.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const entry = doc.data();
                const entryId = doc.id;
                const decryptedPassword = decrypt(entry.password); // Decrypt for display

                const entryElement = document.createElement('div');
                entryElement.innerHTML = `
                    <p><strong>Service:</strong> ${entry.serviceName}</p>
                    <p><strong>Username:</strong> ${entry.username}</p>
                    <p><strong>Password:</strong> <span class="decrypted-password">${decryptedPassword}</span></p>
                    <button class="btn btn-danger btn-sm delete-pm-btn" data-entry-id="${entryId}">Delete</button>
                `;
                pmEntryList.appendChild(entryElement);
            });

            // Attach delete listeners
            pmEntryList.querySelectorAll('.delete-pm-btn').forEach(button => {
                button.onclick = async (e) => {
                    const noteIdToDelete = e.target.dataset.noteId;
                    try {
                        await playerDocRef.collection("passwords").doc(noteIdToDelete).delete();
                        showMessageBox("Password entry deleted!", 'success');
                    } catch (error) {
                        console.error("Error deleting password entry:", error);
                        showMessageBox("Failed to delete entry.", 'error');
                    }
                };
            });
        }, error => {
            console.error("Error listening to password entries:", error);
            showMessageBox("Error loading password entries.", 'error');
        });

        async function loadPmEntries() {
            // The onSnapshot listener above handles this automatically
        }

        // --- Delete Account Functionality ---
        const deleteAccountConfirmModal = document.getElementById("deleteAccountConfirmModal");
        const confirmDeleteAccountBtn = document.getElementById("confirmDeleteAccountBtn");
        const cancelDeleteAccountBtn = document.getElementById("cancelDeleteAccountBtn");

        document.getElementById("deleteAccountBtn").onclick = () => {
            openModal("deleteAccountConfirmModal");
        };

        confirmDeleteAccountBtn.onclick = async () => {
            showMessageBox("Deleting account...", 'info', 5000);
            try {
                // Delete user's Firestore data first
                // IMPORTANT: For real-world apps, you might have subcollections that need to be deleted recursively.
                // Firebase Security Rules can also help manage this.
                await playerDocRef.delete();

                // Delete user from Firebase Authentication
                await auth.currentUser.delete();

                showMessageBox("Account deleted successfully! Redirecting...", 'success');
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } catch (error) {
                console.error("Error deleting account:", error);
                // Handle specific errors like 'auth/requires-recent-login'
                if (error.code === 'auth/requires-recent-login') {
                    showMessageBox("Please re-login to delete your account for security reasons.", 'error', 5000);
                    // You might want to redirect to login.html here or provide a re-authentication flow
                    auth.signOut().then(() => {
                        window.location.href = "login.html";
                    });
                } else {
                    showMessageBox(`Failed to delete account: ${error.message}`, 'error');
                }
            } finally {
                closeModal("deleteAccountConfirmModal");
            }
        };

        cancelDeleteAccountBtn.onclick = () => {
            closeModal("deleteAccountConfirmModal");
        };

        // --- Logout Button (already present) ---
        document.getElementById("logoutBtn").onclick = () => {
            auth.signOut().then(() => {
                window.location.href = "login.html"; // Redirect to login page after logout
            }).catch((error) => {
                console.error("Error signing out:", error);
                showMessageBox("Error logging out.", 'error');
            });
        };

        // --- Modal Close Button Handlers (for all modals) ---
        document.querySelectorAll('.close-button').forEach(button => {
            console.log("Attaching click listener to close button:", button); // Debugging line
            button.onclick = (e) => {
                console.log("Close button clicked!", e.target.dataset.modal); // Debugging line
                const modalId = e.target.dataset.modal;
                closeModal(modalId);
            };
        });
    }
});
