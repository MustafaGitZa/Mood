document.getElementById("saveMoodButton").addEventListener("click", async function() {
  const moodName = document.getElementById("moodLabel").innerText.replace("Selected Emoji Mood: ", "").trim(); // Handles emoji moods
  const moodType = document.getElementById("moodType").value; // Dynamically detects the type (facial or emoji)

  // Determine the correct endpoint based on moodType
  const endpoint = moodType === "emoji_selection" ? "/save-emoji" : "/facialRecognition";

  const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moodName, moodType })
  });

  const data = await response.json();

  if (response.ok) {
      alert(data.message); // Show success message

      // Show the blurred background overlay
      document.getElementById("blurOverlay").style.display = "block";

      // Show the popup modal
      document.getElementById("moodPopup").style.display = "block";

      // Handle button clicks
      document.getElementById("musicButton").onclick = function () {
          const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(moodName)}`;
          window.open(spotifySearchUrl, "_blank"); // Open in a new tab
      };

      document.getElementById("ebookButton").onclick = function () {
          const ebookUrl = "https://play.google.com/store/books?hl=en&pli=1";  // Modify this URL
          window.open(ebookUrl, "_blank"); // Open in a new tab
      };

      document.getElementById("closePopup").onclick = function () {
          // Hide the modal and blurred background when the "Cancel" button is pressed
          document.getElementById("moodPopup").style.display = "none";
          document.getElementById("blurOverlay").style.display = "none";
      };
  } else {
      alert(data.message); // Show error message
  }
});
