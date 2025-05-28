const firebaseConfig = {
    apiKey: "AIzaSyCwEZaP_Oc7MRwfxIXyq0k7sH4LQBEc3YY",
    authDomain: "matrix-nso.firebaseapp.com",
    projectId: "matrix-nso",
    storageBucket: "matrix-nso.appspot.com",
    messagingSenderId: "32108162722",
    appId: "1:32108162722:web:7c80d154d4120111f271fb"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let allAvatars = []; // To store all available avatar filenames
let currentAvatarIndex = 0; // To keep track of the currently displayed avatar index
let selectedAvatar = ""; // This will still hold the filename of the avatar chosen

auth.onAuthStateChanged(async user => {
    if (!user) {
        window.location.href = "core.html";
        return;
    }

    const uid = user.uid;
    const ref = db.collection("players").doc(uid);
    const snap = await ref.get();
    const data = snap.exists ? snap.data() : {};

    if (!data.username || !data.avatar) {
        document.getElementById("setup-section").style.display = "block";
        await loadAvatars(); // Await loadAvatars to ensure allAvatars is populated

        // Initialize with the first avatar and mark it as selected
        if (allAvatars.length > 0) {
            currentAvatarIndex = 0;
            updateAvatarDisplay();
            selectedAvatar = allAvatars[currentAvatarIndex];
            document.getElementById("currentAvatarDisplay").classList.add("selected");
        }


        // Navigation button listeners
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
                alert("Please enter a username and select an avatar.");
                return;
            }

            await ref.set({
                username: username,
                avatar: selectedAvatar,
                level: 1
            }, { merge: true });

            window.location.reload();
        };

    } else {
        document.getElementById("main-dashboard").style.display = "block";
        document.getElementById("dashboard-username").textContent = data.username;
        document.getElementById("dashboard-level").textContent = data.level || 1;
        document.getElementById("user-avatar").src = `avatars/${data.avatar}`;
    }

    document.getElementById("logoutBtn").onclick = () => {
        auth.signOut().then(() => {
            window.location.href = "core.html";
        });
    };
});

// Function to update the displayed avatar image
function updateAvatarDisplay() {
    const avatarDisplay = document.getElementById("currentAvatarDisplay");
    if (allAvatars.length > 0) {
        avatarDisplay.src = `avatars/${allAvatars[currentAvatarIndex]}`;
        avatarDisplay.alt = allAvatars[currentAvatarIndex];
        // Ensure the selected class is always applied to the current avatar
        avatarDisplay.classList.add("selected");
    } else {
        avatarDisplay.src = ""; // Or a placeholder
        avatarDisplay.alt = "No Avatars Available";
        avatarDisplay.classList.remove("selected");
    }
}


async function loadAvatars() {
    try {
        const res = await fetch("avatars/avatars.json");
        if (!res.ok) throw new Error("Failed to fetch avatars.json");
        allAvatars = await res.json(); // Store all avatars globally
        // Initially display the first avatar (or handle if no avatars)
        if (allAvatars.length > 0) {
            currentAvatarIndex = 0;
            updateAvatarDisplay();
            selectedAvatar = allAvatars[currentAvatarIndex]; // Set the initial selected avatar
        } else {
            document.getElementById("currentAvatarDisplay").alt = "No avatars found.";
        }
    } catch (err) {
        console.error("Error loading avatars.json:", err);
        document.getElementById("currentAvatarDisplay").alt = "Failed to load avatars.";
    }
}
