console.log("Emoji selector script is running...");

// DOM Elements
const emojiButtons = document.querySelectorAll(".emoji-btn");
const emojiLabel = document.getElementById("emojiLabel");
const saveEmojiButton = document.getElementById("saveEmojiButton");
const moodSavedModal = document.getElementById("moodSavedModal");
const emojiPopup = document.getElementById("emojiPopup");
const closeSavedButton = document.querySelector(".close-saved");
const okSavedButton = document.querySelector(".ok-saved");
const closeEbookMusicButton = document.querySelector(".close-ebook-music");
const musicButton = document.getElementById("musicButton");
const ebookButton = document.getElementById("ebookButton");
const modalTitleSavedElement = document.getElementById("modalTitleSaved");
const modalTextSavedElement = document.getElementById("modalTextSaved");
const blurOverlay = document.getElementById("blurOverlay");

// Variables for storing selected mood
let selectedEmojiMood = "";

// Mapping moods to Spotify playlists
const moodPlaylists = {
    "Happy": "https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC",
    "Sad": "https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1",
    "Angry": "https://open.spotify.com/playlist/37i9dQZF1DWYxwmBaMqxsl",
    "Calm": "https://open.spotify.com/playlist/37i9dQZF1DX3PIPIT6lEg5",
    "Energetic": "https://open.spotify.com/playlist/37i9dQZF1DX8tZsk68tuDw"
};

// Handle emoji button clicks
emojiButtons.forEach(button => {
    button.addEventListener("click", function () {
        selectedEmojiMood = this.dataset.meaning;
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
        const userId = 1;
        const response = await fetch("/save-emoji", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, moodName: selectedEmojiMood, moodType: "emoji_selection" })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Emoji mood successfully saved!");

            // Show first modal
            blurOverlay.style.display = "block";
            moodSavedModal.style.display = "flex";
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

// Close first modal
closeSavedButton.addEventListener("click", () => {
    moodSavedModal.style.display = "none";
    blurOverlay.style.display = "none";
});

// OK button to trigger second modal
okSavedButton.addEventListener("click", () => {
    moodSavedModal.style.display = "none";
    emojiPopup.style.display = "flex";
});

// Music button click → to music platform page with mood query param
musicButton.onclick = function () {
    const platformPageUrl = `music-platforms.html?mood=${encodeURIComponent(selectedEmojiMood)}`;
    window.location.href = platformPageUrl;
};

// Ebook button click → to ebook platform page with mood query param
ebookButton.onclick = function () {
    const platformPageUrl = `ebook-platforms.html?mood=${encodeURIComponent(selectedEmojiMood)}`;
    window.location.href = platformPageUrl;
};

// Close second modal
closeEbookMusicButton.onclick = function () {
    emojiPopup.style.display = "none";
    blurOverlay.style.display = "none";
};
