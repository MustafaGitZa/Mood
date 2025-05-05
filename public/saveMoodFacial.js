console.log("Facial Recognition Save Mood script is running...");

// DOM Elements
const saveMoodButton = document.getElementById("saveMoodButton");
//const moodLabel = document.getElementById("moodLabel"); // Facial mood label
const blurOverlay = document.getElementById("blurOverlay");
const moodPopup = document.getElementById("moodPopup");
const closePopupButton = document.getElementById("closePopup");
const musicButton = document.getElementById("musicButton");
const ebookButton = document.getElementById("ebookButton");

saveMoodButton.addEventListener("click", async function () {
    const moodName = moodLabel.innerText.replace("Detected Mood: ", "").trim(); // Get detected mood
    const moodType = "facial_recognition"; // Hardcoded for facial recognition

    if (!moodName) {
        alert("No facial mood detected. Please try again!");
        return;
    }

    console.log("Mood Name:", moodName);
    console.log("Mood Type:", moodType);

    const response = await fetch("/facialRecognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1, moodName, moodType }) // Replace userId dynamically if needed
    });

    const data = await response.json();

    if (response.ok) {
        alert(data.message); // Show success message
        blurOverlay.style.display = "block";
        moodPopup.style.display = "block";
    
        // Music button click → to internal music platform page with mood query param
        musicButton.onclick = function () {
            const platformPageUrl = `music-platforms.html?mood=${encodeURIComponent(moodName)}`;
            window.location.href = platformPageUrl;
        };
    
        // Ebook button click → to internal ebook platform page with mood query param
        ebookButton.onclick = function () {
            const platformPageUrl = `ebook-platforms.html?mood=${encodeURIComponent(moodName)}`;
            window.location.href = platformPageUrl;
        };
    
        // Close popup button
        closePopupButton.onclick = function () {
            moodPopup.style.display = "none";
            blurOverlay.style.display = "none";
        };
    } else {
        console.error("Error Response Data:", data);
        alert(data.message);
    }
    
    if (response.ok) {
    alert(data.message); // Show success message
    blurOverlay.style.display = "block";
    moodPopup.style.display = "block";

    // Music button click → to internal music platform page with mood query param
    musicButton.onclick = function () {
        const platformPageUrl = `music-platforms.html?mood=${encodeURIComponent(selectedEmojiMood)}`;
        window.location.href = platformPageUrl;
    };

    // Ebook button click → to internal ebook platform page with mood query param
    ebookButton.onclick = function () {
        const platformPageUrl = `ebook-platforms.html?mood=${encodeURIComponent(selectedEmojiMood)}`;
        window.location.href = platformPageUrl;
    };

    // Close popup button
    closePopupButton.onclick = function () {
        moodPopup.style.display = "none";
        blurOverlay.style.display = "none";
    };
} else {
    console.error("Error Response Data:", data);
    alert(data.message);
}
    // Music button click → to internal music platform page with mood query param
    musicButton.onclick = function () {
        const platformPageUrl = `music-platforms.html?mood=${encodeURIComponent(selectedEmojiMood)}`;
        window.location.href = platformPageUrl;
    };

    // Ebook button click → to internal ebook platform page with mood query param
    ebookButton.onclick = function () {
        const platformPageUrl = `ebook-platforms.html?mood=${encodeURIComponent(selectedEmojiMood)}`;
        window.location.href = platformPageUrl;
    };

});
