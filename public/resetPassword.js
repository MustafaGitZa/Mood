/**
 * Extracts a parameter value from the current URL.
 * @param {string} paramName - The name of the parameter to retrieve.
 * @returns {string|null} - The parameter value, or null if not found.
 */
function getParameterFromUrl(paramName) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(paramName);
    } catch (error) {
        console.error("Error extracting URL parameter:", error);
        return null;
    }
}

const token = getParameterFromUrl('token');
const userId = getParameterFromUrl('userId');

const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
        e.preventDefault();
        alert("Passwords do not match. Please try again.");
        return;
    }

    if (!token || !userId) {
        e.preventDefault();
        alert("Missing token or userId. Please use the link from your email again.");
        return;
    }

    // Dynamically update form action
    form.action = `/reset-password?token=${token}&userId=${userId}`;
});
