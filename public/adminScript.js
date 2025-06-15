document.addEventListener('DOMContentLoaded', () => {
  let allUsers = [];

  async function fetchRegisteredUsers() {
    try {
      const response = await fetch('/admin/registered-users');
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const users = await response.json();

      allUsers = users;

      const totalUsersDiv = document.getElementById('totalUsers');
      if (totalUsersDiv) {
        totalUsersDiv.textContent = `Total Registered Users: ${users.length}`;
      }

      renderUsers(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      const totalUsersDiv = document.getElementById('totalUsers');
      if (totalUsersDiv) {
        totalUsersDiv.textContent = 'Error loading user data.';
      }
    }
  }

  function renderUsers(users) {
  const tbody = document.querySelector('#userTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.surname}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${new Date(user.registration_date).toLocaleString()}</td>
      <td>
        <div class="dropdown">
          <button class="dropbtn">${user.role || 'user'}</button>
          <div class="dropdown-content">
            <a href="#" class="role-user">User</a>
            <a href="#" class="role-admin">Admin</a>
          </div>
        </div>
      </td>
      <td>
        <div class="dropdown">
          <button class="dropbtn">📥</button>
          <div class="dropdown-content">
            <a href="#" class="download-report" data-userid="${user.user_id}" data-format="pdf">PDF</a>
            <a href="#" class="download-report" data-userid="${user.user_id}" data-format="excel">Excel</a>
            <a href="#" class="download-report" data-userid="${user.user_id}" data-format="word">Word</a>
          </div>
        </div>
      </td>
    `;
    tbody.appendChild(row);

    // Role actions
    row.querySelector('.role-user').addEventListener('click', e => {
      e.preventDefault();
      updateUserRole(user.user_id, 'user');
    });

    row.querySelector('.role-admin').addEventListener('click', e => {
      e.preventDefault();
      updateUserRole(user.user_id, 'admin');
    });
  });

  // Attach download handlers
  document.querySelectorAll('.download-report').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const userId = e.target.getAttribute('data-userid');
      const format = e.target.getAttribute('data-format');
      downloadReport(userId, format);
    });
  });
}


  function filterUsers() {
    const searchInput = document.getElementById('userSearch');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase();
    const filtered = allUsers.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.surname.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );

    renderUsers(filtered);
  }

  // === Active Users ===
  async function fetchActiveUsers() {
  try {
    const res = await fetch('/admin/active-users');
    const users = await res.json();

    document.getElementById('activeUsers').textContent = `Active Users in the last 7 days: ${users.length}`;
    const tbody = document.querySelector('#activeUserTable tbody');
    tbody.innerHTML = '';

    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.surname}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${new Date(user.last_login).toLocaleString()}</td>
        <td>${user.reports_count}</td>
        <td>
          <div class="dropdown">
            <button class="dropbtn">📥</button>
            <div class="dropdown-content">
              <a href="#" class="download-report" data-userid="${user.user_id}" data-format="pdf">PDF</a>
              <a href="#" class="download-report" data-userid="${user.user_id}" data-format="excel">Excel</a>
              <a href="#" class="download-report" data-userid="${user.user_id}" data-format="word">Word</a>
            </div>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Attach download handlers
    document.querySelectorAll('.download-report').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const userId = e.target.getAttribute('data-userid');
        const format = e.target.getAttribute('data-format');
        downloadReport(userId, format);
      });
    });

  } catch (err) {
    console.error(err);
  }
}


  // Role update (sample stub)
  async function updateUserRole(userId, newRole) {
    try {
      const response = await fetch('/admin/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole }),
      });
      const result = await response.json();
      alert(result.message);
      fetchRegisteredUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating role.');
    }
  }

  // Bind search input
  const searchInput = document.getElementById('userSearch');
  if (searchInput) {
    searchInput.addEventListener('input', filterUsers);
  }

  // Load users on page load
  fetchRegisteredUsers();
  fetchActiveUsers();
});

  
  document.addEventListener("DOMContentLoaded", async () => {
    const spotifyPlaylistTableBody = document.querySelector("#spotifyPlaylistTable tbody");
    const youtubePlaylistTableBody = document.querySelector("#youtubePlaylistTable tbody");

    // Helper function to extract link names from URLs
    function extractLinkName(url) {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', ''); // Extract hostname and remove 'www.'
      } catch {
        return "N/A"; // Return "N/A" if the URL is invalid
      }
    }

    // Fetch playlists for a specific platform
    async function fetchPlaylists(platform) {
      try {
        const response = await fetch(`/admin/playlists?platform=${platform}`);
        return await response.json();
      } catch (error) {
        console.error(`Error fetching ${platform} playlists:`, error);
        return [];
      }
    }

    // Create a row for a mood with all its genres
    function createMoodRow(moodData, platform) {
      // Group items by genre
      const genreGroups = {};
      moodData.genres.forEach(genreGroup => {
        const genre = genreGroup.genre;
        genreGroups[genre] = genreGroup.items;
      });

      // Create the row HTML
      const row = document.createElement('tr');
      row.setAttribute('data-mood', moodData.mood_name);
      row.setAttribute('data-source', platform);

      // Mood name cell
      const moodCell = document.createElement('td');
      moodCell.textContent = moodData.mood_name;
      row.appendChild(moodCell);

      // Playlists cell
      const playlistsCell = document.createElement('td');

      // Add each genre section
      for (const [genre, items] of Object.entries(genreGroups)) {
        items.forEach(item => {
          const genreDiv = document.createElement('div');
          genreDiv.innerHTML = `
                <strong>${genre}:</strong> ${extractLinkName(item.playlist_link)}<br>
                <input type="text" value="${item.playlist_link}" class="playlist-link" data-genre="${genre}" data-id="${item.id}" />
                <div class="podcast-section">
                    <strong>Podcast 1:</strong> ${extractLinkName(item.podcasts[0] || '')}<br>
                    <input type="text" value="${item.podcasts[0] || ''}" class="podcast-link-1" data-id="${item.id}" />
                </div>
                <div class="podcast-section">
                    <strong>Podcast 2:</strong> ${extractLinkName(item.podcasts[1] || '')}<br>
                    <input type="text" value="${item.podcasts[1] || ''}" class="podcast-link-2" data-id="${item.id}" />
                </div>
            `;
          playlistsCell.appendChild(genreDiv);
        });
      }

      row.appendChild(playlistsCell);

      // Actions cell
      const actionsCell = document.createElement('td');
      const updateButton = document.createElement('button');
      updateButton.className = 'update-button';
      updateButton.textContent = 'Update All';
      actionsCell.appendChild(updateButton);
      row.appendChild(actionsCell);

      return row;
    }

    // Populate a table with playlists grouped by mood
    function populateTable(tableBody, moodGroups, platform) {
      tableBody.innerHTML = '';

      moodGroups.forEach(moodData => {
        const row = createMoodRow(moodData, platform);
        tableBody.appendChild(row);
      });

      // Add event listeners to update buttons
      tableBody.querySelectorAll('.update-button').forEach(button => {
        button.addEventListener('click', async function () {
          const row = this.closest('tr');
          const moodName = row.getAttribute('data-mood');
          const platform = row.getAttribute('data-source');

          // Get all playlist inputs in this row
          const updates = [];
          row.querySelectorAll('input[class="playlist-link"]').forEach(input => {
            const id = input.getAttribute('data-id');
            const genre = input.getAttribute('data-genre');
            const playlist_link = input.value;

            // Find corresponding podcast inputs
            const podcast1 = row.querySelector(`input.podcast-link-1[data-id="${id}"]`).value;
            const podcast2 = row.querySelector(`input.podcast-link-2[data-id="${id}"]`).value;

            updates.push({
              id,
              mood_name: moodName,
              genre,
              playlist_link,
              podcast_link_1: podcast1,
              podcast_link_2: podcast2
            });
          });

          // Send updates one by one
          try {
            for (const update of updates) {
              const response = await fetch('/admin/playlists/update', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(update)
              });

              if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
              }
            }

            alert('All playlists updated successfully!');
            fetchAndDisplayPlaylists(); // Refresh the data
          } catch (error) {
            console.error('Error updating playlists:', error);
            alert(`Failed to update playlists: ${error.message}`);
          }
        });
      });
    }

    // Fetch and display all playlists
    async function fetchAndDisplayPlaylists() {
      const spotifyMoodGroups = await fetchPlaylists('spotify');
      const youtubeMoodGroups = await fetchPlaylists('youtube');

      populateTable(spotifyPlaylistTableBody, spotifyMoodGroups, 'spotify');
      populateTable(youtubePlaylistTableBody, youtubeMoodGroups, 'youtube');
    }

    // Initialize the page
    fetchAndDisplayPlaylists();
  
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
  
  