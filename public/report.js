
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

document.getElementById("toggleCalendarBtn").addEventListener("click", () => {
    const container = document.getElementById("calendarContainer");
    container.style.display = container.style.display === "none" ? "block" : "none";
    if (container.style.display === "block") generateCalendar();
  });
  
  async function generateCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";
  
    const today = dayjs();
    const daysInMonth = today.daysInMonth();
    const year = today.year();
    const month = today.month(); // 0-indexed
  
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const headerRow = document.createElement("div");
    headerRow.classList.add("calendar-row");
    daysOfWeek.forEach(day => {
      const dayHeader = document.createElement("div");
      dayHeader.classList.add("calendar-header");
      dayHeader.textContent = day;
      headerRow.appendChild(dayHeader);
    });
    calendar.appendChild(headerRow);
  
    const firstDayOfMonth = today.startOf('month').day();
  
    let dayRow = document.createElement("div");
    dayRow.classList.add("calendar-row");
  
    for (let i = 0; i < firstDayOfMonth; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.classList.add("calendar-day", "empty");
      dayRow.appendChild(emptyCell);
    }
  
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayDiv = document.createElement("div");
      dayDiv.classList.add("calendar-day");
      dayDiv.textContent = day;
      dayDiv.dataset.date = dateStr;
  
      dayDiv.addEventListener("click", async () => {
        const formattedDate = dayDiv.dataset.date;
        console.log("📅 Fetching moods for:", formattedDate);
  
        try {
          const response = await fetch(`/moodlogs/${formattedDate}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const moods = await response.json();
  
          const moodList = document.getElementById("moodList");
          moodList.innerHTML = "";
  
          if (!Array.isArray(moods) || moods.length === 0) {
            moodList.innerHTML = `<p>No mood logs found for ${formattedDate}.</p>`;
            return;
          }
  
          moods.forEach(mood => {
            const moodElement = document.createElement("div");
            moodElement.classList.add("mood-entry");
            moodElement.textContent = `Mood: ${mood.logged_mood}, Type: ${mood.type_name}, Logged at: ${new Date(mood.log_date).toLocaleString()}`;
            moodList.appendChild(moodElement);
          });

          // Add a button to send the report via email
        const emailButton = document.createElement("button");
        emailButton.textContent = "Send Report via Email";
        emailButton.classList.add("email-button");
        emailButton.addEventListener("click", async () => {
          // Change button text to "Loading..." and disable the button
          emailButton.textContent = "Sending...";
          emailButton.disabled = true;
          emailButton.classList.add("loading");

          try {
            const emailResponse = await fetch("/send-report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ moods }),
            });

            const emailData = await emailResponse.json();

            console.log(emailData);

            alert(emailData.message);
          } catch (error) {
            console.error("Error sending email:", error);
            alert("Failed to send the report. Please try again.");
          } finally {
            // Revert button text and re-enable the button
            emailButton.textContent = "Send Report via Email";
            emailButton.disabled = false;
            emailButton.classList.remove("loading");
          }
        });

        moodList.appendChild(emailButton);
        } catch (error) {
          console.error("Error loading mood details:", error);
          const moodList = document.getElementById("moodList");
          moodList.innerHTML = `<p>Error loading mood details.</p>`;
        }
      });
  
      dayRow.appendChild(dayDiv);
  
      if ((day + firstDayOfMonth) % 7 === 0) {
        calendar.appendChild(dayRow);
        dayRow = document.createElement("div");
        dayRow.classList.add("calendar-row");
      }
    }
  
    if (dayRow.children.length > 0) {
      calendar.appendChild(dayRow);
    }
  }
  