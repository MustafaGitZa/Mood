document.getElementById("saveMoodButton").addEventListener("click", async function() {
const moodName = document.getElementById("moodLabel").innerText;
const moodType = document.getElementById("moodType").value;

const response = await fetch("/facialRecogntion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moodName, moodType })
});
const data = await response.json();
if (response.ok) {
    alert(data.message); // Show success message
    
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
      document.getElementById("moodPopup").style.display = "none";
   };
    
    // Redirect the user to Spotify search page with moodName as the query
    //const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(moodName)}`;
    //window.location.href = spotifySearchUrl; // Redirect to Spotify search page
  } else {
    alert(data.message); // Show error message
  }
});