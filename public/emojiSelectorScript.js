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
    const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(selectedEmojiMood)}`;
    window.open(spotifySearchUrl, "_blank");
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
