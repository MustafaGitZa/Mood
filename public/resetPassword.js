/**
 * Extracts a parameter value from the current URL.
 * @param {string} paramName - The name of the parameter to retrieve.
 * @returns {string|null} - The parameter value, or null if not found.
 */
function getParameterFromUrl(paramName) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(paramName); // Returns the value or null
    } catch (error) {
        console.error("Error extracting URL parameter:", error);
        return null; // Return null if something goes wrong
    }
}

// Extract token from URL
const token = getParameterFromUrl('token');
if (token) {
    console.log('Extracted token:', token);
} else {
    console.warn('Token not found in the URL.');
}

// Validate password input and inject token before form submission
const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
        e.preventDefault();
        alert("Passwords do not match. Please try again.");
        return;
    }

    if (!token) {
        e.preventDefault();
        alert("Missing token. Please use the link from your email again.");
        return;
    }

    // Inject the token into the form's action URL
    form.action = `/reset-password?token=${token}`;
});
