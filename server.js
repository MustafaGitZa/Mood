const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const path = require("path");
const { initializeModels, detectMood } = require("./detectMood.js"); // Import mood detection functions

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Serve all files in the 'public' directory
app.use('/models', express.static(path.join(__dirname, "models"))); // Serve models for Face-api.js

// Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Astroworld@24",
  database: "moodsync"
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    process.exit(1); // Exit if connection fails
  }
  console.log("Connected to MySQL database!");
});


// Initialize Face-api.js Models
initializeModels();

// Routes

// Serve Landing Page for "/landing" and Default for "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "landing.html")); // Serve landing.html as default for root URL
});

app.get("/landing", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "landing.html"));
});

// Serve Login Page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Serve Register Page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Serve Dashboard Page
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Serve Facial Recognition Page
app.get("/facial-recognition", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "facialRecognition.html"));
});


// Save Mood Data Route (POST)
app.post("/facialRecogntion", async (req, res) => {
  const { moodName, moodType } = req.body;  // Mood name from the client request

    // Assuming the userId is passed as part of the request (you might want to fetch it from session or JWT in a real app)
    const userId = 1;  // Set a default userId or get it from session/auth system

    if (!userId || !moodName) {
        return res.status(400).json({ message: "User ID and mood are required." });
    }

  

  const query = `
    INSERT INTO MoodLogs (user_id, mood_type, logged_mood, log_date) 
    VALUES (?, ?, ?, NOW())
  `;
  db.query(query, [userId, moodType ,moodName], (err, result) => {
    if (err) {
      console.error("Error saving mood data:", err);
      return res.status(500).json({ message: "Error saving mood data. Please try again later." });
    }
    res.status(201).json({ message: "Mood data saved successfully!" });
  });
});

// Save Emoji Data Route (POST)
app.post("/save-emoji", (req, res) => {
  const { userId, emoji } = req.body;

  if (!userId || !emoji) {
    return res.status(400).json({ message: "User ID and emoji are required." });
  }

  const query = `
    INSERT INTO MoodLogs (user_id, mood_type, logged_mood, log_date) 
    VALUES (?, 'emoji', ?, NOW())
  `;
  db.query(query, [userId, emoji], (err, result) => {
    if (err) {
      console.error("Error saving emoji data:", err);
      return res.status(500).json({ message: "Error saving emoji data. Please try again later." });
    }
    res.status(201).json({ message: "Emoji data saved successfully!" });
  });
});

// Register Route (POST)
app.post("/register", async (req, res) => {
  const { username, password, email , name, surname} = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: "Username, password, and email are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO users (username, password, email, name, surname) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [username, hashedPassword, email, name, surname], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          res.status(400).json({ message: "Username or email already exists!" });
        } else {
          console.error("Error during registration:", err);
          res.status(500).json({ message: "Error during registration. Please try again later." });
        }
      } else {
        res.status(201).json({ message: "User registered successfully!" + name });
      }
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Login Route (POST)
app.post("/login", (req, res) => {
  console.log('Login route hit'); // This log will help us know if the route is triggered
  const { username, password } = req.body;

  console.log("Received login request for username:", username); // Log received username

  if (!username || !password) {
    return res.redirect("/login?error=Username and password are required.");
  }

  const query = "SELECT * FROM users WHERE username = ?";
  console.log('Executing query:', query, 'with username:', username); // Log the query being executed
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Error during login:", err);
      res.status(500).json({ message: "Error during login. Please try again later." });
    } else if (results.length === 0) {
      onsole.log('No user found with username:', username); // Log when no user is found
      res.status(401).json({ message: "Invalid username or password." });
    } else {
      const user = results[0];
      console.log('User found:', user); // Log the user object to inspect its structure
      try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          console.log("Password match successful. Sending userId:", user.user_id); // Log userId being sent
          console.log('Password match successful for user:', user.username); // Log successful password match
          res.status(200).json({ message: "Login successful!", userId: user.user_id, username: user.username, redirectUrl: "/home" });
        } else {
          res.status(401).json({ message: "Invalid username or password." });
        }
      } catch (error) {
        console.error("Error comparing passwords:", error);
        res.status(500).json({ message: "Internal server error." });
      }
    }
  });
});

app.get("/get-profile", (req, res) => {
  const userId = req.query.userId; // Get userId from query parameter

  console.log("Received profile request for userId:", userId); // Log received userId
  if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
  }

  const query = "SELECT username, name, surname, email FROM users WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
      if (err) {
          console.error("Error fetching profile:", err);
          return res.status(500).json({ message: "Error fetching profile details." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "User not found." });
      }

      console.log("Profile data fetched successfully for userId:", userId);
      res.json(results[0]); // Send user details
  });
});

app.post("/update-profile", (req, res) => {
  const { userId, name, surname, email, username } = req.body;

  console.log("Received update request for userId:", userId); // Log received userId

  if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
  }

  const query = "UPDATE users SET name = ?, surname = ?, email = ?, username = ? WHERE user_id = ?";
  db.query(query, [name, surname, email, username, userId], (err, result) => {
      if (err) {
          console.error("Error updating profile:", err);
          return res.status(500).json({ message: "Error updating profile." });
      }

      console.log("Profile updated successfully for userId:", userId); // Log success
      res.json({ message: "Profile updated successfully!" ,redirectUrl: "/dashboard"});
  });
});

app.get("/get-username", (req, res) => {
  const userId = req.query.userId;

  console.log("Fetching username for userId:", userId); // Debugging

  if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
  }

  const query = "SELECT username FROM users WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
      if (err) {
          console.error("Error fetching username:", err);
          return res.status(500).json({ message: "Error fetching username." });
      }

      if (results.length === 0) {
          console.log("No user found with userId:", userId);
          return res.status(404).json({ message: "User not found." });
      }

      console.log("Username fetched successfully:", results[0].username);
      res.json({ username: results[0].username });
  });
});


// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
