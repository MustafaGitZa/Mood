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

document.addEventListener("DOMContentLoaded", function () {
    const profileIcon = document.getElementById("profileIcon");
    const profileMenu = document.getElementById("profileMenu");

    profileIcon.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevents closing when clicking the icon
        profileMenu.classList.toggle("show");
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (event) {
        if (!profileMenu.contains(event.target) && event.target !== profileIcon) {
            profileMenu.classList.remove("show");
        }
    });
});

document.addEventListener("DOMContentLoaded", async function() {
    try {
        const response = await fetch('/getUserProfile'); // API to get user profile
        const user = await response.json();

        if (user.profile_picture) {
            console.log("Profile picture URL:", user.profile_picture);

            // Make sure to prepend the base URL (your server URL) to the profile picture path
            const baseUrl = 'http://localhost:3000'; // Replace with your server's URL if different
            const imageUrl = baseUrl + user.profile_picture; // Full path to the image

            document.getElementById("profileIcon").src = imageUrl; // Set profile image
        }
    } catch (error) {
        console.error("Error loading profile picture:", error);
    }
});

