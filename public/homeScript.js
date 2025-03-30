document.addEventListener("DOMContentLoaded", async function () {
    const userId = localStorage.getItem("userId");

    console.log("Retrieved userId from localStorage:", userId); // Debugging

    if (!userId) {
        alert("User not logged in.");
        window.location.href = "/login.html"; // Redirect to login if userId is missing
        return;
    }

    try {
        console.log("Fetching username for userId:", userId);
        const response = await fetch(`/get-username?userId=${userId}`);
        const data = await response.json();

        console.log("Fetched user data:", data); // Debugging

        if (response.ok) {
            document.getElementById("username").textContent = data.username;
        } else {
            console.error("Failed to fetch username:", data.message);
        }
    } catch (error) {
        console.error("Error fetching username:", error);
    }
});
