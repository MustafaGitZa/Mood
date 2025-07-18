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

window.addEventListener("DOMContentLoaded", () => {
  // Mood health modal check
  fetch("/check-mood-health")
  .then(response => response.json())
  .then(data => {
    const { shouldShowModal } = data;

    if (!shouldShowModal) return;

    const hasSeenModal = localStorage.getItem("hasSeenMoodModal");

    if (hasSeenModal === "true") return;

    // Show the modal
    const modal = document.getElementById("moodModal");
    modal.style.display = "flex";

    const okBtn = document.getElementById("moodModalOkBtn");
    okBtn.onclick = () => {
      modal.style.display = "none";
      localStorage.setItem("hasSeenMoodModal", "true");
    };
  })
  .catch(err => console.error("Mood health check failed:", err));



  // Fetch music genres and add click handlers to open playlists modal
  fetch('/todays-genres')
    .then(response => response.json())
    .then(data => {
      const list = document.getElementById('musicGenres');
      list.innerHTML = '';
      data.genres.forEach(genre => {
        const li = document.createElement('li');
        li.textContent = genre;
        li.style.cursor = 'pointer';
        li.title = `Click to see playlists for "${genre}"`;
        li.onclick = () => openPlaylistModal(genre);
        list.appendChild(li);
      });
    })
    .catch(err => console.error("Failed to fetch genres:", err));

  // Fetch recommended reads
  fetch('/recommended-reads')
    .then(response => response.json())
    .then(data => {
      const list = document.getElementById('bookPicks');
      list.innerHTML = '';
      data.recommendations.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${item.bookType} (${item.mood} mood)</strong><br>
          Books: ${item.googleBooks.map(link => `<a href="${link}" target="_blank">Read</a>`).join(' | ')}<br>
          Audiobooks: ${item.audiobooks.map(link => `<a href="${link}" target="_blank">Listen</a>`).join(' | ')}
        `;
        list.appendChild(li);
      });
    })
    .catch(err => console.error("Failed to fetch reads:", err));
});

// Close modals
function closeMoodModal() {
  document.getElementById("moodModal").style.display = "none";
}
function closePlaylistModal() {
  document.getElementById("playlistModal").style.display = "none";
}

function openPlaylistModal(genre) {
  console.log("Opening modal for:", genre);
  const modal = document.getElementById("playlistModal");
  const title = document.getElementById("playlistModalTitle");
  const list = document.getElementById("playlistList");

  title.textContent = `Playlists for "${genre}"`;
  list.innerHTML = '<li>Loading playlists...</li>';

  modal.style.display = "flex";

  fetch(`/playlists-for-genre?genre=${encodeURIComponent(genre)}`)
    .then(response => response.json())
    .then(data => {
      list.innerHTML = '';
      if (data.playlists && data.playlists.length > 0) {
        data.playlists.forEach(pl => {
          const li = document.createElement('li');
          li.textContent = `${pl.mood_name} (${pl.platform})`;
          li.style.cursor = 'pointer';
          li.title = `Play on ${pl.platform}`;
          li.onclick = () => {
            console.log(`Playing playlist: ${pl.mood_name} on ${pl.platform}`);
            window.open(pl.url, '_blank'); // or replace with your play handler
          };
          list.appendChild(li);
        });
      } else {
        list.innerHTML = '<li>No playlists found for this genre.</li>';
      }
    })
    .catch(err => {
      console.error("Failed to fetch playlists:", err);
      list.innerHTML = '<li>Error loading playlists.</li>';
    });
}





window.addEventListener("DOMContentLoaded", () => {
  fetch('/api/mood-trends')
    .then(response => response.json())
    .then(data => {
      const trends = data.trends;
      if (trends.length === 0) {
        document.getElementById("moodBreakdownChart").outerHTML = "<p style='font-size:0.85rem;'>No mood data yet.</p>";
        return;
      }

      const moodColors = {
        happy: '#4CAF50',
        sad: '#FFEB3B',
        angry: '#FF5722',
        excited: '#2196F3',
        neutral: '#9E9E9E',
        surprised: '#9C27B0'
      };


      const ctx = document.getElementById("moodBreakdownChart").getContext("2d");

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: trends.map(item => item.logged_mood),
          datasets: [{
            label: 'Entries',
            data: trends.map(item => item.count),
            backgroundColor: trends.map(item => moodColors[item.logged_mood.toLowerCase()] || '#ccc'),
            borderRadius: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: '#eee',
                font: { size: 10 }
              },
              grid: { display: false }
            },
            x: {
              ticks: {
                color: '#eee',
                font: { size: 10 }
              },
              grid: { display: false }
            }
          }
        }
      });
    })
    .catch(err => {
      console.error("Mood trends fetch failed:", err);
      document.getElementById("moodBreakdownChart").outerHTML = "<p style='font-size:0.85rem;'>Error loading trends.</p>";
    });
});

function loadRecentMoodPost() {
  fetch('/mood-posts')
    .then(res => res.json())
    .then(posts => {
      const container = document.getElementById('recentMoodPost');
      if (posts.length === 0) {
        container.innerHTML = "<p>No posts yet. Be the first!</p>";
        return;
      }

      const moodEmojis = {
        Happy: '😊', Excited: '😁', Sad: '😓', Angry: '😡',
        Sleepy: '😴', Celebrating: '🥳', Surprised: '😲', Relaxed: '😌',
        Anxious: '😬', "In Love": '😍', Focused: '🧐', Bored: '😐',
        Energetic: '🤩', Nostalgic: '🥲', Lonely: '😔'
      };

      const post = posts[0];
      const emoji = moodEmojis[post.mood] || '💬';
      const username = post.is_anonymous ? 'Anonymous' : post.username;

      container.innerHTML = `
        <div class="recent-post-card" style="border:1px solid #ccc; padding:10px; border-radius:5px; max-width:400px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
            <div style="font-size:1.8rem;">${emoji}</div>
            <div>
              <strong>${username}</strong> <span style="color:#666;">(${post.mood})</span>
              <br>
              <small style="color:#999;">${new Date(post.post_date).toLocaleString()}</small>
            </div>
          </div>
          <p style="font-style:italic;">"${post.content}"</p>
        </div>
      `;
    })
    .catch(err => {
      console.error("Failed to load recent post:", err);
    });
}


window.onload = loadRecentMoodPost;

function fetchUserMessageCount(userEmail) {
  fetch(`/user-message-count?email=${userEmail}`)
    .then(res => res.json())
    .then(data => {
      const badge = document.getElementById('userMessageCount');
      badge.innerText = data.count;
      badge.style.display = data.count > 0 ? 'inline-block' : 'none';
    });
}

// Example: fetch on load if user logged in
document.addEventListener('DOMContentLoaded', () => {
  const userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    fetchUserMessageCount(userEmail);
  }
});

// Click to go to inbox
document.getElementById('userMessagesIcon').addEventListener('click', () => {
  window.location.href = 'myMessages.html';
});



 // Replace 1 with actual user ID from session
