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


document.addEventListener("DOMContentLoaded", async function () {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("User not logged in.");
        window.location.href = "/login.html"; // Redirect to login if user is not logged in
        return;
    }

    const moodWallContainer = document.getElementById("currentMood");

    // Function to fetch the last 3 moods from the API
    async function fetchRecentMoods() {
        try {
            const response = await fetch(`/get-mood-logs?userId=${userId}`);
            const moodLogs = await response.json();

            if (!response.ok) {
                alert("Failed to fetch mood logs.");
                return [];
            }

            // Return only the last 3 moods
            return moodLogs.slice(0, 3);
        } catch (error) {
            console.error("Error fetching moods:", error);
            alert("An error occurred while loading moods.");
            return [];
        }
    }

    // Function to populate the mood wall preview
    async function populateMoodWall() {
        const moodWallContainer = document.getElementById("currentMood");
        const recentMoods = await fetchRecentMoods();
    
        if (!recentMoods.length) {
            moodWallContainer.innerHTML = "<p>No recent moods to display.</p>";
            return;
        }
    
        // Create preview container
        const previewContainer = document.createElement("div");
        previewContainer.className = "mood-preview";
    
        // Display the last mood as a preview
        const lastMood = recentMoods[0];
        const previewHeader = document.createElement("div");
        previewHeader.className = "mood-preview-header";
        previewHeader.innerHTML = `
            <span class="mood-icon">${lastMood.logged_mood}</span>
            <span class="mood-preview-title">Last Mood Logged: ${new Date(lastMood.log_date).toLocaleString()}</span>
        `;
        previewContainer.appendChild(previewHeader);
    
        // Hidden container for older moods
        const olderMoodsContainer = document.createElement("div");
        olderMoodsContainer.className = "older-moods";
        olderMoodsContainer.style.display = "none"; 
    
        // Add the last 3 moods inside hidden container
        recentMoods.slice(1).forEach((mood) => {
            const moodCard = document.createElement("div");
            moodCard.className = "mood-post";
            moodCard.innerHTML = `
                <div class="mood-info">
                    <span class="mood-icon">${mood.logged_mood}</span>
                    <p class="mood-date">${new Date(mood.log_date).toLocaleString()}</p>
                </div>
                <div class="mood-reactions">
                    <button class="reaction-btn" data-log-id="${mood.log_id}" data-reaction="❤️">❤️ <span class="reaction-count">0</span></button>
                    <button class="reaction-btn" data-log-id="${mood.log_id}" data-reaction="👍">👍 <span class="reaction-count">0</span></button>
                    <button class="reaction-btn" data-log-id="${mood.log_id}" data-reaction="😢">😢 <span class="reaction-count">0</span></button>
                    <button class="reaction-btn" data-log-id="${mood.log_id}" data-reaction="🧡">🧡 <span class="reaction-count">0</span></button>
                </div>
                <button class="share-btn" data-log-id="${mood.log_id}">Share to Community</button>
            `;
            olderMoodsContainer.appendChild(moodCard);
        });
    
        moodWallContainer.innerHTML = ""; // Clear existing content
        moodWallContainer.appendChild(previewContainer);
        moodWallContainer.appendChild(olderMoodsContainer);
    
        // Show More button
        if (recentMoods.length > 1) {
            const showMoreBtn = document.createElement("button");
            showMoreBtn.className = "show-more-btn";
            showMoreBtn.innerText = "🔍 Show More Moods";
    
            showMoreBtn.addEventListener("click", () => {
                olderMoodsContainer.style.display = "block";
                showMoreBtn.style.display = "none"; // Hide button after clicking
            });
    
            moodWallContainer.appendChild(showMoreBtn);
        }
    }
    
    // Populate the mood wall
    await populateMoodWall();

    // Reaction handler (same as before)
    document.body.addEventListener("click", async (e) => {
        if (e.target && e.target.classList.contains("reaction-btn")) {
            const reactionBtn = e.target;
            const logId = reactionBtn.getAttribute("data-log-id");
            const reaction = reactionBtn.getAttribute("data-reaction");
    
            try {
                const response = await fetch("/add-reaction", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ logId, reaction, userId }),
                });
    
                if (response.ok) {
                    const reactionCountSpan = reactionBtn.querySelector(".reaction-count");
                    let count = parseInt(reactionCountSpan.textContent);
                    count++;
                    reactionCountSpan.textContent = count; // Update count on UI
                } else {
                    alert("Failed to add reaction.");
                }
            } catch (error) {
                console.error("Error adding reaction:", error);
                alert("An error occurred while reacting to the mood.");
            }
        }
    
        // Share to Community handler
        if (e.target && e.target.classList.contains("share-btn")) {
            const logId = e.target.getAttribute("data-log-id"); // Get mood log ID
            try {
                const response = await fetch("/share-mood", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ logId }), // Send log ID to backend
                });
    
                if (response.ok) {
                    alert("Mood shared successfully!");
                    e.target.disabled = true; // Disable button after sharing
                    e.target.textContent = "Shared!";
                } else {
                    alert("Failed to share mood.");
                }
            } catch (error) {
                console.error("Error sharing mood:", error);
                alert("An error occurred while sharing the mood.");
            }
        }
    });
});


  
document.addEventListener("DOMContentLoaded", () => {
    const playlistContainer = document.getElementById("moodPlaylist");
    const showPlaylistButton = document.getElementById("showPlaylistButton");
    const backToMoodRoomButton = document.getElementById("backToMoodRoom");

    showPlaylistButton.addEventListener("click", () => {
        const currentMood = "happy"; // Replace with actual mood logic

        const playlists = {
            happy: [
                { title: "Pharrell Williams - Happy", url: "https://www.youtube.com/embed/ZbZSe6N_BXs" },
                { title: "Justin Timberlake - Can’t Stop The Feeling", url: "https://www.youtube.com/embed/ru0K8uYEZWw" }
            ],
            sad: [
                { title: "Lewis Capaldi - Someone You Loved", url: "https://www.youtube.com/embed/bCuhuePlP8o" },
                { title: "Adele - Easy On Me", url: "https://www.youtube.com/embed/U3ASj1L6_sY" }
            ],
            relaxed: [
                { title: "Lo-fi Chill Beats", url: "https://www.youtube.com/embed/jfKfPfyJRdk" },
                { title: "Chillhop Essentials", url: "https://www.youtube.com/embed/7NOSDKb0HlU" }
            ]
        };

        showPlaylistButton.style.display = "none"; // Hide button
        backToMoodRoomButton.style.display = "block"; // Show back button
        playlistContainer.style.display = "block"; // Show playlist tracks

        playlistContainer.innerHTML = ""; // Clear previous content

        if (playlists[currentMood]) {
            playlists[currentMood].forEach((track) => {
                const trackCard = document.createElement("div");
                trackCard.className = "track-card";
                trackCard.innerHTML = `
                    <div class="track-info">
                        <span class="track-icon">🎵</span>
                        <span class="track-title">${track.title}</span>
                    </div>
                    <div class="video-embed">
                        <iframe width="300" height="169" src="${track.url}" frameborder="0" allowfullscreen></iframe>
                    </div>
                `;
                playlistContainer.appendChild(trackCard);
            });
        } else {
            playlistContainer.innerHTML = "<p>No playlist available for your mood.</p>";
        }
    });

    backToMoodRoomButton.addEventListener("click", () => {
        playlistContainer.style.display = "none"; // Hide playlist
        showPlaylistButton.style.display = "block"; // Show the button again
        backToMoodRoomButton.style.display = "none"; // Hide back button
    });
});

async function loadCommunityWall() {
    const sharedMoodsContainer = document.getElementById("sharedMoods");
    const showMoreBtn = document.getElementById("showMoreMoods");

    try {
        // Fetch shared moods from the API
        const response = await fetch("/community-moods");
        const sharedMoods = await response.json();

        if (!response.ok || sharedMoods.length === 0) {
            sharedMoodsContainer.innerHTML = "<p>No shared moods to display.</p>";
            showMoreBtn.style.display = "none"; // Hide button if no moods exist
            return;
        }

        // Clear existing content
        sharedMoodsContainer.innerHTML = "";

        // Render the latest mood first
        const latestMood = sharedMoods[0];
        const latestMoodCard = document.createElement("div");
        latestMoodCard.className = "mood-card";
        latestMoodCard.innerHTML = `
            <div class="mood-content">
                <div class="mood-icon">${latestMood.logged_mood}</div>
                <p class="mood-date">${new Date(latestMood.log_date).toLocaleString()}</p>
            </div>
            <div class="mood-actions">
                <button class="like-btn" data-community-id="${latestMood.community_id}">❤️</button>
                <button class="comment-toggle-btn" data-community-id="${latestMood.community_id}">💬</button>
                <button class="repost-btn" data-community-id="${latestMood.community_id}">🔁</button>
            </div>
            <div class="comment-section" id="comments-${latestMood.community_id}" style="display: none;">
                <div class="message-section">
                    <button class="message-btn" data-community-id="${latestMood.community_id}" data-message="Stay strong!">Stay strong!</button>
                    <button class="message-btn" data-community-id="${latestMood.community_id}" data-message="You're amazing!">You're amazing!</button>
                    <button class="message-btn" data-community-id="${latestMood.community_id}" data-message="I can relate!">I can relate!</button>
                </div>
                <div class="comment-list"></div>
            </div>
        `;
        sharedMoodsContainer.appendChild(latestMoodCard);

        // Create a container for older moods, initially hidden
        const olderMoodsContainer = document.createElement("div");
        olderMoodsContainer.className = "older-moods";
        olderMoodsContainer.style.display = "none";

        // Add the rest of the moods inside the hidden container
        sharedMoods.slice(1).forEach((mood) => {
            const moodCard = document.createElement("div");
            moodCard.className = "mood-card";
            moodCard.innerHTML = `
                <div class="mood-content">
                    <div class="mood-icon">${mood.logged_mood}</div>
                    <p class="mood-date">${new Date(mood.log_date).toLocaleString()}</p>
                </div>
                <div class="mood-actions">
                    <button class="like-btn" data-community-id="${mood.community_id}">❤️</button>
                    <button class="comment-toggle-btn" data-community-id="${mood.community_id}">💬</button>
                    <button class="repost-btn" data-community-id="${mood.community_id}">🔁</button>
                </div>
                <div class="comment-section" id="comments-${mood.community_id}" style="display: none;">
                    <div class="message-section">
                        <button class="message-btn" data-community-id="${mood.community_id}" data-message="Stay strong!">Stay strong!</button>
                        <button class="message-btn" data-community-id="${mood.community_id}" data-message="You're amazing!">You're amazing!</button>
                        <button class="message-btn" data-community-id="${mood.community_id}" data-message="I can relate!">I can relate!</button>
                    </div>
                    <div class="comment-list"></div>
                </div>
            `;
            olderMoodsContainer.appendChild(moodCard);
        });

        sharedMoodsContainer.appendChild(olderMoodsContainer);

        // Ensure "Show More" button remains visible if there are older moods
        if (sharedMoods.length > 1) {
            showMoreBtn.style.display = "block"; // Ensure it's visible

            showMoreBtn.addEventListener("click", () => {
                olderMoodsContainer.style.display = "block";
                showMoreBtn.style.display = "none"; // Hide button after clicking
            });
        } else {
            showMoreBtn.style.display = "none"; // Hide button if only one mood exists
        }

    } catch (error) {
        console.error("Error loading community wall:", error);
        sharedMoodsContainer.innerHTML = "<p>An error occurred while loading the Community Mood Wall.</p>";
        showMoreBtn.style.display = "none"; // Hide button in case of failure
    }
}



// Call this function to load moods when the page is ready
loadCommunityWall();

document.body.addEventListener("click", async (e) => {
    if (e.target && e.target.classList.contains("like-btn")) {
        const likeButton = e.target;
        const communityId = likeButton.getAttribute("data-community-id");

        try {
            const response = await fetch(`/add-reaction`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ communityId, reaction: "❤️" }),
            });

            if (response.ok) {
                let count = parseInt(likeButton.textContent.replace("❤️", "").trim()) || 0;
                count++;
                likeButton.textContent = `❤️ ${count}`;
            } else {
                alert("Failed to like the mood.");
            }
        } catch (error) {
            console.error("Error liking the mood:", error);
        }
    }
});


document.body.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("comment-toggle-btn")) {
        const communityId = e.target.getAttribute("data-community-id");
        const commentSection = document.getElementById(`comments-${communityId}`);

        // Toggle visibility and adjust parent container size
        const isVisible = commentSection.style.display === "block";
        if (!isVisible) {
            commentSection.style.display = "block";
            commentSection.style.width = "100%"; // Expand to full width
        } else {
            commentSection.style.display = "none";
        }

        // Adjust container's height dynamically
        const communityContainer = document.querySelector(".community-wall-container");
        communityContainer.style.height = isVisible ? "auto" : `${communityContainer.scrollHeight}px`;
    }
});


document.body.addEventListener("click", async (e) => {
    if (e.target && e.target.classList.contains("message-btn")) {
        const communityId = e.target.getAttribute("data-community-id");
        const message = e.target.getAttribute("data-message");
        const commentList = document.querySelector(`#comments-${communityId} .comment-list`);

        try {
            const response = await fetch("/send-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ communityId, message }),
            });

            if (response.ok) {
                const commentDiv = document.createElement("div");
                commentDiv.className = "comment";
                commentDiv.innerHTML = `
                    <p>${message}</p>
                    <small>Just now</small>
                `;
                commentList.appendChild(commentDiv);
            } else {
                alert("Failed to send message.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("An error occurred while sending the message.");
        }
    }
});


document.body.addEventListener("click", async (e) => {
    if (e.target && e.target.classList.contains("repost-btn")) {
        const communityId = e.target.getAttribute("data-community-id");

        try {
            const response = await fetch("/repost-mood", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ communityId }),
            });

            if (response.ok) {
                alert("Mood reposted successfully!");
            } else {
                alert("Failed to repost mood.");
            }
        } catch (error) {
            console.error("Error reposting mood:", error);
            alert("An error occurred while reposting the mood.");
        }
    }
});
