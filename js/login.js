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

// Custom message box for alerts (instead of alert())
function showMessageBox(message) {
    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #333;
        color: #fff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        z-index: 10000;
        text-align: center;
        font-family: 'Quicksand', sans-serif;
        font-size: 1.1em;
    `;
    messageBox.innerText = message;
    document.body.appendChild(messageBox);

    setTimeout(() => {
        messageBox.remove();
    }, 3000); // Message disappears after 3 seconds
}


function startBrailleSpinner(span) {
    const brailleFrames = ['⠁', '⠃', '⠇', '⠧', '⠷', '⠿'];
    let i = 0;
    // Ensure span is visible, remove d-none if it was added
    span.style.display = 'inline-block';
    return setInterval(() => {
        span.textContent = brailleFrames[i++ % brailleFrames.length];
    }, 120);
}

function stopBrailleSpinner(span, intervalId) {
    clearInterval(intervalId);
    span.style.display = 'none'; // Hide the spinner
    span.textContent = '';
}

loginBtn.onclick = () => {
    const spinnerSpan = document.createElement("span");
    spinnerSpan.className = "braille-spinner";
    loginBtn.innerHTML = "Logging in "; // Reset innerHTML before appending
    loginBtn.appendChild(spinnerSpan);
    loginBtn.disabled = true;

    const intervalId = startBrailleSpinner(spinnerSpan);

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = "dashboard.html"; // Redirect to dashboard.html
        })
        .catch(err => {
            showMessageBox(err.message); // Use custom message box
        })
        .finally(() => {
            stopBrailleSpinner(spinnerSpan, intervalId);
            loginBtn.innerHTML = "Sign in"; // Reset button text
            loginBtn.disabled = false;
        });
};

signupBtn.onclick = () => {
    const spinnerSpan = document.createElement("span");
    spinnerSpan.className = "braille-spinner";
    signupBtn.innerHTML = "Signing up "; // Reset innerHTML before appending
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
            window.location.href = "dashboard.html"; // Redirect to dashboard.html
        })
        .catch(err => {
            showMessageBox(err.message); // Use custom message box
        })
        .finally(() => {
            stopBrailleSpinner(spinnerSpan, intervalId);
            signupBtn.innerHTML = "Sign Up"; // Reset button text
            signupBtn.disabled = false;
        });
};
