document.addEventListener("DOMContentLoaded", function () {
    const profileIcon = document.getElementById("profileIcon");
    const profileMenu = document.getElementById("profileMenu");

    profileIcon.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevent the click event from bubbling up to the document
        profileMenu.classList.toggle("show");
    });

    
    document.addEventListener("click", function (event) {
        if (!profileMenu.contains(event.target) && event.target !== profileIcon) {
            profileMenu.classList.remove("show");
        }
    });
});


document.getElementById('facial-recognition-btn').addEventListener('click', async () => {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('overlay');
    video.style.display = 'block';
    canvas.style.display = 'block';

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');

    setInterval(async () => {
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                                            .withFaceExpressions();
        if (detections) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawFaceExpressions(canvas, detections);

            console.log('Mood Analysis:', detections.expressions); 
            
            fetch('/save-mood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 1, loggedMood: JSON.stringify(detections.expressions) })
            }).then(response => response.json())
              .then(data => console.log('Mood saved:', data));
        }
    }, 100);
});

// Emoji Selector Button Logic
document.getElementById('emoji-selector-btn').addEventListener('click', () => {
    const emojis = ['😊', '😂', '😢', '😡', '😎', '🥳'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    document.getElementById('selected-emoji').textContent = `Selected Emoji: ${emoji}`;
    console.log('Emoji Selected:', emoji);

    // Save the selected emoji to the server
    fetch('/save-emoji', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, emoji })
    }).then(response => response.json())
      .then(data => console.log('Emoji saved:', data));
});

//Function to fetch the tips
function fetchTip() {
    fetch("/fetch-tips", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        if (data.tip_text) {
            const modalText = document.getElementById("modalTipText");
            modalText.innerHTML = `
                <p><strong>Tip:</strong> ${data.tip_text}</p>
            `;

            // blur effect with modal
            const modal = document.getElementById("tipModal");
            modal.style.display = "block";
            document.body.classList.add("modal-active");
        } else {
            alert("No tips found for the logged mood.");
        }
    })
    .catch((error) => {
        console.error("Error fetching tip:", error);
        alert("An error occurred while fetching the tip.");
    });
}


// Function to close the modal
function closeModal() {
    const modal = document.getElementById("tipModal");
    modal.style.display = "none";
    document.body.classList.remove("modal-active"); 
}

