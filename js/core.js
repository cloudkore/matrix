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

function startBrailleSpinner(span) {
  const brailleFrames = ['⠁', '⠃', '⠇', '⠧', '⠷', '⠿'];
  let i = 0;
  span.classList.remove('d-none');
  return setInterval(() => {
    span.textContent = brailleFrames[i++ % brailleFrames.length];
  }, 120);
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
    .then(() => {
      window.location.href = "dashboard.html";
    })
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
      // Set initial player level in Firestore, then redirect
      return db.collection("players").doc(userCred.user.uid).set({ level: 1 });
    })
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message))
    .finally(() => {
      stopBrailleSpinner(spinnerSpan, intervalId);
      signupBtn.innerHTML = "Sign Up";
      signupBtn.disabled = false;
    });
};