// Get the mood from the URL
const urlParams = new URLSearchParams(window.location.search);
const mood = urlParams.get("mood") || "your mood";

// Change the title dynamically if it exists
const pageTitleElement = document.getElementById("pageTitle");
if (pageTitleElement) {
    pageTitleElement.textContent = `Select a Music/Podcast Platform for ${mood}`;
}

// Spotify button - redirect to local page with mood param
const spotifyBtn = document.getElementById("spotifyBtn");
if (spotifyBtn) {
    spotifyBtn.addEventListener("click", () => {
        window.location.href = `spotify-page.html?mood=${encodeURIComponent(mood)}`;
    });
}

// YouTube button - redirect to local page with mood param
const youtubeBtn = document.getElementById("youtubeBtn");
if (youtubeBtn) {
    youtubeBtn.addEventListener("click", () => {
        window.location.href = `youtube-page.html?mood=${encodeURIComponent(mood)}`;
    });
}
