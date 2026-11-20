"use strict";

/* =========================================================
   RAILBLOCK-AI AUTHENTICATION
   Prototype storage: browser localStorage.
   Production note: use a real database + hashed passwords.
========================================================= */

const ACCOUNT_KEY = "railblock_users";
const SESSION_KEY = "railblock_current_user";
const API_BASE = "http://localhost:3000";

let loginPage, registerPage, forgotPasswordPage;
let loginForm, registerForm, forgotPasswordForm;
let createAccountButton, backToLoginButton, forgotPasswordButton;
let backToLoginFromForgot, resetPasswordButton;
let loginMessage, registerMessage, forgotMessage, otpStep;
let roleButtons;

document.addEventListener("DOMContentLoaded", initializeLoginPage);

function initializeLoginPage() {
    loginPage = document.getElementById("loginPage");
    registerPage = document.getElementById("registerPage");
    forgotPasswordPage = document.getElementById("forgotPasswordPage");

    loginForm = document.getElementById("loginForm");
    registerForm = document.getElementById("registerForm");
    forgotPasswordForm = document.getElementById("forgotPasswordForm");

    createAccountButton = document.getElementById("createAccount");
    backToLoginButton = document.getElementById("backToLogin");
    forgotPasswordButton = document.getElementById("forgotPasswordButton");
    backToLoginFromForgot = document.getElementById("backToLoginFromForgot");
    resetPasswordButton = document.getElementById("resetPasswordButton");

    loginMessage = document.getElementById("loginMessage");
    registerMessage = document.getElementById("registerMessage");
    forgotMessage = document.getElementById("forgotMessage");
    otpStep = document.getElementById("otpStep");

    roleButtons = document.querySelectorAll(".role");

    if (localStorage.getItem(SESSION_KEY)) {
        window.location.href = "dashboard.html";
        return;
    }

    loginForm.dataset.role = "controller";

    setupRoleSelection();
    setupPageSwitching();
    setupRegistration();
    setupLogin();
    setupForgotPassword();
}

/* =========================================================
   ACCOUNT STORAGE
========================================================= */

function getAccounts() {
    try {
        const savedAccounts = localStorage.getItem(ACCOUNT_KEY);
        if (!savedAccounts) return [];
        const accounts = JSON.parse(savedAccounts);
        return Array.isArray(accounts) ? accounts : [];
    } catch (error) {
        console.error("Unable to load accounts:", error);
        return [];
    }
}

function saveAccounts(accounts) {
    try {
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
        return true;
    } catch (error) {
        console.error("Unable to save accounts:", error);
        return false;
    }
}

/* =========================================================
   MESSAGES
========================================================= */

function setMessage(element, message, type = "error") {
    if (!element) return;
    element.textContent = message;
    element.style.color = type === "success" ? "#159447" : "#d62828";
}

function showLoginMessage(message, type = "error") {
    setMessage(loginMessage, message, type);
}

function showRegisterMessage(message, type = "error") {
    setMessage(registerMessage, message, type);
}

function showForgotMessage(message, type = "error") {
    setMessage(forgotMessage, message, type);
}

function clearMessages() {
    [loginMessage, registerMessage, forgotMessage].forEach((el) => {
        if (el) el.textContent = "";
    });
}

/* =========================================================
   ROLE SELECTION
========================================================= */

function setupRoleSelection() {
    roleButtons.forEach((button) => {
        button.addEventListener("click", () => {
            roleButtons.forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
            loginForm.dataset.role = button.dataset.role;
        });
    });
}

/* =========================================================
   PAGE SWITCHING
========================================================= */

function showAuthPage(page) {
    [loginPage, registerPage, forgotPasswordPage].forEach((el) => {
        el?.classList.add("hidden");
    });
    page?.classList.remove("hidden");
}

function setupPageSwitching() {
    createAccountButton.addEventListener("click", () => {
        showAuthPage(registerPage);
        clearMessages();
        document.getElementById("loginForgotAfterError")?.classList.add("hidden");
        registerForm.reset();
    });

    backToLoginButton.addEventListener("click", () => {
        showAuthPage(loginPage);
        clearMessages();
        document.getElementById("loginForgotAfterError")?.classList.add("hidden");
        loginForm.reset();
        restoreDefaultRole();
    });

    forgotPasswordButton?.addEventListener("click", () => {
        showAuthPage(forgotPasswordPage);
        clearMessages();
        forgotPasswordForm?.reset();
        otpStep?.classList.add("hidden");
    });

    backToLoginFromForgot?.addEventListener("click", () => {
        showAuthPage(loginPage);
        clearMessages();
        loginForm.reset();
        restoreDefaultRole();
    });
}

function restoreDefaultRole() {
    loginForm.dataset.role = "controller";
    roleButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.role === "controller");
    });
}

/* =========================================================
   REGISTRATION
========================================================= */

function setupRegistration() {
    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const username = document.getElementById("newUsername").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const role = document.getElementById("role").value;
        const password = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const accounts = getAccounts();

        const usernamePattern = /^[a-zA-Z0-9_.-]{3,30}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!usernamePattern.test(username)) {
            showRegisterMessage(
                "Username must be 3–30 characters and contain only letters, numbers, dots, underscores, or hyphens."
            );
            return;
        }

        if (!emailPattern.test(email)) {
            showRegisterMessage("Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            showRegisterMessage("Password must contain at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showRegisterMessage("Passwords do not match.");
            return;
        }

        if (accounts.some(a => a.username?.toLowerCase() === username.toLowerCase())) {
            showRegisterMessage("Username already exists. Please choose another.");
            return;
        }

        if (accounts.some(a => a.email?.toLowerCase() === email)) {
            showRegisterMessage("Email is already registered.");
            return;
        }

        const newAccount = {
            id: createAccountId(),
            username,
            email,
            password,
            role,
            profilePicture: "",
            createdAt: new Date().toISOString()
        };

        accounts.push(newAccount);

        if (!saveAccounts(accounts)) {
            showRegisterMessage("Unable to create account. Please try again.");
            return;
        }

        showRegisterMessage("Account created successfully.", "success");
        registerForm.reset();

        setTimeout(() => {
            showAuthPage(loginPage);
            loginForm.reset();
            clearMessages();
            restoreDefaultRole();
            showLoginMessage("Account created. Please sign in.", "success");
        }, 700);
    });
}

/* =========================================================
   LOGIN
========================================================= */

function setupLogin() {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const selectedRole = loginForm.dataset.role || "controller";
        const accounts = getAccounts();

        const account = accounts.find((user) =>
            user.username &&
            user.username.toLowerCase() === username.toLowerCase() &&
            user.password === password
        );

        if (!account) {
            showLoginMessage("Invalid username or password.");
            showLoginForgotPasswordOption();
            return;
        }

        if (account.role !== selectedRole) {
            showLoginMessage("The selected role does not match this account.");
            return;
        }

        const loginEntry = {
            id: createAccountId(),
            timestamp: new Date().toISOString(),
            device: getDeviceLabel(),
            browser: getBrowserLabel(),
            platform: navigator.platform || "Unknown platform"
        };

        account.loginHistory = Array.isArray(account.loginHistory) ? account.loginHistory : [];
        account.loginHistory.unshift(loginEntry);
        account.loginHistory = account.loginHistory.slice(0, 20);
        saveAccounts(accounts);

        const sessionUser = {
            id: account.id,
            username: account.username,
            email: account.email,
            role: account.role,
            profilePicture: account.profilePicture || ""
        };

        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

            const historyKey = `railblock_login_history_${account.id}`;
            let history = [];

            try {
                history = JSON.parse(localStorage.getItem(historyKey) || "[]");
                if (!Array.isArray(history)) history = [];
            } catch {
                history = [];
            }

            history.unshift({
                device: getLoginDeviceName(),
                browser: getLoginBrowserName(),
                time: new Date().toISOString(),
                userAgent: navigator.userAgent
            });

            localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 50)));
        } catch (error) {
            showLoginMessage("Unable to create login session.");
            return;
        }

        showLoginMessage("Login successful.", "success");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 350);
    });
}

function showLoginForgotPasswordOption() {
    let wrap = document.getElementById("loginForgotAfterError");

    if (!wrap) {
        wrap = document.createElement("div");
        wrap.id = "loginForgotAfterError";
        wrap.className = "login-forgot-after-error";
        wrap.innerHTML = `
            <span>Need to recover your password?</span>
            <button type="button" id="loginForgotAfterErrorButton">
                Forgot password?
            </button>
        `;

        const message = document.getElementById("loginMessage");
        message?.parentNode?.insertBefore(wrap, message.nextSibling);

        document.getElementById("loginForgotAfterErrorButton")
            ?.addEventListener("click", () => {
                showAuthPage(forgotPasswordPage);
                clearMessages();
                forgotPasswordForm?.reset();
                otpStep?.classList.add("hidden");
            });
    }

    wrap.classList.remove("hidden");
}

/* =========================================================
   FORGOT PASSWORD / EMAIL OTP
========================================================= */

function setupForgotPassword() {
    forgotPasswordForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("resetEmail").value.trim().toLowerCase();
        if (!isValidEmail(email)) {
            showForgotMessage("Please enter a valid email address.");
            return;
        }

        const account = getAccounts().find(
            a => a.email?.toLowerCase() === email
        );

        // Do not reveal whether an email is registered in production.
        if (!account) {
            showForgotMessage(
                "If an account exists for this email, an OTP request has been processed."
            );
            return;
        }

        const button = document.getElementById("sendOtpButton");
        button.disabled = true;
        button.textContent = "Sending...";

        try {
            const response = await fetch(`${API_BASE}/api/request-password-reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to send OTP.");
            }

            showForgotMessage(
                "OTP sent to your registered email. It expires in 10 minutes.",
                "success"
            );
            otpStep.classList.remove("hidden");
            document.getElementById("resetOtp").focus();
        } catch (error) {
            showForgotMessage(
                `${error.message} Make sure the RailBlock-AI backend is running.`
            );
        } finally {
            button.disabled = false;
            button.textContent = "Resend OTP";
        }
    });

    resetPasswordButton?.addEventListener("click", async () => {
        const email = document.getElementById("resetEmail").value.trim().toLowerCase();
        const otp = document.getElementById("resetOtp").value.trim();
        const newPassword = document.getElementById("resetNewPassword").value;
        const confirmPassword = document.getElementById("resetConfirmPassword").value;

        if (!/^\d{6}$/.test(otp)) {
            showForgotMessage("Enter the 6-digit OTP sent to your email.");
            return;
        }

        if (newPassword.length < 6) {
            showForgotMessage("New password must contain at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            showForgotMessage("Passwords do not match.");
            return;
        }

        resetPasswordButton.disabled = true;
        resetPasswordButton.textContent = "Verifying...";

        try {
            const response = await fetch(`${API_BASE}/api/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "OTP verification failed.");
            }

            // The current prototype keeps accounts in localStorage.
            // Update that local record only after the server validates the OTP.
            const accounts = getAccounts();
            const index = accounts.findIndex(
                a => a.email?.toLowerCase() === email
            );

            if (index === -1) throw new Error("Local account was not found.");

            accounts[index].password = newPassword;
            if (!saveAccounts(accounts)) {
                throw new Error("Password verified, but local account update failed.");
            }

            showForgotMessage(
                "Password changed successfully. You can now sign in.",
                "success"
            );

            setTimeout(() => {
                showAuthPage(loginPage);
                loginForm.reset();
                clearMessages();
                restoreDefaultRole();
                showLoginMessage("Password reset successful. Please sign in.", "success");
            }, 900);
        } catch (error) {
            showForgotMessage(error.message);
        } finally {
            resetPasswordButton.disabled = false;
            resetPasswordButton.textContent = "Verify OTP & Change Password";
        }
    });
}

function getLoginDeviceName() {
    const ua = navigator.userAgent.toLowerCase();

    if (/android/.test(ua)) return "Android device";
    if (/iphone|ipad|ipod/.test(ua)) return "iPhone / iPad";
    if (/windows/.test(ua)) return "Windows PC";
    if (/macintosh|mac os/.test(ua)) return "Mac";
    if (/linux/.test(ua)) return "Linux PC";
    return "Unknown device";
}

function getLoginBrowserName() {
    const ua = navigator.userAgent;

    if (/edg\//i.test(ua)) return "Microsoft Edge";
    if (/opr\//i.test(ua)) return "Opera";
    if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) return "Google Chrome";
    if (/firefox|fxios/i.test(ua)) return "Mozilla Firefox";
    if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) return "Safari";
    return "Browser";
}

/* =========================================================
   HELPERS
========================================================= */

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getDeviceLabel() {
    const ua = navigator.userAgent || "";
    if (/Android/i.test(ua)) return "Android device";
    if (/iPhone|iPad|iPod/i.test(ua)) return "iPhone/iPad";
    if (/Windows/i.test(ua)) return "Windows PC";
    if (/Macintosh|Mac OS X/i.test(ua)) return "Mac";
    if (/Linux/i.test(ua)) return "Linux computer";
    return "Unknown device";
}

function getBrowserLabel() {
    const ua = navigator.userAgent || "";
    if (/Edg\//i.test(ua)) return "Microsoft Edge";
    if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return "Google Chrome";
    if (/Firefox\//i.test(ua)) return "Mozilla Firefox";
    if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
    return "Web browser";
}

function createAccountId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }
    return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
