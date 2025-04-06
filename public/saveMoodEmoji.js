console.log("Emoji Selector Save Mood script is running...");

// DOM Elements
const saveMoodButton = document.getElementById("saveEmojiButton");
const emojiLabel = document.getElementById("emojiLabel");
const blurOverlay = document.getElementById("blurOverlay");
const moodSavedModal = document.getElementById("moodSavedModal");  // First Modal
const emojiPopup = document.getElementById("emojiPopup");      // Second Modal
const closeSavedButton = document.querySelector(".close-saved"); // Close button for first modal
const okSavedButton = document.querySelector(".ok-saved");    // OK button for first modal
const closeEbookMusicButton = document.querySelector(".close-ebook-music"); // Close button for second modal
const musicButton = document.getElementById("musicButton");
const ebookButton = document.getElementById("ebookButton");
const modalTitleSavedElement = document.getElementById("modalTitleSaved");
const modalTextSavedElement = document.getElementById("modalTextSaved");


saveMoodButton.addEventListener("click", async function () {
    const moodName = emojiLabel.innerText.replace("Selected Emoji Mood: ", "").trim();
    const moodType = "emoji_selection";

    if (!moodName) {
        alert("No emoji mood selected. Please try again!");
        return;
    }

    console.log("Mood Name:", moodName);
    console.log("Mood Type:", moodType);

    try {
        const response = await fetch("/save-emoji", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: 1, moodName, moodType })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Mood saved successfully!");
            // Show first modal
            blurOverlay.style.display = "block";
            moodSavedModal.style.display = "block";

             modalTitleSavedElement.textContent = "Mood Saved!";
            modalTextSavedElement.textContent = `Mood "${moodName}" has been logged successfully!`;



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

//when ok button is clicked on first modal, show second modal
okSavedButton.addEventListener("click", () => {
    moodSavedModal.style.display = "none"; // Hide first modal
    emojiPopup.style.display = "block"; // Show second modal
});




musicButton.onclick = function () {
    const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(moodName)}`;
    window.open(spotifySearchUrl, "_blank");
};

ebookButton.onclick = function () {
    const ebookUrl = "https://play.google.com/store/books?hl=en";
    window.open(ebookUrl, "_blank");
};
// Close second modal
closeEbookMusicButton.onclick = function () {
    emojiPopup.style.display = "none";
    blurOverlay.style.display = "none";
};
