console.log("Facial recognition script is running...");

// DOM Elements
const video = document.getElementById("webcam");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const captureButton = document.getElementById("captureMood"); // Capture button
const moodLabel = document.getElementById("moodLabel");

console.log("Video element:", video);
console.log("Canvas element:", canvas);

// Variables for storing detected mood and image
let detectedMood = "";
let capturedImage = null;
let detectionActive = true;

// Face-api.js detection options
const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 512, // Higher input size for better accuracy
    scoreThreshold: 0.5 // Confidence threshold
});

// Start Webcam
async function startWebcam() {
    try {
        console.log("Attempting to access webcam...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("Webcam stream obtained:", stream);
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            console.log("Webcam metadata loaded. Video should play now.");
            video.play();

            // Ensure canvas matches video dimensions dynamically
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            console.log(`Canvas dimensions set: ${canvas.width}x${canvas.height}`);
        };
    } catch (error) {
        console.error("Error accessing webcam:", error);
    }
}

// Stop Webcam
function stopWebcam() {
    const stream = video.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); // Stop all video tracks
    }
    video.srcObject = null;
    console.log("Webcam stopped.");
}

// Load Face-api.js Models
async function loadModels() {
    console.log("Loading Face-api.js models...");
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models")
        .then(() => console.log("Tiny Face Detector model loaded successfully."))
        .catch(error => console.error("Error loading Tiny Face Detector:", error));

    await faceapi.nets.faceExpressionNet.loadFromUri("/models")
        .then(() => console.log("Face Expression Net model loaded successfully."))
        .catch(error => console.error("Error loading Face Expression Net:", error));
}

// Detect Faces and Render Results
async function detectMoods() {
    console.log("Starting mood detection...");
    const intervalId = setInterval(async () => {
        if (!detectionActive) return; // Stop detection if mood is already captured

        try {
            const detections = await faceapi.detectAllFaces(video, options)
                .withFaceExpressions();

                if (detections.length > 0) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
                    detections.forEach(detection => {
                        const box = detection.detection.box;
                        const expressions = detection.expressions;
    
                        // Draw the face box
                        ctx.strokeStyle = "red";
                        ctx.lineWidth = 2;
                        ctx.strokeRect(box.x, box.y, box.width, box.height);
    
                        // Get and display dominant mood
                        const mood = getDominantMood(expressions);
                        ctx.font = "16px Arial";
                        ctx.fillStyle = "red";
                        ctx.fillText(`${mood}`, box.x, box.y - 10);
    
                        // Show tick mark (✔) inside canvas at detected mood position
                        ctx.font = "24px Arial";
                        ctx.fillStyle = "green";
                        ctx.fillText("✔", box.x + box.width / 2 - 10, box.y + box.height / 2); // Adjust position for center
    
                        // Update mood label
                        moodLabel.innerText = `${mood}`;
    
                        // Stop webcam after detection
                        stopWebcam();
                        clearInterval(detectionInterval); // Stop detection loop
                    });
                } else {
                moodLabel.innerText = "No face detected.";
                moodTick.innerText = ""; // Hide tick if no face
            }
        } catch (error) {
            console.error("Error in mood detection loop:", error);
        }
    }, 100); // Refresh every 100ms
}

// Function to get the most dominant mood
function getDominantMood(expressions) {
    let maxProbability = 0;
    let mood = "Neutral";

    for (const [expression, probability] of Object.entries(expressions)) {
        if (probability > maxProbability) {
            maxProbability = probability;
            mood = expression;
        }
    }
    return mood;
}

// Capture the current frame and mood
function captureMood() {
    if (!detectedMood) {
        if (!detectedMood) {
            moodLabel.innerText = "No face detected. Please try again.";
        } else {
            moodLabel.innerText = `${detectedMood}`;
        }
    }

    // Capture the image from the video
    const snapshotCanvas = document.createElement('canvas');
    snapshotCanvas.width = video.videoWidth;
    snapshotCanvas.height = video.videoHeight;
    const snapshotCtx = snapshotCanvas.getContext('2d');
    snapshotCtx.drawImage(video, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
    
    // Store the image as a Base64 string
    capturedImage = snapshotCanvas.toDataURL('image/png');

    alert(`Mood Captured: ${detectedMood}`);
    
    // Example: Saving the data in localStorage (optional)
    localStorage.setItem("mood", detectedMood);
    localStorage.setItem("moodImage", capturedImage);

    console.log("Mood and image saved:", { detectedMood, capturedImage });
}

// Main Function
(async function main() {
    await startWebcam();
    await loadModels();
    await detectMoods();
})();
