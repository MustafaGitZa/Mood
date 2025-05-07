document.addEventListener('DOMContentLoaded', function () {
    // Store the fetched users globally for filtering
      let allUsers = [];
  
    // Fetch all registered users
    async function fetchRegisteredUsers() {
      try {
        const response = await fetch('/admin/registered-users');
        console.log("Fetching /admin/registered-users...");
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const users = await response.json();
        console.log("Users fetched successfully:", users);
  
        // Store users globally for filtering
        allUsers = users;
  
        // Show total user count
        const totalUsersDiv = document.getElementById('totalUsers');
        if (totalUsersDiv) {
          totalUsersDiv.textContent = `Total Registered Users: ${users.length}`;
        }
  
        renderUsers(users); // Render the users in the table
      } catch (error) {
        console.error('Failed to fetch users:', error);
        const totalUsersDiv = document.getElementById('totalUsers');
        if (totalUsersDiv) {
          totalUsersDiv.textContent = 'Error loading user data.';
        }
      }
    }
  
    // Render users in the table
    function renderUsers(users) {
      const tbody = document.querySelector('#userTable tbody');
      if (tbody) {
        tbody.innerHTML = '';
        users.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.surname}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${new Date(user.created_at).toLocaleString()}</td>
            <td>
              <div class="dropdown">
                <button class="dropbtn">${user.role || "user"}</button>
                <div class="dropdown-content">
                  <a href="#" class="role-user">User</a>
                  <a href="#" class="role-admin">Admin</a>
                </div>
              </div>
            </td>
          `;
          tbody.appendChild(row);
  
          // Add event listeners for role change
          row.querySelector('.role-user').addEventListener('click', (e) => {
            e.preventDefault();
            updateUserRole(user.user_id, 'user');
          });
  
          row.querySelector('.role-admin').addEventListener('click', (e) => {
            e.preventDefault();
            updateUserRole(user.user_id, 'admin');
          });
        });
      }
    }
  
  // Filter users based on search input
  function filterUsers() {
    const searchInput = document.getElementById('userSearch').value.toLowerCase();
    const filteredUsers = allUsers.filter(user =>
      user.name.toLowerCase().includes(searchInput) ||
      user.surname.toLowerCase().includes(searchInput) ||
      user.username.toLowerCase().includes(searchInput) ||
      user.email.toLowerCase().includes(searchInput)
    );
    renderUsers(filteredUsers); // Re-render the table with filtered users
  }
  
  
    // Fetch active users
    async function fetchActiveUsers() {
      try {
        const response = await fetch('/admin/active-users');
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const activeUsers = await response.json();
  
        const activeUsersDiv = document.getElementById('activeUsers');
        if (activeUsersDiv) {
          activeUsersDiv.textContent = `Active Users (Last 7 Days): ${activeUsers.length}`;
        }
  
        const tbody = document.querySelector('#activeUserTable tbody');
        if (tbody) {
          tbody.innerHTML = '';
          activeUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${user.name}</td>
              <td>${user.surname}</td>
              <td>${user.username}</td>
              <td>${user.email}</td>
              <td>${new Date(user.last_login).toLocaleString()}</td>
              <td>
                  <button class="report-button" data-user-id="${user.user_id}">Download Report</button>
              </td>
            `;
            tbody.appendChild(row);
          });
  
            // Attach event listeners to the "Download Report" buttons
            document.querySelectorAll('.report-button').forEach(button => {
              button.addEventListener('click', generateUserReport);
          });
          
        }
      } catch (error) {
        console.error('Failed to fetch active users:', error);
        const activeUsersDiv = document.getElementById('activeUsers');
        if (activeUsersDiv) {
          activeUsersDiv.textContent = 'Error loading active user data.';
        }
      }
    }
  
          async function fetchAdmins() {
            try {
                const response = await fetch('/admin/admin-details');
                if (!response.ok) throw new Error('Failed to fetch admin details');
                const admins = await response.json();
  
                const adminTableBody = document.querySelector('#adminTable tbody');
                adminTableBody.innerHTML = '';
                admins.forEach(admin => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${admin.name}</td>
                        <td>${admin.surname}</td>
                        <td>${admin.username}</td>
                        <td>${admin.email}</td>
                        <td>${new Date(admin.registration_date).toLocaleString()}</td>
                    `;
                    adminTableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error fetching admin details:', error);
            }
        }
  
        async function downloadAdminReport() {
          try {
              const response = await fetch('/admin/admin-details');
              if (!response.ok) throw new Error('Failed to fetch admin details');
              const admins = await response.json();
  
              const { jsPDF } = window.jspdf;
              const doc = new jsPDF();
  
              // Add report title
              doc.text('Admin Report', 10, 10);
  
              // Add total number of admins
              doc.text(`Total Admins: ${admins.length}`, 10, 20);
  
              // Add admin details
              let yPosition = 30;
              admins.forEach((admin, index) => {
                  doc.setFontSize(9);
                  doc.text(
                      `${index + 1}. Name: ${admin.name}, Surname: ${admin.surname}, Username: ${admin.username}, Email: ${admin.email}, registration_date: ${new Date(admin.registration_date).toLocaleString()}`,
                      10,
                      yPosition
                  );
                  yPosition += 10;
              });
  
                  // Save the PDF
                  doc.save('Admin_Report.pdf');
                } catch (error) {
                    console.error('Error generating admin report:', error);
                }
            }
  
  
            // Attach event listener to the download button
            document.getElementById('downloadAdminReport').addEventListener('click', downloadAdminReport);
  
  
          // Generate user report
          async function generateUserReport(event) {
            const userId = event.target.getAttribute('data-user-id');
            try {
                const response = await fetch(`/admin/user-report/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch user report');
                const userReport = await response.json();
  
                // Generate PDF using jsPDF
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
  
                // Add user details
                doc.text(`User Report for ${userReport.name} ${userReport.surname}`, 10, 10);
                doc.text(`Username: ${userReport.username}`, 10, 20);
                doc.text(`Email: ${userReport.email}`, 10, 30);
                doc.text(`Last Login: ${new Date(userReport.last_login).toLocaleString()}`, 10, 40);
  
                // Add moods logged
                doc.text('Moods Logged:', 10, 50);
                userReport.moods.forEach((mood, index) => {
                    const yPosition = 60 + index * 10;
                    doc.text(`- ${mood.logged_mood} (Logged on: ${new Date(mood.log_date).toLocaleString()})`, 10, yPosition);
                });
  
                // Save the PDF
                doc.save(`${userReport.username}_report.pdf`);
            } catch (error) {
                console.error('Error generating user report:', error);
            }
        }
  
    // Update user role
    async function updateUserRole(userId, newRole) {
  
      console.log("Sending role update request for userId:", userId, "to newRole:", newRole); // Debugging log
  
      try {
        const response = await fetch('/admin/update-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, newRole }),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          alert(result.message); // Show success message
          fetchRegisteredUsers(); // Refresh the table
        } else {
          alert(`Failed to update role: ${result.message}`); // Show error message
        }
      } catch (error) {
        console.error('Error updating user role:', error);
        alert('An error occurred while updating the user role.');
      }
    }
   document.getElementById('userSearch').addEventListener('input', filterUsers); // Add event listener for search input
  
   
  
    // Run both fetch functions on load
    fetchRegisteredUsers();
    fetchActiveUsers();
     // Fetch admins on page load
     fetchAdmins();
  
  });
  
  document.addEventListener("DOMContentLoaded", async () => {
    const spotifyPlaylistTableBody = document.querySelector("#spotifyPlaylistTable tbody");
  
    // Helper function to extract link names from URLs
    function extractLinkName(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', ''); // Extract hostname and remove 'www.'
        } catch {
            return "N/A"; // Return "N/A" if the URL is invalid
        }
    }
  
    async function fetchSpotifyPlaylists() {
      try {
          const response = await fetch('/admin/spotify-playlists');
          const playlists = await response.json();
  
          // Populate the table
          spotifyPlaylistTableBody.innerHTML = playlists.map(playlist => `
              <tr data-id="${playlist.id}" data-source="spotify">
                  <td>${playlist.mood_name}</td>
                  <td>
                      <div>
                          <strong>Amapiano:</strong> ${extractLinkName(playlist.amapiano_link)}<br>
                          <input type="text" value="${playlist.amapiano_link}" class="amapiano-link" />
                      </div>
                      <div>
                          <strong>Kwaito:</strong> ${extractLinkName(playlist.kwaito_link)}<br>
                          <input type="text" value="${playlist.kwaito_link}" class="kwaito-link" />
                      </div>
                      <div>
                          <strong>Global:</strong> ${extractLinkName(playlist.global_link)}<br>
                          <input type="text" value="${playlist.global_link}" class="global-link" />
                      </div>
                      <div>
                          <strong>Podcast 1:</strong> ${extractLinkName(playlist.podcast_link_1)}<br>
                          <input type="text" value="${playlist.podcast_link_1}" class="podcast-link-1" />
                      </div>
                      <div>
                              <strong>Podcast 2:</strong> ${extractLinkName(playlist.podcast_link_2)}<br>
                              <input type="text" value="${playlist.podcast_link_2}" class="podcast-link-2" />
                          </div>
                      </td>
                      <td>
                          <button class="update-button">Update</button>
                      </td>
                  </tr>
              `).join('');
          } catch (error) {
              console.error("Error fetching Spotify playlists:", error);
          }
      }
  
      const youtubePlaylistTableBody = document.querySelector("#youtubePlaylistTable tbody");
    console.log("YouTube Playlist Table Body:", youtubePlaylistTableBody); // Debugging log
  
    // Helper function to extract link names from URLs
    function extractLinkName(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', ''); // Extract hostname and remove 'www.'
        } catch {
            return "N/A"; // Return "N/A" if the URL is invalid
        }
    }
  
    // Fetch YouTube playlists and populate the table
       // Fetch YouTube playlists and populate the table
       async function fetchYouTubePlaylists() {
        try {
            const response = await fetch('/admin/youtube-playlists');
            const playlists = await response.json();
  
            // Populate the table
            youtubePlaylistTableBody.innerHTML = playlists.map(playlist => `
                <tr data-id="${playlist.id}" data-source="youtube">
                    <td>${playlist.mood_name}</td>
                    <td>
                        <div>
                            <strong>Amapiano:</strong> ${extractLinkName(playlist.amapiano_link)}<br>
                            <input type="text" value="${playlist.amapiano_link}" class="amapiano-link" />
                        </div>
                        <div>
                            <strong>Kwaito:</strong> ${extractLinkName(playlist.kwaito_link)}<br>
                            <input type="text" value="${playlist.kwaito_link}" class="kwaito-link" />
                        </div>
                        <div>
                            <strong>Global:</strong> ${extractLinkName(playlist.global_link)}<br>
                            <input type="text" value="${playlist.global_link}" class="global-link" />
                        </div>
                        <div>
                            <strong>Podcast 1:</strong> ${extractLinkName(playlist.podcast_link_1)}<br>
                            <input type="text" value="${playlist.podcast_link_1}" class="podcast-link-1" />
                        </div>
                        <div>
                              <strong>Podcast 2:</strong> ${extractLinkName(playlist.podcast_link_2)}<br>
                              <input type="text" value="${playlist.podcast_link_2}" class="podcast-link-2" />
                          </div>
                      </td>
                      <td>
                          <button class="update-button">Update</button>
                      </td>
                  </tr>
              `).join('');
          } catch (error) {
              console.error("Error fetching YouTube playlists:", error);
          }
      }
  
      async function fetchBooks() {
        try {
            const response = await fetch('/admin/books');
            if (!response.ok) throw new Error('Failed to fetch books');
            const books = await response.json();
    
            const bookTableBody = document.querySelector('#bookTable tbody');
            bookTableBody.innerHTML = '';
            books.forEach(book => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${book.mood_name}</td>
                    <td><input type="text" value="${book.googlebook_link_1}" data-id="${book.id}" data-field="googlebook_link_1"></td>
                    <td><input type="text" value="${book.googlebook_link_2}" data-id="${book.id}" data-field="googlebook_link_2"></td>
                    <td><input type="text" value="${book.audiobook_link_1}" data-id="${book.id}" data-field="audiobook_link_1"></td>
                    <td><input type="text" value="${book.audiobook_link_2}" data-id="${book.id}" data-field="audiobook_link_2"></td>
                    <td>
                        <button class="update-book-button" data-id="${book.id}">Update</button>
                    </td>
                `;
                bookTableBody.appendChild(row);
            });
  
             // Attach event listeners for update and delete buttons
          document.querySelectorAll('.update-book-button').forEach(button => {
            button.addEventListener('click', updateBook);
        });
  
        
    } catch (error) {
        console.error('Error fetching books:', error);
    }
  }
  
  async function updateBook(event) {
    const bookId = event.target.getAttribute('data-id');
    const row = event.target.closest('tr');
    const inputs = row.querySelectorAll('input');
    const updatedData = {};
  
    inputs.forEach(input => {
        updatedData[input.getAttribute('data-field')] = input.value;
    });
  
    try {
        const response = await fetch(`/admin/books/${bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
  
        if (!response.ok) throw new Error('Failed to update book');
        alert('Book updated successfully!');
    } catch (error) {
        console.error('Error updating book:', error);
    }
  }
    // Handle update button click for YouTube playlists
    youtubePlaylistTableBody.addEventListener("click", async (event) => {
        if (event.target.classList.contains("update-button")) {
            const row = event.target.closest("tr");
            const id = row.dataset.id;
            const source = row.dataset.source;
            const amapianoLink = row.querySelector(".amapiano-link").value;
            const kwaitoLink = row.querySelector(".kwaito-link").value;
            const globalLink = row.querySelector(".global-link").value;
            const podcastLink1 = row.querySelector(".podcast-link-1").value;
            const podcastLink2 = row.querySelector(".podcast-link-2").value;
  
            try {
                const response = await fetch('/admin/playlists/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id,
                        source,
                        amapiano_link: amapianoLink,
                        kwaito_link: kwaitoLink,
                        global_link: globalLink,
                        podcast_link_1: podcastLink1,
                        podcast_link_2: podcastLink2,
                    }),
                });
  
                if (response.ok) {
                    alert("YouTube playlist or podcast updated successfully!");
                } else {
                    alert("Failed to update YouTube playlist or podcast.");
                }
            } catch (error) {
                console.error("Error updating YouTube playlist or podcast:", error);
            }
        }
    });
  
    // Handle update button click
    spotifyPlaylistTableBody.addEventListener("click", async (event) => {
        if (event.target.classList.contains("update-button")) {
            const row = event.target.closest("tr");
            const id = row.dataset.id;
            const source = row.dataset.source;
            const amapianoLink = row.querySelector(".amapiano-link").value;
            const kwaitoLink = row.querySelector(".kwaito-link").value;
            const globalLink = row.querySelector(".global-link").value;
            const podcastLink1 = row.querySelector(".podcast-link-1").value;
            const podcastLink2 = row.querySelector(".podcast-link-2").value;
  
            try {
                const response = await fetch('/admin/playlists/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id,
                        source,
                        amapiano_link: amapianoLink,
                        kwaito_link: kwaitoLink,
                        global_link: globalLink,
                        podcast_link_1: podcastLink1,
                        podcast_link_2: podcastLink2,
                    }),
                });
  
                if (response.ok) {
                    alert("Playlist or podcast updated successfully!");
                } else {
                    alert("Failed to update playlist or podcast.");
                }
            } catch (error) {
                console.error("Error updating playlist or podcast:", error);
            }
        }
  
        
    });
  
  
    // Call fetchBooks on page load   
    fetchBooks();
     // Call fetchYouTubePlaylists on page load
     fetchYouTubePlaylists();
     // Call fetchSpotifyPlaylists on page load
     fetchSpotifyPlaylists();
  
   
  });
  