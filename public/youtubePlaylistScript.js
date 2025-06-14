document.addEventListener("DOMContentLoaded", () => {
  loadYouTubePlaylists();

  // Download button listener
  document.getElementById("downloadYouTubeExcel").addEventListener("click", () => {
    window.open("/admin/playlists/export?platform=youtube", "_blank");
  });
});

function loadYouTubePlaylists() {
  fetch('/admin/playlists?platform=youtube')
    .then(response => response.json())
    .then(data => {
      const tbody = document.querySelector("#youtubePlaylistTable tbody");
      tbody.innerHTML = "";

      data.forEach(mood => {
        mood.genres.forEach(genre => {
          genre.items.forEach(item => {
            const row = document.createElement("tr");

            row.innerHTML = `
              <td>${mood.mood_name}</td>
              <td>${genre.genre}</td>
              <td><input type="text" id="playlist_${item.id}" value="${item.playlist_link}" /></td>
              <td><input type="text" id="podcast1_${item.id}" value="${item.podcasts[0] || ''}" /></td>
              <td><input type="text" id="podcast2_${item.id}" value="${item.podcasts[1] || ''}" /></td>
              <td>
                <button onclick="updateYouTubePlaylist(${item.id}, '${escapeQuotes(mood.mood_name)}', '${escapeQuotes(genre.genre)}')">Update</button>
              </td>
            `;

            tbody.appendChild(row);
          });
        });
      });
    })
    .catch(err => {
      console.error("Failed to load playlists:", err);
      alert("Failed to load YouTube playlists.");
    });
}

function updateYouTubePlaylist(id, moodName, genre) {
  const playlistLink = document.getElementById(`playlist_${id}`).value;
  const podcast1 = document.getElementById(`podcast1_${id}`).value;
  const podcast2 = document.getElementById(`podcast2_${id}`).value;

  fetch('/admin/playlists/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: id,
      mood_name: moodName,
      genre: genre,
      playlist_link: playlistLink,
      podcast_link_1: podcast1,
      podcast_link_2: podcast2
    })
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      loadYouTubePlaylists();
    })
    .catch(err => {
      console.error("Update failed:", err);
      alert("Failed to update YouTube playlist.");
    });
}

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'");
}
