console.log("Emoji Selector Save Mood script is running...");
console.log("Checking existing moods for:", userId, moodName);
console.log("Existing moods found:", existing);



// DOM Elements
const saveMoodButton = document.getElementById("saveEmojiButton");
const emojiLabel = document.getElementById("emojiLabel");
const blurOverlay = document.getElementById("blurOverlay");
const moodSavedModal = document.getElementById("moodSavedModal");  // First Modal
const emojiPopup = document.getElementById("emojiPopup");          // Second Modal
const closeSavedButton = document.querySelector(".close-saved");   // Close button for first modal
const okSavedButton = document.querySelector(".ok-saved");         // OK button for first modal
const closeEbookMusicButton = document.querySelector(".close-ebook-music"); // Close button for second modal
const musicButton = document.getElementById("musicButton");
const ebookButton = document.getElementById("ebookButton");
const modalTitleSavedElement = document.getElementById("modalTitleSaved");
const modalTextSavedElement = document.getElementById("modalTextSaved");

// Mapping moods to actual Spotify playlists
const moodPlaylists = {
    "Happy": "https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC",  // Happy Hits
    "Sad": "https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1",    // Sad Songs
    "Angry": "https://open.spotify.com/playlist/37i9dQZF1DWYxwmBaMqxsl",  // Rage Beats
    "Calm": "https://open.spotify.com/playlist/37i9dQZF1DX3PIPIT6lEg5",   // Calm Vibes
    "Energetic": "https://open.spotify.com/playlist/37i9dQZF1DX8tZsk68tuDw" // Workout Motivation
};

let currentMoodName = ""; // we'll store mood here for musicButton later

saveMoodButton.addEventListener("click", async function () {
    currentMoodName = emojiLabel.innerText.replace("Selected Emoji Mood: ", "").trim();
    const moodType = "emoji_selection";

    if (!currentMoodName) {
        alert("No emoji mood selected. Please try again!");
        return;
    }

    console.log("Mood Name:", currentMoodName);
    console.log("Mood Type:", moodType);

    try {
        const response = await fetch("/save-emoji", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: 1, moodName: currentMoodName, moodType })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Mood saved successfully!");
            // Show first modal
            blurOverlay.style.display = "block";
            moodSavedModal.style.display = "block";

            modalTitleSavedElement.textContent = "Mood Saved!";
            modalTextSavedElement.textContent = `Mood "${currentMoodName}" has been logged successfully!`;

        } else {
            console.error("Error Response Data:", data.message);
            alert(data.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while saving your mood.");
    }
});

// Close first modal
closeSavedButton.addEventListener("click", () => {
    moodSavedModal.style.display = "none";
    blurOverlay.style.display = "none";
});

// When OK button is clicked on first modal, show second modal
okSavedButton.addEventListener("click", () => {
    moodSavedModal.style.display = "none"; // Hide first modal
    emojiPopup.style.display = "block"; // Show second modal
});

// Music button opens playlist based on mood
musicButton.onclick = function () {
    let playlistUrl = moodPlaylists[currentMoodName];

    if (!playlistUrl) {
        // If no direct playlist found, fallback to search
        playlistUrl = "https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC";
    }

    window.open(playlistUrl, "_blank");
};

// Ebook button
ebookButton.onclick = function () {
    const ebookUrl = "https://play.google.com/store/books?hl=en";
    window.open(ebookUrl, "_blank");
};

// Close second modal
closeEbookMusicButton.onclick = function () {
    emojiPopup.style.display = "none";
    blurOverlay.style.display = "none";
};
