document.addEventListener("DOMContentLoaded", async function () {
    try {
        const userId = localStorage.getItem("userId");
        console.log("Retrieved userId:", userId);

        if (!userId) {
            alert("User not logged in.");
            window.location.href = "/login.html";
            return;
        }

        const response = await fetch(`/get-username?userId=${userId}`);
        const data = await response.json();

        if (response.ok && data.username) {
            console.log("Username fetched successfully:", data.username);
            document.getElementById("username").textContent = data.username;
            console.log("Updated DOM with username:", document.getElementById("username").textContent);
        } else {
            console.error("API error:", data.message);
            document.getElementById("username").textContent = "Guest";
        }

        // Fetch user profile after username is fetched
        await fetchUserProfile();

    } catch (error) {
        console.error("Error fetching username:", error);
        document.getElementById("username").textContent = "Guest";
        // Ensure profile pic fallback even on username fetch error
        document.getElementById("profileIcon").src = "default-avatar.png";
    }
});

async function fetchUserProfile() {
    try {
        const response = await fetch('/getUserProfile');
        const user = await response.json();

        if (user.profile_picture) {
            console.log("Profile picture URL:", user.profile_picture);

            // Update username dynamically (redundant if already set, but safe)
            document.getElementById("username").textContent = user.username || "User";

            // Update profile icon dynamically or use fallback
            const profileIcon = document.getElementById("profileIcon");
            profileIcon.src = user.profile_picture
                ? `http://localhost:3000${user.profile_picture}` // Replace localhost with your server URL
                : "default-avatar.png";
        }
    } catch (error) {
        console.error("Error loading profile picture:", error);
        // Fallback to default avatar if any error occurs
        document.getElementById("profileIcon").src = "default-avatar.png";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const profileIcon = document.getElementById("profileIcon");
    const profileMenu = document.getElementById("profileMenu");

    profileIcon.addEventListener("click", function (event) {
        event.stopPropagation();
        profileMenu.classList.toggle("show");
    });

    document.addEventListener("click", function (event) {
        if (!profileMenu.contains(event.target) && event.target !== profileIcon) {
            profileMenu.classList.remove("show");
        }
    });
});