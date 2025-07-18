

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
// Mood Wheel Script
if (!localStorage.getItem("completedActivities")) {
    localStorage.setItem("completedActivities", JSON.stringify([]));
}
if (!localStorage.getItem("spinCount")) {
    localStorage.setItem("spinCount", 0);
}

let currentActivity = "";
const wheelContainer = document.querySelector(".wheel-options");
const activities = [
    "🌬️ Deep Breathing",
    "💪 Stretch Routine",
    "🕺 Dance for 1 Song",
    "🎨 Draw for 3 Min",
    "🌳 Step Outside & Breathe",
    "💌 Write 3 Wins Today"
];

wheelContainer.innerHTML = "";

// Wheel layout
const radius = 70;
activities.forEach((activity, index) => {
    const section = document.createElement("span");
    section.className = "wheel-section";
    section.innerHTML = activity;

    const angle = (index * 360) / activities.length;
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;

    section.style.position = "absolute";
    section.style.left = "30%";
    section.style.top = "40%";
    section.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
    section.style.transformOrigin = "center";

    wheelContainer.appendChild(section);
});

// Spin button
document.getElementById("spinWheelButton").addEventListener("click", () => {
    let spinCount = parseInt(localStorage.getItem("spinCount")) + 1;
    localStorage.setItem("spinCount", spinCount);

    let completedActivities = JSON.parse(localStorage.getItem("completedActivities"));
    let remainingActivities = activities.filter(act => !completedActivities.includes(act));

    if (remainingActivities.length === 0) {
        alert("✅ All activities done! No more left to spin.");
        return;
    }

    const anglePerActivity = 360 / remainingActivities.length;
    const selectedIndex = Math.floor(Math.random() * remainingActivities.length);
    const extraSpins = 5;
    const finalAngle = (extraSpins * 360) + (360 - (selectedIndex * anglePerActivity));

    wheelContainer.style.transition = "transform 1.8s ease-out";
    wheelContainer.style.transform = `rotate(${finalAngle}deg)`;

    setTimeout(() => {
        currentActivity = remainingActivities[selectedIndex];
        document.getElementById("selectedActivity").textContent = `🎯 Your activity: ${currentActivity}!`;
        document.getElementById("completeActivityButton").style.display = "inline-block";
    }, 3000);

    setTimeout(() => {
        if (spinCount >= 3 && remainingActivities.length >= 2) {
            if (confirm("😞 Still not feeling better? Would you like to talk to a professional?")) {
                window.location.href = "chatbot.html";
            }
        }
    }, 3500);
});

// Mark activity complete
document.getElementById("completeActivityButton").addEventListener("click", () => {
    let completedActivities = JSON.parse(localStorage.getItem("completedActivities"));
    if (!completedActivities.includes(currentActivity)) {
        completedActivities.push(currentActivity);
        localStorage.setItem("completedActivities", JSON.stringify(completedActivities));
    }

    document.getElementById("progressStatus").textContent = `✅ Completed: ${completedActivities.length}/6 activities`;
    document.getElementById("completeActivityButton").style.display = "none";

    if (completedActivities.length === 6) {
        alert("🏅 Congrats! You've earned a 'Mood Champion' badge!");
        sendBadgeEmail(); // Call backend to email badge
        localStorage.removeItem("completedActivities");
        localStorage.setItem("spinCount", 0);
    }
});

// Call backend email route
function sendBadgeEmail() {
    const email = prompt("Enter your email to receive your badge:");
    if (email) {
        fetch("/send-badge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
        })
        .catch(err => {
            alert("Error sending badge email.");
        });
    }
}
