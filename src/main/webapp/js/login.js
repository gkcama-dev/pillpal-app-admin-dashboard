/**
 * PillPal Admin Login Logic
 */

//email input focus
document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.focus();
});

// Password (Toggle Password)
function togglePassword() {
    const pwInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    if (pwInput.type === 'password') {
        pwInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        pwInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

// Demo Button fields
function fillDemo(email, password) {
    document.getElementById('email').value = email;
    document.getElementById('password').value = password;
    document.getElementById('alertError').classList.remove('show');
}

// Login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const alertError = document.getElementById('alertError');
    const alertMsg = document.getElementById('alertMsg');
    const spinner = document.getElementById('spinner');
    const btnText = document.getElementById('btnText');
    const loginBtn = document.getElementById('loginBtn');


    alertError.classList.remove('show');

    // Fields
    if (!email || !password) {
        alertMsg.textContent = 'Please enter both email and password.';
        alertError.classList.add('show');
        return;
    }

    // Loading State
    spinner.style.display = 'block';
    btnText.style.display = 'none';
    loginBtn.disabled = true;

    try {
        // Checked Firestore 'admins' collection -> email & password
        const snapshot = await db.collection("admin")
            .where("email", "==", email)
            .where("password", "==", password)
            .get();

        if (!snapshot.empty) {
            // Login Success

            const adminData = snapshot.docs[0].data();

            // --- SESSION ---
            // localStorage email
            localStorage.setItem("adminLoggedIn", "true");
            localStorage.setItem("adminEmail", adminData.email);

            btnText.innerHTML = '<i class="fas fa-check"></i>&nbsp; Success!';
            btnText.style.display = 'block';
            spinner.style.display = 'none';
            loginBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

            // -> Dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);

        } else {
            throw new Error('Invalid email or password.');
        }

    } catch (error) {
        // Error
        spinner.style.display = 'none';
        btnText.style.display = 'block';
        loginBtn.disabled = false;

        alertMsg.textContent = 'Error Data Try Again..';
        alertError.classList.add('show');

        // Password clear focus
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
        console.error("Login Error: ", error);
    }
}