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
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("editProfileForm");

    // Set the current email in data-current
    const emailInput = document.getElementById("email");
    const currentEmail = "user@example.com"; // Get this dynamically from backend or localStorage
    emailInput.dataset.current = currentEmail;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("User not logged in.");
            return;
        }

        const email = emailInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailError = document.getElementById("emailError");
        emailError.textContent = ""; // Clear any previous error

        // ✅ Format check
        if (!emailPattern.test(email)) {
            emailError.textContent = "Please enter a valid email address.";
            return;
        }

        // ✅ Check for duplicate email if changed
        const currentEmail = emailInput.dataset.current;
        if (email !== currentEmail) {
            try {
                const res = await fetch("/validate-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email,userId })
                });

                // Debugging: Log the response status and body
                const result = await res.json();
                if (res.ok && result.exists) {
                    emailError.textContent = "This email is already taken.";
                    return;
                } else if (!res.ok) {
                    emailError.textContent = `Error: ${res.status} - ${result.error || "Failed to validate email."}`;
                    return;
                }
            } catch (err) {
                console.error("Email validation error:", err);
                emailError.textContent = "Could not validate email. Please try again.";
                return;
            }
        }
        

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("name", document.getElementById("name").value);
        formData.append("surname", document.getElementById("surname").value);
        formData.append("username", document.getElementById("username").value);
        formData.append("email", email);

        const selectedAvatarPath = document.getElementById("selectedAvatar").value;
        const fileInput = document.getElementById("profilePicture");
        const uploadedFile = fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null;

        if (uploadedFile) {
            formData.append("profile_picture", uploadedFile);
        } else if (selectedAvatarPath) {
            formData.append("profile_picture", selectedAvatarPath);
        }

        try {
            const response = await fetch("/update-profile", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("Update response:", data);

            if (response.ok) {
                showSuccessModal(data.message);
            } else {
                showErrorModal(data.message);
            }
        } catch (error) {
            console.error("Error:", error);
            showErrorModal("An error occurred. Please try again.");
        }
    });

    // Success modal logic
    const successModal = document.getElementById("successModal");
    const successMessageText = document.getElementById("successMessageText");
    const successModalCloseBtn = document.getElementById("successModalCloseBtn");

    function showSuccessModal(message) {
        successMessageText.textContent = message;
        successModal.classList.remove("hidden");

        successModalCloseBtn.addEventListener("click", () => {
            successModal.classList.add("hidden");
            window.location.href = "/dashboard";
        });
    }

    // Error modal logic
    const errorModal = document.getElementById("errorModal");
    const errorMessageText = document.getElementById("errorMessageText");
    const errorModalCloseBtn = document.getElementById("errorModalCloseBtn");

    function showErrorModal(message) {
        errorMessageText.textContent = message;
        errorModal.classList.remove("hidden");

        errorModalCloseBtn.addEventListener("click", () => {
            errorModal.classList.add("hidden");
        });
    }
});




document.addEventListener("DOMContentLoaded", function () {
    const deleteBtn = document.getElementById("deleteProfileBtn");
    const modal = document.getElementById("confirmDeleteModal");
    const confirmBtn = document.getElementById("confirmDeleteBtn");
    const cancelBtn = document.getElementById("cancelDeleteBtn");
  
    deleteBtn.addEventListener("click", () => {
      modal.classList.remove("hidden"); // Show modal
    });
  
    cancelBtn.addEventListener("click", () => {
      modal.classList.add("hidden"); // Hide modal
    });
  
    confirmBtn.addEventListener("click", async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("User not logged in.");
        return;
      }
  
      try {
        const response = await fetch("/delete-profile", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          alert(data.message);
          localStorage.removeItem("userId");
          window.location.href = "/login.html";
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Error deleting profile:", error);
        alert("An error occurred. Please try again.");
      }
  
      modal.classList.add("hidden"); // Hide modal
    });
  });
  
