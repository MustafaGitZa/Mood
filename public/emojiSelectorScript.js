console.log("Emoji selector script is running...");

// DOM Elements
const emojiButtons = document.querySelectorAll(".emoji-btn");
const emojiLabel = document.getElementById("emojiLabel");
const saveEmojiButton = document.getElementById("saveEmojiButton");
const emojiPopup = document.getElementById("emojiPopup");
const blurOverlay = document.getElementById("blurOverlay");
const closePopupButton = document.getElementById("closePopup");

// Variables for storing selected mood
let selectedEmojiMood = "";


// Handle emoji button clicks
function emojiClicked(meaning) {
    selectedEmojiMood = meaning; // Save the meaning (e.g., "Happy") instead of the emoji
    emojiLabel.innerText = `Selected Emoji Mood: ${selectedEmojiMood}`;
    console.log("Selected emoji mood:", selectedEmojiMood);
}

// Save emoji mood and trigger modal
saveEmojiButton.addEventListener("click", async () => {
    if (!selectedEmojiMood) {
        alert("Please select an emoji mood before saving!");
        return;
    }

    try {
        const userId = 1; // Replace with session-based user ID if needed
        const response = await fetch("/save-emoji", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, moodName: selectedEmojiMood, moodType: "emoji_selection" })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Emoji mood successfully saved!");
            alert(`Mood "${selectedEmojiMood}" has been logged successfully!`);

            // Show the blurred background overlay
            blurOverlay.style.display = "block";

            // Show the popup modal
            emojiPopup.style.display = "block";

            // Handle music button click
            document.getElementById("musicButton").onclick = function () {
                const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(selectedEmojiMood)}`;
                window.open(spotifySearchUrl, "_blank"); // Open in a new tab
            };

            // Handle ebook button click
            document.getElementById("ebookButton").onclick = function () {
                const ebookUrl = "https://play.google.com/store/books?hl=en"; // Modify this URL as needed
                window.open(ebookUrl, "_blank"); // Open in a new tab
            };

            // Handle modal close
            closePopupButton.onclick = function () {
                emojiPopup.style.display = "none";
                blurOverlay.style.display = "none";
            };
        } else {
            console.error("Failed to save emoji mood:", data.message);
            alert("Failed to log emoji mood. Please try again.");
        }
    } catch (error) {
        console.error("Error saving emoji mood:", error);
        alert("An error occurred while saving the mood. Please try again!");
    }
});
