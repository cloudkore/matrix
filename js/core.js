 const firebaseConfig = {
      apiKey: "AIzaSyCwEZaP_Oc7MRwfxIXyq0k7sH4LQBEc3YY",
      authDomain: "matrix-nso.firebaseapp.com",
      projectId: "matrix-nso",
      storageBucket: "matrix-nso.firebasestorage.app",
      messagingSenderId: "32108162722",
      appId: "1:32108162722:web:7c80d154d4120111c271fb"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const levelUpBtn = document.getElementById("levelUpBtn");

    function startBrailleSpinner(span) {
  const brailleFrames = ['⠁', '⠃', '⠇', '⠧', '⠷', '⠿'];
  let i = 0;
  span.classList.remove('d-none');
  const interval = setInterval(() => {
    span.textContent = brailleFrames[i++ % brailleFrames.length];
  }, 120);
  return interval;
}

function stopBrailleSpinner(span, intervalId) {
  clearInterval(intervalId);
  span.classList.add('d-none');
  span.textContent = '';
}

loginBtn.onclick = () => {
  const spinnerSpan = document.createElement("span");
  spinnerSpan.className = "braille-spinner";
  loginBtn.innerHTML = "Logging in ";
  loginBtn.appendChild(spinnerSpan);
  loginBtn.disabled = true;

  const intervalId = startBrailleSpinner(spinnerSpan);

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .catch(err => alert(err.message))
    .finally(() => {
      stopBrailleSpinner(spinnerSpan, intervalId);
      loginBtn.innerHTML = "Login";
      loginBtn.disabled = false;
    });
};

signupBtn.onclick = () => {
  const spinnerSpan = document.createElement("span");
  spinnerSpan.className = "braille-spinner";
  signupBtn.innerHTML = "Signing up ";
  signupBtn.appendChild(spinnerSpan);
  signupBtn.disabled = true;

  const intervalId = startBrailleSpinner(spinnerSpan);

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCred => {
      return db.collection("players").doc(userCred.user.uid).set({
        level: 1
      });
    })
    .catch(err => alert(err.message))
    .finally(() => {
      stopBrailleSpinner(spinnerSpan, intervalId);
      signupBtn.innerHTML = "Sign Up";
      signupBtn.disabled = false;
    });
};

auth.onAuthStateChanged(user => {
  if (user) {
    // Hide login/signup form
    document.querySelector(".form-section").classList.add("hidden");

    // Show the game section
    document.getElementById("game-section").classList.remove("hidden");

    // Show user's email
    document.getElementById("username").textContent = user.email;

    // Load and display player level from Firestore
    db.collection("players").doc(user.uid).get()
      .then(doc => {
        if (doc.exists) {
          document.getElementById("playerLevel").textContent = doc.data().level;
        } else {
          // Player doc doesn't exist? Maybe fallback or init here.
          db.collection("players").doc(user.uid).set({ level: 1 });
          document.getElementById("playerLevel").textContent = 1;
        }
      });
  } else {
    // Show login/signup again
    document.querySelector(".form-section").classList.remove("hidden");
    document.getElementById("game-section").classList.add("hidden");
  }
});
