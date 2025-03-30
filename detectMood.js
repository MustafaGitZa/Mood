const faceapi = require('face-api.js');
const canvas = require('canvas');
const { createCanvas, loadImage } = canvas;

// Initialize models for facial recognition and mood detection
async function initializeModels() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromDisk('./models');
        await faceapi.nets.faceExpressionNet.loadFromDisk('./models');
        console.log('Models loaded successfully.');
    } catch (error) {
        console.error('Error loading models:', error);
    }
}

// Process webcam image or uploaded file for mood detection
async function detectMood(inputImage, isFile = false) {
    try {
        let img;
        if (isFile) {
            img = await loadImage(inputImage); // Load image from file upload
        } else {
            const { width, height } = inputImage;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(inputImage, 0, 0, width, height);
            img = canvas; // Process image from webcam feed
        }

        const results = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
                                     .withFaceExpressions();

        if (results) {
            console.log('Mood Analysis:', results.expressions); // Output detected moods
            return results.expressions;
        } else {
            console.log('No face detected.');
            return null;
        }
    } catch (error) {
        console.error('Error detecting mood:', error);
    }
}

module.exports = { initializeModels, detectMood };
