console.log("Emoji selector script is running...");

// DOM Elements
const emojiButtons = document.querySelectorAll(".emoji-btn");
const emojiLabel = document.getElementById("emojiLabel");
const saveEmojiButton = document.getElementById("saveEmojiButton");
const moodSavedModal = document.getElementById("moodSavedModal"); // First Modal
const emojiPopup = document.getElementById("emojiPopup"); // Second Modal
const closeSavedButton = document.querySelector(".close-saved"); // Close button for first modal
const okSavedButton = document.querySelector(".ok-saved"); // OK button for first modal
const closeEbookMusicButton = document.querySelector(".close-ebook-music"); // Close button for second modal
const musicButton = document.getElementById("musicButton");
const ebookButton = document.getElementById("ebookButton");
const modalTitleSavedElement = document.getElementById("modalTitleSaved");
const modalTextSavedElement = document.getElementById("modalTextSaved");
const blurOverlay = document.getElementById("blurOverlay"); // Overlay for background blur

// Variables for storing selected mood
let selectedEmojiMood = "";

// Mapping moods to actual Spotify playlists
const moodPlaylists = {
    "Happy": "https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC",  // Happy Hits
    "Sad": "https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1",    // Sad Songs
    "Angry": "https://open.spotify.com/playlist/37i9dQZF1DWYxwmBaMqxsl",  // Rage Beats
    "Calm": "https://open.spotify.com/playlist/37i9dQZF1DX3PIPIT6lEg5",   // Calm Vibes
    "Energetic": "https://open.spotify.com/playlist/37i9dQZF1DX8tZsk68tuDw" // Workout Motivation
};

// Handle emoji button clicks
emojiButtons.forEach(button => {
    button.addEventListener("click", function () {
        // Update the selected mood
        selectedEmojiMood = this.dataset.meaning; // Using dataset for clarity
        emojiLabel.innerText = `Selected Emoji Mood: ${selectedEmojiMood}`;
        console.log("Selected emoji mood:", selectedEmojiMood);
    });
});

// Save emoji mood and trigger the first modal
saveEmojiButton.addEventListener("click", async () => {
    if (!selectedEmojiMood) {
        alert("Please select an emoji mood before saving!");
        return;
    }

    try {
        const userId = 1; // Example user ID
        const response = await fetch("/save-emoji", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, moodName: selectedEmojiMood, moodType: "emoji_selection" })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Emoji mood successfully saved!");

            // Show the first modal AFTER saving the mood
            blurOverlay.style.display = "block"; // Display blur overlay
            moodSavedModal.style.display = "flex"; // Show modal centered
            modalTitleSavedElement.textContent = "Mood Saved!";
            modalTextSavedElement.textContent = `Mood "${selectedEmojiMood}" has been logged successfully!`;
        } else {
            console.error("Failed to save mood:", data.message);
            alert("Failed to save mood. Please try again.");
        }
    } catch (error) {
        console.error("Error saving mood:", error);
        alert("An error occurred while saving the mood. Please try again!");
    }
});

// Close the first modal
closeSavedButton.addEventListener("click", () => {
    moodSavedModal.style.display = "none";
    blurOverlay.style.display = "none";
});

// When OK is clicked, show the second modal
okSavedButton.addEventListener("click", () => {
    moodSavedModal.style.display = "none"; // Hide first modal
    emojiPopup.style.display = "flex"; // Show second modal centered
});

// Handle music button click
musicButton.onclick = function () {
    let playlistUrl = moodPlaylists[selectedEmojiMood];

    if (!playlistUrl) {
        // If no direct playlist found, fallback to search
        playlistUrl = `https://open.spotify.com/search/${encodeURIComponent(selectedEmojiMood)}`;
    }

    window.open(playlistUrl, "_blank");
};

// Handle ebook button click
ebookButton.onclick = function () {
    const ebookUrl = "https://play.google.com/store/books?hl=en";
    window.open(ebookUrl, "_blank");
};

// Close the second modal
closeEbookMusicButton.onclick = function () {
    emojiPopup.style.display = "none";
    blurOverlay.style.display = "none";
};

