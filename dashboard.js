/* =========================================================
   RAILBLOCK-AI DASHBOARD JAVASCRIPT
========================================================= */

"use strict";

const SESSION_KEY = "railblock_current_user";
const ACCOUNT_KEY = "railblock_users";

document.addEventListener("DOMContentLoaded", () => {
    initDashboard();
});


/* =========================================================
   INITIALIZATION
========================================================= */

function initDashboard() {
    const user = getCurrentUser();

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    loadUserDetails(user);
    setupLogout();
    setupNavigation();
    setupPageLinks();
    setupNotifications();
    setupAlerts();
    setupPlanner();
    setupAccountManagement();

    openPage("dashboard");
}


/* =========================================================
   SESSION MANAGEMENT
========================================================= */

function getCurrentUser() {
    const savedUser = localStorage.getItem(SESSION_KEY);

    if (!savedUser) {
        return null;
    }

    try {
        const user = JSON.parse(savedUser);

        if (!user || !user.username) {
            throw new Error("Invalid session");
        }

        return user;
    } catch (error) {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
}


/* =========================================================
   USER DETAILS
========================================================= */

function loadUserDetails(user) {
    const usernameElement = document.getElementById("username");
    const roleElement = document.getElementById("userRole");

    if (usernameElement) {
        usernameElement.textContent = user.username;
    }

    if (roleElement) {
        roleElement.textContent = formatRole(user.role);
    }
}


function formatRole(role) {
    const roles = {
        controller: "Section Controller",
        maintenance: "Maintenance Team",
        admin: "System Admin"
    };

    return roles[role] || "User";
}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {
    const logoutButton = document.getElementById("logoutButton");

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener("click", () => {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = "index.html";
    });
}


/* =========================================================
   PAGE ELEMENTS
========================================================= */

const dashboardPage = document.getElementById("dashboardPage");
const modulePage = document.getElementById("modulePage");
const plannerPage = document.getElementById("plannerPage");
const accountPage = document.getElementById("accountPage");

const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");

const moduleTitle = document.getElementById("moduleTitle");
const moduleDescription = document.getElementById("moduleDescription");
const moduleGrid = document.getElementById("moduleGrid");


/* =========================================================
   MODULE DATA
========================================================= */

const moduleData = {
    defects: {
        title: "AI Defect Detection",
        description:
            "AI-assisted detection and classification of railway track defects.",
        cards: [
            ["Open Defects", "Track defects currently requiring attention.", "8"],
            ["AI Confidence", "Average confidence of current AI detections.", "94%"],
            ["Critical Defects", "High-priority defects detected by the system.", "2"]
        ]
    },

    cctv: {
        title: "CCTV Monitoring",
        description: "Monitor connected railway CCTV feeds.",
        cards: [
            ["Active Cameras", "CCTV cameras connected to the monitoring system.", "48"],
            ["Online", "Cameras currently operating normally.", "46"],
            ["Offline", "Cameras requiring attention.", "2"]
        ]
    },

    timetable: {
        title: "Train Timetable",
        description: "Live train movement and timetable information.",
        cards: [
            ["Active Trains", "Trains currently being monitored.", "12"],
            ["Delayed", "Trains currently outside their expected schedule.", "2"],
            ["Next Arrival", "Nearest important train arrival.", "10:30 AM"]
        ]
    },

    assets: {
        title: "Assets / Track",
        description: "Railway track and asset health monitoring.",
        cards: [
            ["Tracked Sections", "Railway sections under monitoring.", "24"],
            ["Healthy Assets", "Assets currently operating normally.", "18"],
            ["Attention Required", "Assets requiring inspection.", "6"]
        ]
    },

    conflict: {
        title: "Conflict Detection",
        description:
            "Detect conflicts between train schedules and maintenance blocks.",
        cards: [
            ["Open Conflicts", "Current operational conflicts.", "2"],
            ["High Risk", "Conflicts requiring immediate action.", "1"],
            ["Resolved", "Conflicts resolved by the system.", "4"]
        ]
    },

    maintenance: {
        title: "Maintenance",
        description: "Manage railway maintenance activities.",
        cards: [
            ["Pending Jobs", "Maintenance activities awaiting action.", "8"],
            ["In Progress", "Jobs currently under execution.", "3"],
            ["Completed", "Recently completed maintenance jobs.", "14"]
        ]
    },

    alerts: {
        title: "Alerts",
        description: "Centralized railway safety and operational alerts.",
        cards: [
            ["Critical", "Immediate safety alerts.", "2"],
            ["Warnings", "Events requiring monitoring.", "4"],
            ["Information", "General system notifications.", "6"]
        ]
    },

    network: {
        title: "Network View",
        description: "Railway section network monitoring.",
        cards: [
            ["Sections", "Connected railway sections.", "24"],
            ["Normal", "Sections operating normally.", "17"],
            ["Attention", "Sections requiring review.", "7"]
        ]
    },

    analytics: {
        title: "Analytics",
        description: "Operational performance analytics.",
        cards: [
            ["Asset Availability", "Estimated asset availability.", "96.4%"],
            ["Block Efficiency", "Maintenance block efficiency.", "91%"],
            ["AI Accuracy", "Current AI confidence metric.", "94%"]
        ]
    },

    impact: {
        title: "Impact Dashboard",
        description:
            "Measure the operational impact of AI-assisted planning.",
        cards: [
            ["Downtime Reduced", "Estimated reduction in maintenance disruption.", "28%"],
            ["Conflicts Avoided", "Potential conflicts prevented.", "16"],
            ["Availability Gain", "Estimated improvement in asset availability.", "12%"]
        ]
    },

    reports: {
        title: "Reports",
        description: "Railway operations and maintenance reports.",
        cards: [
            ["Daily Report", "Latest railway operations report.", "READY"],
            ["Maintenance Report", "Latest maintenance report.", "READY"],
            ["AI Planning Report", "Latest block planning report.", "READY"]
        ]
    },

    demo: {
        title: "Live Demo Mode",
        description: "Interactive RailBlock-AI prototype demonstration.",
        cards: [
            ["Simulation", "Prototype simulation status.", "ACTIVE"],
            ["AI Planner", "AI block planning engine.", "READY"],
            ["Monitoring", "Live monitoring simulation.", "RUNNING"]
        ]
    }
};


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach((button) => {
        button.addEventListener("click", () => {
            const page = button.dataset.page;

            setActiveNavigation(page);
            openPage(page);
        });
    });
}


function setActiveNavigation(page) {
    document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.page === page);
    });
}


function setupPageLinks() {
    document.querySelectorAll("[data-page-link]").forEach((button) => {
        button.addEventListener("click", () => {
            const page = button.dataset.pageLink;

            setActiveNavigation(page);
            openPage(page);
        });
    });
}


/* =========================================================
   OPEN PAGE
========================================================= */

function hideAllPages() {
    dashboardPage?.classList.add("hidden");
    modulePage?.classList.add("hidden");
    plannerPage?.classList.add("hidden");
    accountPage?.classList.add("hidden");
}


function openPage(page) {
    hideAllPages();

    if (page === "dashboard") {
        dashboardPage?.classList.remove("hidden");

        pageTitle.textContent = "Main Dashboard";
        pageSubtitle.textContent = "Railway operations overview";

        return;
    }

    if (page === "planner") {
        plannerPage?.classList.remove("hidden");

        pageTitle.textContent = "AI Block Planner";
        pageSubtitle.textContent = "Automatic maintenance block planning";

        return;
    }

    if (page === "account") {
        accountPage?.classList.remove("hidden");

        pageTitle.textContent = "Manage Account";
        pageSubtitle.textContent = "Profile and security settings";

        loadAccountSettings();
        return;
    }

    const module = moduleData[page];

    if (!module) {
        return;
    }

    modulePage?.classList.remove("hidden");

    pageTitle.textContent = module.title;
    pageSubtitle.textContent = "RailBlock-AI operations module";

    moduleTitle.textContent = module.title;
    moduleDescription.textContent = module.description;

    renderModuleCards(module.cards);
}


function renderModuleCards(cards) {
    moduleGrid.innerHTML = "";

    cards.forEach(([title, description, value]) => {
        const card = document.createElement("div");
        card.className = "module-card";

        const heading = document.createElement("h3");
        heading.textContent = title;

        const text = document.createElement("p");
        text.textContent = description;

        const result = document.createElement("div");
        result.className = "module-value";
        result.textContent = value;

        card.append(heading, text, result);
        moduleGrid.appendChild(card);
    });
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function setupNotifications() {
    const notificationButton =
        document.getElementById("notificationButton");

    if (!notificationButton) {
        return;
    }

    notificationButton.addEventListener("click", () => {
        setActiveNavigation("alerts");
        openPage("alerts");
    });
}


/* =========================================================
   ALERTS
========================================================= */

function setupAlerts() {
    const clearButton = document.getElementById("clearAlerts");

    if (!clearButton) {
        return;
    }

    clearButton.addEventListener("click", clearAlerts);
}


function clearAlerts() {
    const alertsList = document.getElementById("alertsList");
    const notificationCount =
        document.querySelector(".notification-count");

    if (alertsList) {
        alertsList.innerHTML = `
            <div class="alert-item">
                <p>
                    No new alerts.
                    Railway monitoring is active.
                </p>
            </div>
        `;
    }

    if (notificationCount) {
        notificationCount.textContent = "0";
        notificationCount.style.display = "none";
    }
}


/* =========================================================
   AI BLOCK PLANNER
========================================================= */

function setupPlanner() {
    const generateButton = document.getElementById("generatePlan");

    if (!generateButton) {
        return;
    }

    generateButton.addEventListener("click", generatePlan);
}


function generatePlan() {
    const track = document.getElementById("trackSection")?.value;
    const maintenance =
        document.getElementById("maintenanceType")?.value;
    const durationInput = document.getElementById("duration");
    const result = document.getElementById("aiResult");

    if (!track || !maintenance || !durationInput || !result) {
        return;
    }

    const duration = Number(durationInput.value);

    if (!Number.isFinite(duration) || duration < 10) {
        result.innerHTML = `
            <h3>Invalid Duration</h3>
            <p>
                Please enter a maintenance duration of at least
                10 minutes.
            </p>
        `;

        durationInput.focus();
        return;
    }

    if (duration > 720) {
        result.innerHTML = `
            <h3>Invalid Duration</h3>
            <p>
                Duration cannot be greater than 720 minutes.
            </p>
        `;

        durationInput.focus();
        return;
    }

    const startTime = getRecommendedStartTime();
    const endTime = addMinutes(startTime, duration);

    const impact =
        duration <= 60 ? "LOW" :
        duration <= 180 ? "MEDIUM" :
        "HIGH";

    const confidence =
        duration <= 120 ? "92%" :
        duration <= 300 ? "88%" :
        "83%";

    result.innerHTML = `
        <h3>AI Recommendation</h3>

        <p>
            <strong>Track Section:</strong>
            ${escapeHTML(track)}
            <br><br>

            <strong>Maintenance:</strong>
            ${escapeHTML(maintenance)}
            <br><br>

            <strong>Required Duration:</strong>
            ${duration} minutes
            <br><br>

            <strong>Recommended Window:</strong>
            ${startTime} – ${endTime}
            <br><br>

            <strong>Expected Impact:</strong>
            ${impact}
            <br><br>

            <strong>AI Confidence:</strong>
            ${confidence}
        </p>
    `;
}


function getRecommendedStartTime() {
    const now = new Date();

    let hours = now.getHours() + 1;
    let minutes = 10;

    if (hours >= 24) {
        hours = 0;
    }

    return formatTime(hours, minutes);
}


function addMinutes(time, minutesToAdd) {
    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + minutesToAdd);

    return formatTime(date.getHours(), date.getMinutes());
}


function formatTime(hours, minutes) {
    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${String(displayHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
}


/* =========================================================
   BASIC HTML SAFETY
========================================================= */

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* =========================================================
   ACCOUNT MANAGEMENT
========================================================= */

const API_BASE = "http://localhost:3000";

function setupAccountManagement() {
    document.getElementById("profileButton")?.addEventListener("click", () => {
        setActiveNavigation("");
        openPage("account");
    });

    document.getElementById("profileForm")?.addEventListener("submit", saveProfileChanges);
    document.getElementById("verifyEmailButton")?.addEventListener("click", handleEmailVerificationButton);
    document.getElementById("securityToggle")?.addEventListener("click", toggleSecurityPanel);
    document.getElementById("changePasswordForm")?.addEventListener("submit", changeSignedInPassword);
    document.getElementById("accountForgotPasswordButton")?.addEventListener("click", openAccountResetPanel);
    document.getElementById("accountSendResetOtp")?.addEventListener("click", sendAccountResetOtp);
    document.getElementById("accountVerifyResetOtp")?.addEventListener("click", verifyAccountResetOtp);
    document.getElementById("profilePictureInput")?.addEventListener("change", handleProfilePicture);
    document.getElementById("removeProfilePicture")?.addEventListener("click", removeProfilePicture);
}

function getAllAccounts() {
    try {
        const data = localStorage.getItem(ACCOUNT_KEY);
        const accounts = data ? JSON.parse(data) : [];
        return Array.isArray(accounts) ? accounts : [];
    } catch { return []; }
}

function saveAllAccounts(accounts) {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
}

function getDashboardUser() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
}

function loadAccountSettings() {
    const sessionUser = getDashboardUser();
    if (!sessionUser) return;
    const account = getAllAccounts().find(a => a.id === sessionUser.id);
    if (!account) return;

    document.getElementById("accountUsername").value = account.username || "";
    document.getElementById("accountEmail").value = account.email || "";
    document.getElementById("accountDisplayName").textContent = account.username || "User";
    document.getElementById("accountRoleText").textContent = formatRole(account.role);
    renderProfilePicture(account.profilePicture || "");
    renderLoginHistory(account.loginHistory || []);

    const verifyButton = document.getElementById("verifyEmailButton");
    verifyButton?.classList.add("hidden");
    if (verifyButton) verifyButton.textContent = "Verify new email";
    document.getElementById("emailOtpGroup")?.classList.add("hidden");
    document.getElementById("emailChangeOtp") && (document.getElementById("emailChangeOtp").value = "");
}

function renderProfilePicture(dataUrl) {
    const preview = document.getElementById("profilePreview");
    const fallback = document.getElementById("profileFallback");
    const headerImage = document.getElementById("headerProfileImage");
    const headerFallback = document.getElementById("headerAvatarFallback");
    if (dataUrl) {
        preview.src = dataUrl; preview.classList.remove("hidden"); fallback.classList.add("hidden");
        headerImage.src = dataUrl; headerImage.classList.remove("hidden"); headerFallback.classList.add("hidden");
    } else {
        preview.classList.add("hidden"); fallback.classList.remove("hidden");
        headerImage.classList.add("hidden"); headerFallback.classList.remove("hidden");
    }
}

async function saveProfileChanges(event) {
    event.preventDefault();
    const sessionUser = getDashboardUser();
    if (!sessionUser) return;
    const username = document.getElementById("accountUsername").value.trim();
    const newEmail = document.getElementById("accountEmail").value.trim().toLowerCase();
    const message = document.getElementById("profileMessage");
    const usernamePattern = /^[a-zA-Z0-9_.-]{3,30}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!usernamePattern.test(username)) return showAccountMessage(message, "Username must be 3–30 characters and use only letters, numbers, dots, underscores or hyphens.");
    if (!emailPattern.test(newEmail)) return showAccountMessage(message, "Please enter a valid recovery email.");

    const accounts = getAllAccounts();
    const index = accounts.findIndex(a => a.id === sessionUser.id);
    if (index === -1) return showAccountMessage(message, "Account could not be found.");
    const duplicateUsername = accounts.some((a, i) => i !== index && a.username?.toLowerCase() === username.toLowerCase());
    if (duplicateUsername) return showAccountMessage(message, "That username is already in use.");
    const duplicateEmail = accounts.some((a, i) => i !== index && a.email?.toLowerCase() === newEmail);
    if (duplicateEmail) return showAccountMessage(message, "That email is already linked to another account.");

    const oldEmail = (accounts[index].email || "").toLowerCase();
    accounts[index].username = username;

    if (newEmail !== oldEmail) {
        accounts[index].pendingEmail = newEmail;
        saveAllAccounts(accounts);
        sessionUser.username = username;
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
        loadUserDetails(sessionUser);
        document.getElementById("verifyEmailButton")?.classList.remove("hidden");
        showAccountMessage(message, "Username saved. Click 'Verify new email' to send an OTP to the new email.", "success");
        return;
    }

    if (document.getElementById("emailOtpGroup") && !document.getElementById("emailOtpGroup").classList.contains("hidden")) {
        const verified = await verifyPendingEmail();
        if (!verified) return;
    }

    accounts[index].email = newEmail;
    delete accounts[index].pendingEmail;
    saveAllAccounts(accounts);
    sessionUser.username = username;
    sessionUser.email = newEmail;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    loadUserDetails(sessionUser);
    loadAccountSettings();
    showAccountMessage(message, "Profile updated successfully.", "success");
}

async function handleEmailVerificationButton() {
    const otpGroup = document.getElementById("emailOtpGroup");
    if (otpGroup && !otpGroup.classList.contains("hidden")) {
        const verified = await verifyPendingEmail();
        if (verified) {
            const sessionUser = getDashboardUser();
            const account = getAllAccounts().find(a => a.id === sessionUser?.id);
            if (account) {
                sessionUser.username = account.username;
                sessionUser.email = account.email;
                localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
                loadUserDetails(sessionUser);
                document.getElementById("verifyEmailButton").classList.add("hidden");
                document.getElementById("emailChangeOtp").value = "";
                showAccountMessage(document.getElementById("profileMessage"), "Email changed and verified successfully.", "success");
            }
        }
        return;
    }
    await sendEmailChangeOtp();
}

async function sendEmailChangeOtp() {
    const sessionUser = getDashboardUser();
    const accounts = getAllAccounts();
    const index = accounts.findIndex(a => a.id === sessionUser?.id);
    if (index === -1) return;
    const newEmail = document.getElementById("accountEmail").value.trim().toLowerCase();
    if (!newEmail || newEmail === (accounts[index].email || "").toLowerCase()) return showAccountMessage(document.getElementById("profileMessage"), "Enter a different email address first.");
    const button = document.getElementById("verifyEmailButton");
    button.disabled = true; button.textContent = "Sending OTP...";
    try {
        const response = await fetch(`${API_BASE}/api/request-email-change`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newEmail }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to send verification OTP.");
        accounts[index].pendingEmail = newEmail; saveAllAccounts(accounts);
        document.getElementById("emailOtpGroup")?.classList.remove("hidden");
        document.getElementById("verifyEmailButton").textContent = "Verify OTP";
        document.getElementById("emailChangeOtp")?.focus();
        showAccountMessage(document.getElementById("profileMessage"), "OTP sent to the new email. Enter it and click Verify OTP.", "success");
    } catch (error) { showAccountMessage(document.getElementById("profileMessage"), `${error.message} Make sure the backend is running.`); }
    finally { button.disabled = false; button.textContent = "Verify new email"; }
}

async function verifyPendingEmail() {
    const sessionUser = getDashboardUser();
    const accounts = getAllAccounts();
    const index = accounts.findIndex(a => a.id === sessionUser?.id);
    if (index === -1) return false;
    const newEmail = document.getElementById("accountEmail").value.trim().toLowerCase();
    const otp = document.getElementById("emailChangeOtp").value.trim();
    if (!/^\d{6}$/.test(otp)) { showAccountMessage(document.getElementById("profileMessage"), "Enter the 6-digit email verification OTP."); return false; }
    try {
        const response = await fetch(`${API_BASE}/api/verify-email-change`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newEmail, otp }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Email verification failed.");
        accounts[index].email = newEmail; delete accounts[index].pendingEmail; saveAllAccounts(accounts);
        sessionUser.email = newEmail; sessionUser.username = accounts[index].username; localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
        document.getElementById("emailOtpGroup")?.classList.add("hidden");
        const verifyButton = document.getElementById("verifyEmailButton");
        verifyButton?.classList.remove("hidden");
        if (verifyButton) verifyButton.textContent = "Verified";
        return true;
    } catch (error) { showAccountMessage(document.getElementById("profileMessage"), error.message); return false; }
}

async function saveEmailIfNeeded() {
    const sessionUser = getDashboardUser();
    const account = getAllAccounts().find(a => a.id === sessionUser?.id);
    const email = document.getElementById("accountEmail").value.trim().toLowerCase();
    if (account && email !== (account.email || "").toLowerCase()) return await verifyPendingEmail();
    return true;
}

function toggleSecurityPanel() {
    const content = document.getElementById("securityContent");
    const button = document.getElementById("securityToggle");
    const icon = document.getElementById("securityToggleIcon");
    const isOpen = !content.classList.contains("hidden");
    content.classList.toggle("hidden", isOpen);
    button.setAttribute("aria-expanded", String(!isOpen));
    icon.textContent = isOpen ? "⌄" : "⌃";
}

function changeSignedInPassword(event) {
    event.preventDefault();
    const sessionUser = getDashboardUser();
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("accountNewPassword").value;
    const confirmPassword = document.getElementById("accountConfirmPassword").value;
    const message = document.getElementById("passwordMessage");
    const forgotButton = document.getElementById("accountForgotPasswordButton");
    const accounts = getAllAccounts();
    const index = accounts.findIndex(a => a.id === sessionUser?.id);
    if (index === -1) return showAccountMessage(message, "Account could not be found.");
    if (accounts[index].password !== currentPassword) {
        showAccountMessage(message, "Current password is incorrect. Use Forgot password below to recover access.");
        forgotButton?.classList.remove("hidden");
        return;
    }
    forgotButton?.classList.add("hidden");
    if (newPassword.length < 6) return showAccountMessage(message, "New password must contain at least 6 characters.");
    if (newPassword !== confirmPassword) return showAccountMessage(message, "New passwords do not match.");
    accounts[index].password = newPassword; saveAllAccounts(accounts);
    document.getElementById("changePasswordForm").reset();
    showAccountMessage(message, "Password changed successfully.", "success");
}

function openAccountResetPanel() {
    document.getElementById("accountResetPanel")?.classList.remove("hidden");
    document.getElementById("accountForgotPasswordButton")?.classList.add("hidden");
}

async function sendAccountResetOtp() {
    const sessionUser = getDashboardUser();
    const account = getAllAccounts().find(a => a.id === sessionUser?.id);
    if (!account?.email) return showAccountMessage(document.getElementById("accountResetMessage"), "No recovery email is linked to this account.");
    const button = document.getElementById("accountSendResetOtp");
    button.disabled = true; button.textContent = "Sending...";
    try {
        const response = await fetch(`${API_BASE}/api/request-password-reset`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: account.email }) });
        const data = await response.json(); if (!response.ok) throw new Error(data.message || "Unable to send OTP.");
        showAccountMessage(document.getElementById("accountResetMessage"), `OTP sent to ${account.email}. It expires in 10 minutes.`, "success");
        document.getElementById("accountResetOtp")?.focus();
    } catch (error) { showAccountMessage(document.getElementById("accountResetMessage"), `${error.message} Make sure the backend is running.`); }
    finally { button.disabled = false; button.textContent = "Send OTP"; }
}

async function verifyAccountResetOtp() {
    const sessionUser = getDashboardUser();
    const account = getAllAccounts().find(a => a.id === sessionUser?.id);
    const otp = document.getElementById("accountResetOtp").value.trim();
    const newPassword = document.getElementById("accountResetNewPassword").value;
    const confirm = document.getElementById("accountResetConfirmPassword").value;
    const message = document.getElementById("accountResetMessage");
    if (!/^\d{6}$/.test(otp)) return showAccountMessage(message, "Enter the 6-digit OTP.");
    if (newPassword.length < 6) return showAccountMessage(message, "New password must contain at least 6 characters.");
    if (newPassword !== confirm) return showAccountMessage(message, "Passwords do not match.");
    try {
        const response = await fetch(`${API_BASE}/api/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: account.email, otp, newPassword }) });
        const data = await response.json(); if (!response.ok) throw new Error(data.message || "OTP verification failed.");
        const accounts = getAllAccounts(); const index = accounts.findIndex(a => a.id === sessionUser?.id);
        if (index === -1) throw new Error("Account could not be found.");
        accounts[index].password = newPassword; saveAllAccounts(accounts);
        document.getElementById("accountResetPanel")?.classList.add("hidden");
        document.querySelectorAll("#accountResetPanel input").forEach(input => { input.value = ""; });
        showAccountMessage(document.getElementById("passwordMessage"), "Password reset successfully using email OTP.", "success");
    } catch (error) { showAccountMessage(message, error.message); }
}

function renderLoginHistory(history) {
    const list = document.getElementById("loginHistoryList");
    const count = document.getElementById("loginHistoryCount");
    if (!list) return;
    const entries = Array.isArray(history) ? history.slice(0, 20) : [];
    if (count) count.textContent = String(entries.length);
    if (!entries.length) {
        list.innerHTML = '<div class="history-empty">No login history yet.</div>';
        return;
    }
    list.innerHTML = entries.map(entry => {
        const date = new Date(entry.timestamp);
        const time = Number.isNaN(date.getTime()) ? "Unknown time" : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
        return `<div class="history-item">\n            <div class="history-device-icon">💻</div>\n            <div class="history-details"><strong>${escapeHTML(entry.device || "Unknown device")}</strong><span>${escapeHTML(entry.browser || "Web browser")} · ${escapeHTML(entry.platform || "Unknown platform")}</span></div>\n            <time>${escapeHTML(time)}</time>\n        </div>`;
    }).join("");
}

function handleProfilePicture(event) {
    const file = event.target.files?.[0]; if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { showAccountMessage(document.getElementById("profileMessage"), "Please choose a JPG, PNG or WebP image."); event.target.value = ""; return; }
    if (file.size > 2 * 1024 * 1024) { showAccountMessage(document.getElementById("profileMessage"), "Profile picture must be smaller than 2 MB."); event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => {
        const sessionUser = getDashboardUser(); const accounts = getAllAccounts(); const index = accounts.findIndex(a => a.id === sessionUser?.id); if (index === -1) return;
        accounts[index].profilePicture = reader.result; saveAllAccounts(accounts); sessionUser.profilePicture = reader.result; localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser)); renderProfilePicture(reader.result);
        showAccountMessage(document.getElementById("profileMessage"), "Profile picture updated.", "success");
    }; reader.readAsDataURL(file);
}

function removeProfilePicture() {
    const sessionUser = getDashboardUser(); const accounts = getAllAccounts(); const index = accounts.findIndex(a => a.id === sessionUser?.id); if (index === -1) return;
    accounts[index].profilePicture = ""; saveAllAccounts(accounts); sessionUser.profilePicture = ""; localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    document.getElementById("profilePictureInput").value = ""; renderProfilePicture("");
    showAccountMessage(document.getElementById("profileMessage"), "Profile picture removed.", "success");
}

function showAccountMessage(element, message, type = "error") {
    if (!element) return; element.textContent = message; element.className = `account-message ${type}`; clearTimeout(element._timer); element._timer = setTimeout(() => { element.textContent = ""; }, 5000);
}

