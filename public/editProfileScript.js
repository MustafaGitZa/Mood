document.addEventListener("DOMContentLoaded", async function () {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("User not logged in.");
        window.location.href = "/login.html";
        return;
    }

    // === Fetch and populate profile ===
    try {
        const response = await fetch(`/get-profile?userId=${userId}`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById("name").value = data.name || "";
            document.getElementById("surname").value = data.surname || "";
            document.getElementById("email").value = data.email || "";
            document.getElementById("email").dataset.current = data.email || "";
            document.getElementById("username").value = data.username || "";
            document.getElementById("username").dataset.current = data.username || "";
            document.getElementById("selectedAvatar").value = data.avatar || "";

            if (data.avatar) {
                const display = document.getElementById("selectedAvatarDisplay");
                display.src = data.avatar;
                display.style.display = "inline-block";
            }
        } else {
            alert("Failed to load profile details.");
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        alert("An error occurred while loading profile details.");
    }

    // === Avatar selection ===
    document.querySelectorAll(".avatar-option").forEach(img => {
        img.addEventListener("click", () => {
            const selectedAvatar = img.getAttribute("data-avatar");
            document.getElementById("selectedAvatar").value = selectedAvatar;

            const display = document.getElementById("selectedAvatarDisplay");
            display.src = selectedAvatar;
            display.style.display = "inline-block";
        });
    });

    // === Handle form submission (edit profile) ===
    document.getElementById("editProfileForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        // Clear previous errors
        document.querySelectorAll("span.text-red-500").forEach(span => span.textContent = "");

        const name = document.getElementById("name").value.trim();
        const surname = document.getElementById("surname").value.trim();
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const avatar = document.getElementById("selectedAvatar").value;
        const currentEmail = document.getElementById("email").dataset.current || "";

        let isValid = true;

        // === Validation ===
        if (!name || !/^[A-Za-z\s]+$/.test(name)) {
            document.getElementById("nameError").textContent = "Enter a valid name (letters only).";
            isValid = false;
        }

        if (!surname || !/^[A-Za-z\s]+$/.test(surname)) {
            document.getElementById("surnameError").textContent = "Enter a valid surname (letters only).";
            isValid = false;
        }

        if (!username || !/^\w{3,}$/.test(username)) {
            document.getElementById("usernameError").textContent = "Username must be 3+ characters, letters/numbers only.";
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            document.getElementById("emailError").textContent = "Enter a valid email address.";
            isValid = false;
        }
        if (email.endsWith(".co")) {
            document.getElementById("emailError").textContent = "Emails ending in '.co' are not allowed.";
            return;
     }

        if (!isValid) return;

        // === Email uniqueness check ===
        if (email !== currentEmail) {
            try {
                const checkEmailRes = await fetch("/check-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });

                const checkEmailData = await checkEmailRes.json();
                if (checkEmailRes.ok && checkEmailData.exists) {
                    document.getElementById("emailError").textContent = "Email already in use.";
                    document.getElementById("email").focus();
                    return;
                }
            } catch (e) {
                console.error("Email check error:", e);
                document.getElementById("emailError").textContent = "Could not verify email.";
                return;
            }
        }

        // === Submit profile update ===
        try {
            const response = await fetch("/update-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, name, surname, username, email, avatar })
            });

            const data = await response.json();

            if (response.ok) {
                // Show success modal
                const successModal = document.getElementById("successModal");
                const successMsg = document.getElementById("successMessageText");
                successMsg.textContent = data.message || "Profile updated successfully!";
                successModal.classList.remove("hidden");

                document.getElementById("successModalCloseBtn").addEventListener("click", () => {
                    successModal.classList.add("hidden");
                    window.location.href = "/dashboard";
                });
            } else {
                if (data.field && data.message) {
                    const errorSpan = document.getElementById(`${data.field}Error`);
                    if (errorSpan) {
                        errorSpan.textContent = data.message;
                    } else {
                        alert(data.message);
                    }
                } else {
                    alert(data.message || "An unknown error occurred.");
                }
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred. Please try again.");
        }
    });

    // === Delete Profile Button & Modal Logic ===
    const deleteBtn = document.getElementById("deleteProfileBtn");
    const modal = document.getElementById("confirmDeleteModal");
    const confirmDelete = document.getElementById("confirmDeleteBtn");
    const cancelDelete = document.getElementById("cancelDeleteBtn");

    deleteBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
    });

    cancelDelete.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    confirmDelete.addEventListener("click", async () => {
        try {
            const response = await fetch("/delete-profile", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                localStorage.removeItem("userId");
                window.location.href = "/login.html";
            } else {
                alert(data.message || "Failed to delete profile.");
            }
        } catch (error) {
            console.error("Error deleting profile:", error);
            alert("An error occurred. Please try again.");
        }
    });
});


