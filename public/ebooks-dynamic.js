// Get the mood from the URL
const urlParams = new URLSearchParams(window.location.search);
const mood = urlParams.get("mood") || "your mood";

// Change the title dynamically if it exists
const pageTitleElement = document.getElementById("pageTitle");
if (pageTitleElement) {
    pageTitleElement.textContent = `Select an Ebook/Audio Platform for ${mood}`;
}

// Google Books button - redirect to local page
const googleBooksBtn = document.getElementById("googleBooksBtn");
if (googleBooksBtn) {
    googleBooksBtn.addEventListener("click", () => {
        window.location.href = `google-books-page.html?mood=${encodeURIComponent(mood)}`;
    });
}

// Audible button - redirect to local page
const audibleBtn = document.getElementById("audibleBtn");
if (audibleBtn) {
    audibleBtn.addEventListener("click", () => {
        window.location.href = `audible-page.html?mood=${encodeURIComponent(mood)}`;
    });
}
