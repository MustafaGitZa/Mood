// Facial Recognition Button Logic
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

            console.log('Mood Analysis:', detections.expressions); // Output detected moods
            // Optional: Send detected mood data to the backend
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

    // Optional: Send emoji data to the backend
    fetch('/save-emoji', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, emoji })
    }).then(response => response.json())
      .then(data => console.log('Emoji saved:', data));
});
