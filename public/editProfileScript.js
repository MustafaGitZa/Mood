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

            // Load avatar or profile picture if available
            if (data.profile_picture) {
                document.getElementById("selectedAvatar").value = data.profile_picture;
                document.getElementById("selectedAvatarDisplay").src = data.profile_picture;
                document.getElementById("selectedAvatarDisplay").style.display = "block";
                document.querySelector(".avatar-options-container").style.display = "none"; // Hide avatar options
                document.getElementById("chooseAvatarLabel").textContent = "Selected Avatar:";
            }
        } else {
            alert("Failed to load profile details.");
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        alert("An error occurred while loading profile details.");
    }

    // Avatar selection logic
    const avatarOptions = document.querySelectorAll(".avatar-option");
    const selectedAvatarInput = document.getElementById("selectedAvatar");
    const selectedAvatarDisplay = document.getElementById("selectedAvatarDisplay");
    const avatarOptionsContainer = document.querySelector(".avatar-options-container");
    const chooseAvatarLabel = document.getElementById("chooseAvatarLabel");
    const fileInput = document.getElementById("profilePicture");

    function resetAvatarSelection() {
        avatarOptions.forEach(opt => opt.classList.remove("selected")); // Clear previous selections
        selectedAvatarInput.value = ""; // Clear avatar path input
        selectedAvatarDisplay.style.display = "none"; // Hide avatar preview
        avatarOptionsContainer.style.display = "flex"; // Re-display avatar options
        chooseAvatarLabel.textContent = "Choose an Avatar (Optional)";
    }

    avatarOptions.forEach(avatar => {
        avatar.addEventListener("click", function () {
            avatarOptions.forEach(opt => opt.classList.remove("selected")); // Clear selections
            this.classList.add("selected");
            selectedAvatarInput.value = this.dataset.avatar; // Store selected avatar
            selectedAvatarDisplay.src = this.src; // Update preview
            selectedAvatarDisplay.style.display = "block";
            avatarOptionsContainer.style.display = "none"; // Hide avatar options
            chooseAvatarLabel.textContent = "Selected Avatar:";
            fileInput.value = ""; // Clear file input if an avatar is selected
        });
    });

    // Add event listener to allow re-selecting an avatar by clicking on the displayed avatar
    selectedAvatarDisplay.addEventListener("click", () => {
        resetAvatarSelection(); // Reset avatar selection and re-display options
    });

    // Clear selected avatar if a file is chosen
    fileInput.addEventListener("change", () => {
        resetAvatarSelection();
    });
});

document.getElementById("editProfileForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const userId = localStorage.getItem("userId");

    console.log("Updating profile for userId:", userId); // Log before sending request
    if (!userId) {
        alert("User not logged in.");
        return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("name", document.getElementById("name").value);
    formData.append("surname", document.getElementById("surname").value);
    formData.append("username", document.getElementById("username").value);
    formData.append("email", document.getElementById("email").value);

    const selectedAvatarPath = document.getElementById("selectedAvatar").value;
    const fileInput = document.getElementById("profilePicture");
    const uploadedFile = fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null;

    // Add avatar or profile picture to the form data
    if (uploadedFile) {
        formData.append("profile_picture", uploadedFile); // Add uploaded profile picture
    } else if (selectedAvatarPath) {
        formData.append("profile_picture", selectedAvatarPath); // Use avatar for profile_picture field
    }

    try {
        const response = await fetch("/update-profile", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log("Update response:", data); // Log response

        if (response.ok) {
            alert(data.message); // Show success message
            window.location.href = "/dashboard"; // Redirect to dashboard
        } else {
            alert(data.message); // Show error message
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("deleteProfileBtn").addEventListener("click", async function () {
        const userId = localStorage.getItem("userId");

        console.log("Attempting to delete profile for userId:", userId); // Log before sending request

        if (!userId) {
            alert("User not logged in.");
            return;
        }

        if (!confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
            return; // Exit if user cancels the confirmation
        }

        try {
            const response = await fetch("/delete-profile", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();
            console.log("Delete response:", data); // Log response

            if (response.ok) {
                alert(data.message); // Show success message
                localStorage.removeItem("userId"); // Clear userId from localStorage
                window.location.href = "/login.html"; // Redirect to login
            } else {
                alert(data.message); // Show error message
            }
        } catch (error) {
            console.error("Error deleting profile:", error);
            alert("An error occurred. Please try again.");
        }
    });
});
