document.addEventListener("DOMContentLoaded", async function () {
    const profileContainer = document.querySelector(".profile-container");
    const profileIcon = document.getElementById("profileIcon");
    const expandedInitials = document.getElementById("profileInitials");
    const profileAvatarExpanded = document.getElementById("profileAvatar"); // Avatar in expanded menu
    const userFullName = document.getElementById("userFullName");
    const welcomeUsernameSpan = document.getElementById("username");
    const defaultProfileIconImg = document.getElementById("defaultProfileIcon"); // Default icon in navbar
    const navProfileAvatarImg = document.getElementById("navProfileAvatar"); // User avatar in navbar

    try {
        const userId = localStorage.getItem("userId");
        console.log("Retrieved userId:", userId);

        if (!userId) {
            console.log("User not logged in.");
            profileIcon.textContent = "GU"; // Show guest user initials
            profileIcon.style.backgroundImage = '';
            profileIcon.style.backgroundColor = '#f167a1';
            profileIcon.style.color = 'white';
            profileIcon.style.display = 'flex';
            profileIcon.style.justifyContent = 'center';
            profileIcon.style.alignItems = 'center';
            expandedInitials.textContent = "GU";
            userFullName.textContent = "Guest User";
            if (defaultProfileIconImg) {
                defaultProfileIconImg.style.display = "none"; // Hide default image
            }
            return;
        }

        const usernameResponse = await fetch(`/get-username?userId=${userId}`);
        const usernameData = await usernameResponse.json();

        if (usernameResponse.ok && usernameData.username) {
            console.log("Username fetched successfully:", usernameData.username);
            welcomeUsernameSpan.textContent = usernameData.username;

            const username = usernameData.username.trim();
            const initials = username.split(' ').map(name => name[0]).join('').toUpperCase();
            expandedInitials.textContent = initials;
            userFullName.textContent = username;
            profileIcon.textContent = initials.substring(0, 1); // Show first initial in navbar
            profileIcon.style.backgroundImage = '';
            profileIcon.style.backgroundColor = '#f167a1';
            profileIcon.style.color = 'white';
            profileIcon.style.display = 'flex';
            profileIcon.style.justifyContent = 'center';
            profileIcon.style.alignItems = 'center';
        } else {
            console.error("API error:", usernameData.message);
            welcomeUsernameSpan.textContent = "Guest";
            profileIcon.textContent = "G";
            profileIcon.style.backgroundImage = '';
            profileIcon.style.backgroundColor = '#f167a1';
            profileIcon.style.color = 'white';
            profileIcon.style.display = 'flex';
            profileIcon.style.justifyContent = 'center';
            profileIcon.style.alignItems = 'center';
            expandedInitials.textContent = "G";
            userFullName.textContent = "Guest User";
            if (defaultProfileIconImg) {
                defaultProfileIconImg.style.display = "none"; // Hide default image
            }
        }

        await fetchUserProfile();

    } catch (error) {
        console.error("Error fetching username:", error);
        welcomeUsernameSpan.textContent = "Guest";
        profileIcon.textContent = "G";
        profileIcon.style.backgroundImage = '';
        profileIcon.style.backgroundColor = '#f167a1';
        profileIcon.style.color = 'white';
        profileIcon.style.display = 'flex';
        profileIcon.style.justifyContent = 'center';
        profileIcon.style.alignItems = 'center';
        expandedInitials.textContent = "G";
        userFullName.textContent = "Guest User";
        if (defaultProfileIconImg) {
            defaultProfileIconImg.style.display = "none"; // Hide default image
        }
        if (navProfileAvatarImg) {
            navProfileAvatarImg.style.display = "none";
        }
        if (profileAvatarExpanded) {
            profileAvatarExpanded.style.display = "none";
        }
    }

    async function fetchUserProfile() {
        try {
            const response = await fetch('/getUserProfile');
            const user = await response.json();
            const navProfileAvatarImg = document.getElementById("navProfileAvatar"); // Get the navigation bar avatar
            const profileInitialsExpanded = document.getElementById("profileInitials"); // Get initials in expanded menu
            const defaultProfileIconImg = document.getElementById("defaultProfileIcon");

            if (user.profile_picture) {
                console.log("Profile picture URL:", user.profile_picture);
                profileAvatar.src = user.profile_picture;
                profileAvatar.style.display = "block";
                if (navProfileAvatarImg) {
                    navProfileAvatarImg.src = user.profile_picture;
                    navProfileAvatarImg.style.display = "block";
                }
                profileIcon.textContent = ""; // Clear initials
                profileIcon.style.backgroundImage = `url('${user.profile_picture}')`;
                profileIcon.style.backgroundSize = 'cover';
                profileIcon.style.backgroundColor = 'transparent';
                if (profileInitialsExpanded) {
                    profileInitialsExpanded.style.display = "none"; // Hide initials in expanded menu
                }
                if (defaultProfileIconImg) {
                    defaultProfileIconImg.style.display = "none"; // Hide default image
                }
            } else {
                profileAvatar.style.display = "none";
                if (navProfileAvatarImg) {
                    navProfileAvatarImg.src = "";
                    navProfileAvatarImg.style.display = "none";
                }
                const username = document.getElementById("username").textContent;
                const initials = username.split(' ').map(name => name[0]).join('').toUpperCase();
                profileIcon.textContent = initials.substring(0, 1); // Show first initial in navbar
                profileIcon.style.backgroundImage = '';
                profileIcon.style.backgroundColor = '#f167a1';
                profileIcon.style.color = 'white';
                profileIcon.style.display = 'flex';
                profileIcon.style.justifyContent = 'center';
                profileIcon.style.alignItems = 'center';
                if (profileInitialsExpanded) {
                    profileInitialsExpanded.style.display = "flex"; // Show initials in expanded menu
                }
                if (defaultProfileIconImg) {
                    defaultProfileIconImg.style.display = "none"; // Hide default image
                }
            }
        } catch (error) {
            console.error("Error loading profile picture:", error);
            profileAvatar.src = "default-avatar.png";
            profileAvatar.style.display = "none";
            const navProfileAvatarImg = document.getElementById("navProfileAvatar");
            if (navProfileAvatarImg) {
                navProfileAvatarImg.src = "";
                navProfileAvatarImg.style.display = "none";
            }
            const username = document.getElementById("username").textContent;
            const initials = username.split(' ').map(name => name[0]).join('').toUpperCase();
            profileIcon.textContent = initials.substring(0, 1); // Show first initial in navbar on error
            profileIcon.style.backgroundImage = '';
            profileIcon.style.backgroundColor = '#f167a1';
            profileIcon.style.color = 'white';
            profileIcon.style.display = 'flex';
            profileIcon.style.justifyContent = 'center';
            profileIcon.style.alignItems = 'center';
            const profileInitialsExpanded = document.getElementById("profileInitials");
            if (profileInitialsExpanded) {
                profileInitialsExpanded.style.display = "flex"; // Show initials in expanded menu on error
            }
            if (defaultProfileIconImg) {
                defaultProfileIconImg.style.display = "none"; // Hide default image
            }
        }
    }

    const profileExpandedMenu = document.getElementById("profileExpandedMenu");
    profileIcon.addEventListener("click", function (event) {
        event.stopPropagation();
        profileExpandedMenu.classList.toggle("show");
    });

    document.addEventListener("click", function (event) {
        if (!profileExpandedMenu.contains(event.target) && event.target !== profileIcon) {
            profileExpandedMenu.classList.remove("show");
        }
    });
    try {
        // Fetch the user's role from the backend
        const response = await fetch('/api/user-role');
        if (!response.ok) throw new Error('Failed to fetch user role');
        const data = await response.json();
    
        // Check if the user has an admin role
        if (data.role === 'admin') {
          // Show the Admin link
          const adminLink = document.querySelector('.admin-link');
          if (adminLink) {
            adminLink.style.display = 'inline';
          } else {
            // Dynamically add the Admin link if it doesn't exist in the HTML
            const navMenu = document.querySelector('.nav-menu');
            const adminLinkElement = document.createElement('a');
            adminLinkElement.href = 'admin.html';
            adminLinkElement.textContent = 'Admin';
            navMenu.appendChild(adminLinkElement);
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
});