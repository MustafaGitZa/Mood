
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

document.addEventListener("DOMContentLoaded", function() {
  const exportBtn = document.getElementById("exportReportButton");
  if (exportBtn) {
    exportBtn.addEventListener("click", function() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text("Mood History Report", 20, 20);

      // Add chart image
      const canvas = document.getElementById("moodChart");
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", 20, 30, 170, 100);

      // Save the PDF
      doc.save("Mood_Report.pdf");
    });
  }
});


let chartInstance = null;

// Toggle calendar visibility
document.getElementById("toggleCalendarBtn").addEventListener("click", () => {
  const container = document.getElementById("calendarContainer");
  container.style.display = container.style.display === "none" ? "block" : "none";

  // Hide chart when calendar is shown
  if (container.style.display === "block") {
    generateCalendar();
    document.querySelector(".chart-container").style.display = "block";
  }
});

// Generate calendar grid
async function generateCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const today = dayjs();
  const daysInMonth = today.daysInMonth();
  const year = today.year();
  const month = today.month();

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

    dayDiv.addEventListener("click", () => {
      const formattedDate = dayDiv.dataset.date;
      console.log("📅 Fetching moods for:", formattedDate);
      individualMood(formattedDate);
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

// Fetch and process individual mood logs
async function individualMood(date) {
  try {
    const response = await fetch(`/moodlogs/${date}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    console.log("✅ Mood data received:", result);

    if (!Array.isArray(result.moodLogs) || result.moodLogs.length === 0) {
      alert(`No mood logs found for ${date}`);
      return;
    }

    const moodCounts = {};
    result.moodLogs.forEach(log => {
      const mood = log.logged_mood || log.emotion;
      if (mood) {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      }
    });

    initializeChart(moodCounts);
    populateMoodTable(result.moodLogs);
  } catch (error) {
    console.error("Error in individualMood():", error);
    alert("Failed to load mood data.");
  }
}

// Render mood chart
function initializeChart(moodCounts) {
  const ctx = document.getElementById("moodChart").getContext("2d");

  const data = {
    labels: Object.keys(moodCounts),
    datasets: [{
      label: 'Mood Count',
      data: Object.values(moodCounts).map(Number),
      backgroundColor: [
       '#4CAF50', // happy
        '#FFEB3B', // sad
        '#FF5722', // angry
        '#2196F3', // excited
        '#9E9E9E', // neutral
        '#9C27B0'  // surprised
      ],
      borderWidth: 1
    }]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, config);

  // Show chart after rendering
  document.querySelector("#moodModal .chart-container").style.display = "block";
}


// Populate modal mood table
function populateMoodTable(moodLogs) {
  const tableBody = document.getElementById("moodTableBody");
  const modal = document.getElementById("moodModal");
  const table = document.getElementById("moodTable");

  tableBody.innerHTML = "";

    moodLogs.forEach(log => {
      const row = document.createElement("tr");
      const dateCell = document.createElement("td");
      const moodCell = document.createElement("td");
      const timeCell = document.createElement("td");

      dateCell.textContent = new Date(log.dateTime).toLocaleDateString();
      moodCell.textContent = log.emotion || log.logged_mood;
      timeCell.textContent = new Date(log.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      row.appendChild(dateCell);
      row.appendChild(moodCell);
      row.appendChild(timeCell);
      tableBody.appendChild(row);
    });
  

  // Show the modal and the table
  modal.classList.add("show");
 
}


// Close modal
function closeMoodModal() {
  document.getElementById("moodModal").classList.remove("show");
}

document.getElementById("sendMoodBtn").addEventListener("click", () => {
  const email = prompt("Enter the recipient's email address:");
  if (!email) {
    alert("Email is required to send the report.");
    return;
  }

  // Collect mood data from the table
  const rows = document.querySelectorAll("#moodTableBody tr");
  if (rows.length === 0) {
    alert("No mood data available to send.");
    return;
  }

  const moodData = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    moodData.push({
      date: cells[0].textContent,
      mood: cells[1].textContent,
      time: cells[2].textContent
    });
  });

  // Send POST request to backend API route
  fetch("/send-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `email=${encodeURIComponent(email)}&moodData=${encodeURIComponent(JSON.stringify(moodData))}`
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === "success") {
      alert("✅ " + data.message);
    } else {
      alert("❌ " + data.message);
    }
  })
  .catch(error => {
    console.error("Error sending mood report:", error);
    alert("An error occurred while sending the email.");
  });
});