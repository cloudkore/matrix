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

let selectedAvatar = "";

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
    loadAvatars();

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

function loadAvatars() {
  fetch("avatars/avatars.json")
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch avatars.json");
      return res.json();
    })
    .then(files => {
      const container = document.getElementById("avatar-container");
      container.innerHTML = "";

      files.forEach(filename => {
        const img = document.createElement("img");
        img.src = `avatars/${filename}`;
        img.alt = filename;
        img.classList.add("avatar-choice");
        img.style.width = "60px";
        img.style.cursor = "pointer";

        img.onclick = () => {
          selectedAvatar = filename;
          document.querySelectorAll(".avatar-choice").forEach(i => i.style.border = "none");
          img.style.border = "3px solid cyan";
        };

        container.appendChild(img);
      });
    })
    .catch(err => {
      console.error("Error loading avatars.json:", err);
      document.getElementById("avatar-container").textContent = "Failed to load avatars.";
    });
}