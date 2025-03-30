
document.addEventListener("DOMContentLoaded", async function () {
    const userId = localStorage.getItem("userId");
    console.log("Retrieved userId from localStorage:", userId); // Log userId from storage
    if (!userId) {
        alert("User not logged in.");
        window.location.href = "/login.html"; // Redirect to login if userId is missing
        return;
    }

    try {
        console.log("Fetching profile with userId:", userId); // Log userId before sending request
        const response = await fetch(`/get-profile?userId=${userId}`);
        const data = await response.json();

        console.log("Profile Response:", data); // Log received profile data
        if (response.ok) {
            document.getElementById("name").value = data.name;
            document.getElementById("surname").value = data.surname;
            document.getElementById("email").value = data.email;
            document.getElementById("username").value = data.username;
            
            // If the user has a profile picture, update the preview
            // if (data.profilePic) {
            //     document.getElementById("profile-preview").src = data.profilePic;
            // }
        } else {
            alert("Failed to load profile details.");
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        alert("An error occurred while loading profile details.");
    }
});

document.getElementById("editProfileForm").addEventListener("submit", async function () {

    event.preventDefault();
    const userId = localStorage.getItem("userId");

    console.log("Updating profile for userId:", userId); // Log before sending request
    if (!userId) {
        alert("User not logged in.");
        return;
    }

    const name = document.getElementById("name").value;
    const surname = document.getElementById("surname").value;
    const username = document.getElementById("username").value; // Uncomment if needed
    const email = document.getElementById("email").value;

    try {
        const response = await fetch("/update-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({userId, name, surname,username, email })
        });

        const data = await response.json();
        console.log("Update response:", data); // Log response

        if (response.ok) {
            alert(data.message); // Show success message
            window.location.href = "/dashboard"; // Redirect to dashboard or profile page
        } else {
            alert(data.message); // Show error message
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
});


  