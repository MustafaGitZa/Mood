const loginForm = document.getElementById('loginForm');
const loginSuccessModal = document.getElementById('loginSuccessModal');
const okButton = document.querySelector('.ok-button');
const loginFailedModal = document.getElementById('loginFailedModal');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        console.log("Login Response:", data);

        if (response.ok) {
            console.log("Storing userId & username in localStorage:", data.userId, data.username);
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("username", data.username);

            // Store redirectUrl from response
            localStorage.setItem("redirectUrl", data.redirectUrl);

            loginSuccessModal.style.display = "flex";
        } else {
            loginFailedModal.style.display = "flex";
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
});

// Success modal OK button — redirect using stored redirectUrl
okButton.addEventListener('click', () => {
    loginSuccessModal.style.display = 'none';
    const redirectUrl = localStorage.getItem("redirectUrl") || '/home.html';
    window.location.href = redirectUrl;
});

// Error modal OK button
const errorOkButton = document.querySelector('.error-ok-button');
if (errorOkButton) {
    errorOkButton.addEventListener('click', () => {
        loginFailedModal.style.display = 'none';
        window.location.href = '/login.html';
    });
}
