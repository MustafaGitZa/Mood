const loginForm = document.getElementById('loginForm');
const loginSuccessModal = document.getElementById('loginSuccessModal');
const okButton = document.querySelector('.ok-button'); // Get the OK button
const loginFailedModal = document.getElementById('loginFailedModal'); // Get the loginFailedModal

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

            // Redirect based on the role (redirectUrl provided by the server)
            window.location.href = data.redirectUrl;
        } else {
            loginFailedModal.style.display = "flex"; // Show the error modal
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
});

// Add event listener for the OK button in the error modal
const errorOkButton = document.querySelector('.error-ok-button'); // Select the correct button
if (errorOkButton) { // Check if the button exists
    errorOkButton.addEventListener('click', () => {
        loginFailedModal.style.display = 'none';
        window.location.href = '/login.html'; // Go back to login page
    });
}


