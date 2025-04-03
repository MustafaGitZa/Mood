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

        musicButton.onclick = function () {
            const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(moodName)}`;
            window.open(spotifySearchUrl, "_blank");
        };

        ebookButton.onclick = function () {
            const ebookUrl = "https://play.google.com/store/books?hl=en"; // Modify if needed
            window.open(ebookUrl, "_blank");
        };

        closePopupButton.onclick = function () {
            moodPopup.style.display = "none";
            blurOverlay.style.display = "none";
        };
    } else {
        console.error("Error Response Data:", data);
        alert(data.message);
    }
});
