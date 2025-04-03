const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const { initializeModels, detectMood } = require("./detectMood.js"); // Import mood detection functions

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const session = require("express-session");

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files from 'public' folder
// Serve uploaded images (Ensure the uploaded images are served from 'public/uploads')
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/models', express.static(path.join(__dirname, "models"))); // Serve models for Face-api.js

// Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Astroworld@24",
  database: "moodsync"
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, 'public/uploads');
      console.log(`Uploading file to: ${uploadDir}`); // Log the upload path
      cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
      const filename = Date.now() + path.extname(file.originalname);
      console.log(`File saved as: ${filename}`); // Log the filename
      cb(null, filename);
  }
});
// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    process.exit(1); // Exit if connection fails
  }
  console.log("Connected to MySQL database!");
});


app.use(
  session({
    secret: "your_secret_key", // Use a strong secret key (store in env in production)
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set `true` if using HTTPS
  })
);

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

// Serve Emoji Selector Page
app.get("/emoji-selector", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "emojiSelector.html")); // Adjust the file name and path if necessary
});



// Save Mood Data Route (POST)
app.post("/facialRecognition", (req, res) => {
  const { moodName, moodType } = req.body;
  const userId = req.session?.userId || 1; // Replace with dynamic user ID if required

  // Log request data for debugging
  console.log("Request Data Received:", req.body);

  if (!userId || !moodName || !moodType) {
      return res.status(400).json({ message: "User ID, mood name, and mood type are required." });
  }

  const query = `
      INSERT INTO MoodLogs (user_id, mood_type, logged_mood, log_date)
      VALUES (?, ?, ?, NOW())
  `;

  // Execute the database query
  db.query(query, [userId, moodType, moodName], (err, result) => {
      if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ message: "Failed to save mood data. Please try again later." });
      }
      res.status(201).json({ message: "Facial recognition mood saved successfully!" });
  });
});


// Save Emoji Data Route (POST)
// Save Emoji Mood Data Route (POST)
app.post("/save-emoji", (req, res) => {
  const {  moodName, moodType } = req.body;

  // Retrieve the user ID from the session
  const userId = req.session?.userId;

  // If userId isn't available, return an error
  if (!userId) {
    return res.status(401).json({ message: "User not logged in." });
}

  // Debugging logs
  console.log("Request Data Received:", req.body);

  if (!userId || !moodName || !moodType) {
      console.error("Missing Fields:", req.body);
      return res.status(400).json({ message: "User ID, mood name, and mood type are required." });
  }

  const query = `
      INSERT INTO MoodLogs (user_id, mood_type, logged_mood, log_date) 
      VALUES (?, ?, ?, NOW())
  `;
  db.query(query, [userId, moodType, moodName], (err, result) => {
      if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ message: "Error saving emoji mood data. Please try again later." });
      }
      res.status(201).json({ message: "Emoji mood data saved successfully!" });
  });
});


// Register Route (POST)
app.post("/register", upload.single("profile_picture"), async (req, res) => {

  console.log("Register request received"); // Step 1: Check if request is received

  const { username, password, email , name, surname} = req.body;
  console.log("Received user details:", { username, email, name, surname });

  let profile_picture = null;

  if (req.file) {
    console.log("📸 Profile picture received:", req.file.filename);
    profile_picture = `/uploads/${req.file.filename}`; // Save the file path
    } else {
        console.log("No profile picture uploaded");
    }

  //const profile_picture = req.file ? `/uploads/${req.file.filename}` : null; // Get the filename of the uploaded image


  if (!username || !password || !email) {
    return res.status(400).json({ message: "Username, password, and email are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO users (username, password, email, name, surname, profile_picture) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(query, [username, hashedPassword, email, name, surname, profile_picture], (err, result) => {
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
           // Store userId in session
          req.session.userId = user.user_id;
          req.session.username = user.username;
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

app.get("/getUserProfile", (req, res) => {
  const userId = 11; // Replace with actual session user ID

  db.query("SELECT profile_picture FROM users WHERE user_id = ?", [userId], (err, results) => {
      if (err) {
          return res.status(500).json({ message: "Database error" });
      }
      if (results.length > 0) {
          // Return the image path directly as stored in the database
          res.json({ profile_picture: results[0].profile_picture });
      } else {
          res.json({ profile_picture: null });
      }
  });
});

// Fetch mood data (mood counts) for the logged-in user to draw bar charts
app.get("/ratings", (req, res) => {
  if (!req.session.userId) {
    return res.status(403).json({ message: "User not authenticated." });
  }

  const userId = req.session.userId;

  // Query to count moods for each type (happy, sad, angry, excited)
  const countMoodsQuery = `
    SELECT 
      SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'happy' THEN 1 ELSE 0 END) AS happy,
      SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'sad' THEN 1 ELSE 0 END) AS sad,
      SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'angry' THEN 1 ELSE 0 END) AS angry,
      SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'excited' THEN 1 ELSE 0 END) AS excited,
      SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'neutral' THEN 1 ELSE 0 END) AS neutral,
      SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'surprised' THEN 1 ELSE 0 END) AS surprised
    FROM moodlogs
    WHERE user_id = ?;
  `;

  db.query(countMoodsQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error counting moods:", err);
      return res.status(500).json({ message: "An error occurred while counting moods." });
    }

    // Extract mood counts from the query result
    const { happy, sad, angry, excited, neutral, surprised } = results[0];

    // Return mood counts
    res.json({
      happy,
      sad,
      angry,
      excited,
      neutral,
      surprised
    });
  });
});



app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out." });
    }
    res.status(200).json({ message: "Logout successful!" });
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


