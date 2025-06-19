// Firebase Configuration
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
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const forgotPasswordLink = document.querySelector(".login .links a[href='#']");

const togglePassword = document.getElementById("togglePassword");

if (togglePassword) {
    togglePassword.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);

        const eyeIcon = togglePassword.querySelector('i');
        if (type === "password") {
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        } else {
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        }
    });
}

// --- Utility Functions (for messages and spinners) ---
function showMessageBox(message, type = 'info', duration = 3000) {
    let messageBox = document.getElementById('customMessageBox');
    let messageText = document.getElementById('messageBoxText');

    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.id = 'customMessageBox';
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
            font-family: inherit;
            font-size: 1.1em;
            display: none; /* Hide by default */
        `;
        messageText = document.createElement('p');
        messageText.id = 'messageBoxText';
        messageBox.appendChild(messageText);
        document.body.appendChild(messageBox);
    }

    messageText.innerText = message;
    messageBox.style.display = 'block';

    messageBox.style.backgroundColor = '#333';
    messageBox.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
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

// --- Key Derivation Functions (for Master Password) ---
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

// --- Login Functionality ---
async function handleLogin() {
    const spinnerSpan = document.createElement("span");
    spinnerSpan.className = "braille-spinner";
    loginBtn.innerHTML = "Logging in ";
    loginBtn.appendChild(spinnerSpan);
    loginBtn.disabled = true;

    const intervalId = startBrailleSpinner(spinnerSpan);

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const userCred = await auth.signInWithEmailAndPassword(email, password);
        const user = userCred.user;

        // Fetch user's salt to derive encryption key
        const playerDoc = await db.collection("players").doc(user.uid).get();
        const playerData = playerDoc.data();

        if (playerData && playerData.salt && playerData.masterPasswordHash) {
            const derivedEncryptionKey = await deriveKey(password, playerData.salt);
            // Store the derived key in sessionStorage (dashboard.js will not rely on it for this version)
            sessionStorage.setItem('currentEncryptionKeyHex', derivedEncryptionKey.toString(CryptoJS.enc.Hex));
        } else {
            console.warn("User data (salt/masterPasswordHash) missing for login. Encryption features might require manual unlock.");
        }

        window.location.href = "dashboard.html";
    } catch (err) {
        showMessageBox(err.message, 'error');
    } finally {
        stopBrailleSpinner(spinnerSpan, intervalId);
        loginBtn.innerHTML = "Sign in";
        loginBtn.disabled = false;
    }
}

loginBtn.onclick = handleLogin;

emailInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        handleLogin();
    }
});

passwordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        handleLogin();
    }
});

// --- Signup Functionality ---
signupBtn.onclick = async () => {
    const spinnerSpan = document.createElement("span");
    spinnerSpan.className = "braille-spinner";
    signupBtn.innerHTML = "Signing up ";
    signupBtn.appendChild(spinnerSpan);
    signupBtn.disabled = true;

    const intervalId = startBrailleSpinner(spinnerSpan);

    const email = emailInput.value;
    const password = passwordInput.value; // This will be the master password

    if (password.length < 8) {
        showMessageBox("Password must be at least 8 characters long.", "error");
        stopBrailleSpinner(spinnerSpan, intervalId);
        signupBtn.innerHTML = "Sign Up";
        signupBtn.disabled = false;
        return;
    }

    try {
        const userCred = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCred.user;

        const userSalt = generateSalt();
        const masterPasswordHash = (await deriveKey(password, userSalt)).toString(CryptoJS.enc.Hex);

        await db.collection("players").doc(user.uid).set({
            level: 1,
            salt: userSalt,
            masterPasswordHash: masterPasswordHash
        });

        // Store the derived key in sessionStorage (dashboard.js will not rely on it for this version)
        const derivedEncryptionKey = await deriveKey(password, userSalt);
        sessionStorage.setItem('currentEncryptionKeyHex', derivedEncryptionKey.toString(CryptoJS.enc.Hex));

        showMessageBox("Account created successfully! Redirecting to dashboard...", 'success');
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);

    } catch (err) {
        showMessageBox(err.message, 'error');
        console.error("Signup error:", err);
    } finally {
        stopBrailleSpinner(spinnerSpan, intervalId);
        signupBtn.innerHTML = "Sign Up";
        signupBtn.disabled = false;
    }
};

// --- Forgot Password Functionality ---
forgotPasswordLink.onclick = (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
        showMessageBox("Please enter your email address to reset your password.", 'error');
        return;
    }

    showMessageBox("Sending password reset email...");

    auth.sendPasswordResetEmail(email)
        .then(() => {
            showMessageBox("Password reset email sent! Check your inbox.", 'success');
            emailInput.value = '';
        })
        .catch((error) => {
            showMessageBox(`Error: ${error.message}`, 'error');
            console.error("Password reset error:", error);
        });
};
