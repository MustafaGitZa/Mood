document.addEventListener("DOMContentLoaded", async function () {
    const profileIcon = document.getElementById("profileIcon");
    const profileExpandedMenu = document.getElementById("profileExpandedMenu");
    const profileInitials = document.getElementById("profileInitials");
    const userFullNameDisplay = document.getElementById("userFullName");
    const profileAvatarExpanded = document.getElementById("profileAvatar"); // Avatar in expanded menu
    const navProfileAvatarImg = document.getElementById("navProfileAvatar"); // User avatar in navbar
    const hoverTriggerButton = document.getElementById("hoverTriggerButton");
   
    try {
        const userId = localStorage.getItem("userId");
        console.log("Retrieved userId:", userId);

        if (!userId) {
            console.log("User not logged in.");
            profileInitials.textContent = "GU";
            profileIcon.textContent = "G";
            profileIcon.style.display = "flex";
            userFullNameDisplay.textContent = "Guest User";
            if (profileAvatarExpanded) {
                profileAvatarExpanded.style.display = "none";
            }
            if (navProfileAvatarImg) {
                navProfileAvatarImg.style.display = "none";
            }
            return;
        }

        const usernameResponse = await fetch(`/get-username?userId=${userId}`);
        const usernameData = await usernameResponse.json();

        if (usernameResponse.ok && usernameData.username) {
            console.log("Username fetched successfully:", usernameData.username);

            const username = usernameData.username.trim();
            const initials = username.split(' ').map(name => name[0]).join('').toUpperCase();
            profileInitials.textContent = initials;
            userFullNameDisplay.textContent = username;
            profileIcon.textContent = ""; // We will use the image in the navbar
            profileIcon.style.display = "flex";

            await fetchUserProfile();
        } else {
            console.error("API error:", usernameData.message);
            profileInitials.textContent = "GU";
            profileIcon.textContent = "G";
            profileIcon.style.display = "flex";
            userFullNameDisplay.textContent = "Guest User";
            if (profileAvatarExpanded) {
                profileAvatarExpanded.style.display = "none";
            }
            if (navProfileAvatarImg) {
                navProfileAvatarImg.style.display = "none";
            }
        }

    } catch (error) {
        console.error("Error fetching username:", error);
        profileInitials.textContent = "GU";
        profileIcon.textContent = "G";
        profileIcon.style.display = "flex";
        userFullNameDisplay.textContent = "Guest User";
        if (profileAvatarExpanded) {
            profileAvatarExpanded.style.display = "none";
        }
        if (navProfileAvatarImg) {
            navProfileAvatarImg.style.display = "none";
        }
    }

    async function fetchUserProfile() {
        try {
            const response = await fetch('/getUserProfile');
            const userProfileData = await response.json();

            if (userProfileData && userProfileData.profile_picture) {
                console.log("Profile picture path:", userProfileData.profile_picture);
                if (profileAvatarExpanded) {
                    profileAvatarExpanded.src = userProfileData.profile_picture;
                    profileAvatarExpanded.style.display = "block";
                    profileInitials.style.display = "none";
                }
                if (navProfileAvatarImg) {
                    navProfileAvatarImg.src = userProfileData.profile_picture;
                    navProfileAvatarImg.style.display = "block";
                    profileIcon.textContent = ""; // Ensure no initials are shown if avatar is present
                } else {
                    // If navProfileAvatarImg doesn't exist, fallback to initials
                    profileIcon.textContent = profileInitials.textContent.substring(0, 1);
                }
                profileIcon.style.backgroundImage = `url('${userProfileData.profile_picture}')`;
                profileIcon.style.backgroundSize = 'cover';
                profileIcon.style.backgroundColor = 'transparent'; // Ensure background color doesn't hide image
            } else {
                console.log("No profile picture found, displaying initials.");
                if (profileAvatarExpanded) {
                    profileAvatarExpanded.style.display = "none";
                    profileInitials.style.display = "flex";
                }
                if (navProfileAvatarImg) {
                    navProfileAvatarImg.style.display = "none";
                }
                profileIcon.textContent = profileInitials.textContent.substring(0, 1);
                profileIcon.style.backgroundImage = ''; // Remove any background image
                profileIcon.style.backgroundColor = '#f167a1'; // Set default background color
            }
        } catch (error) {
            console.error("Error loading profile picture:", error);
            if (profileAvatarExpanded) {
                profileAvatarExpanded.src = "default-avatar.png"; // Fallback image on error
                profileAvatarExpanded.style.display = "block";
                profileInitials.style.display = "none";
            }
            if (navProfileAvatarImg) {
                navProfileAvatarImg.style.display = "none";
            }
            profileIcon.textContent = profileInitials.textContent.substring(0, 1);
            profileIcon.style.backgroundImage = '';
            profileIcon.style.backgroundColor = '#f167a1';
        }
    }

    profileIcon.addEventListener("click", function (event) {
        event.stopPropagation();
        profileExpandedMenu.classList.toggle("show");
    });

    document.addEventListener("click", function (event) {
        if (!profileExpandedMenu.contains(event.target) && event.target !== profileIcon) {
            profileExpandedMenu.classList.remove("show");
        }
    });
});

function fetchTip() {
    fetch("/fetch-tips", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        if (data.tip_text) {
            const modalText = document.getElementById("modalTipText");
            modalText.textContent = data.tip_text;
            const modal = document.getElementById("tipModal");
            modal.style.display = "block";
        } else {
            alert("No tips found for the logged mood.");
        }
    })
    .catch((error) => {
        console.error("Error fetching tip:", error);
        alert("An error occurred while fetching the tip.");
    });
}



function closeModal() {
    const modal = document.getElementById("tipModal");
    modal.style.display = "none";
}

// Define the closeMoodModal function
function closeMoodModal() {
    const moodRoomModal = document.getElementById("moodRoomModal"); // Locate the modal element
    moodRoomModal.style.display = "none"; // Hide the modal
}


