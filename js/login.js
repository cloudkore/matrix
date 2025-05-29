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
const emailInput = document.getElementById("email"); // Get the email input
const passwordInput = document.getElementById("password"); // Get the password input
const forgotPasswordLink = document.querySelector(".login .links a[href='#']");

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
    span.style.display = 'inline-block';
    return setInterval(() => {
        span.textContent = brailleFrames[i++ % brailleFrames.length];
    }, 120);
}

function stopBrailleSpinner(span, intervalId) {
    clearInterval(intervalId);
    span.style.display = 'none';
    span.textContent = '';
}

// Function to handle the actual login process (reused for button click and Enter key)
function handleLogin() {
    const spinnerSpan = document.createElement("span");
    spinnerSpan.className = "braille-spinner";
    loginBtn.innerHTML = "Logging in ";
    loginBtn.appendChild(spinnerSpan);
    loginBtn.disabled = true;

    const intervalId = startBrailleSpinner(spinnerSpan);

    const email = emailInput.value; // Use the grabbed emailInput
    const password = passwordInput.value; // Use the grabbed passwordInput

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = "dashboard.html";
        })
        .catch(err => {
            showMessageBox(err.message);
        })
        .finally(() => {
            stopBrailleSpinner(spinnerSpan, intervalId);
            loginBtn.innerHTML = "Sign in";
            loginBtn.disabled = false;
        });
}

// Attach handleLogin to the button click
loginBtn.onclick = handleLogin;

// Add event listeners for "Enter" key press on input fields
emailInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent default form submission behavior (if any)
        handleLogin(); // Trigger login
    }
});

passwordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent default form submission behavior (if any)
        handleLogin(); // Trigger login
    }
});


signupBtn.onclick = () => {
    const spinnerSpan = document.createElement("span");
    spinnerSpan.className = "braille-spinner";
    signupBtn.innerHTML = "Signing up ";
    signupBtn.appendChild(spinnerSpan);
    signupBtn.disabled = true;

    const intervalId = startBrailleSpinner(spinnerSpan);

    const email = emailInput.value; // Use the grabbed emailInput
    const password = passwordInput.value; // Use the grabbed passwordInput

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCred => {
            return db.collection("players").doc(userCred.user.uid).set({ level: 1 });
        })
        .then(() => {
            window.location.href = "dashboard.html";
        })
        .catch(err => {
            showMessageBox(err.message);
        })
        .finally(() => {
            stopBrailleSpinner(spinnerSpan, intervalId);
            signupBtn.innerHTML = "Sign Up";
            signupBtn.disabled = false;
        });
};

forgotPasswordLink.onclick = (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
        showMessageBox("Please enter your email address to reset your password.");
        return;
    }

    showMessageBox("Sending password reset email...");

    auth.sendPasswordResetEmail(email)
        .then(() => {
            showMessageBox("Password reset email sent! Check your inbox.");
            emailInput.value = '';
        })
        .catch((error) => {
            showMessageBox(`Error: ${error.message}`);
            console.error("Password reset error:", error);
        });
};
