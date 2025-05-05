const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const multer = require("multer");
const path = require("path");
const { initializeModels, detectMood } = require("./detectMood.js");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const router = express.Router();

const resetTokens = {}; // { token: email }

const app = express();
const port = process.env.PORT || 3000;

require("dotenv").config();

app.use(express.json());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const session = require("express-session");

// Serve static files from the 'assets' directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files from 'public' folder
// Serve uploaded images (Ensure the uploaded images are served from 'public/uploads')
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/models', express.static(path.join(__dirname, "models"))); // Serve models for Face-api.js

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, 'public/uploads');
      console.log(`Uploading file to: ${uploadDir}`);
      cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
      const filename = Date.now() + path.extname(file.originalname);
      console.log(`File saved as: ${filename}`);
      cb(null, filename);
  }
});
// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Global database connection flag and variable
let databaseConnected = false;
let db = null;

// Database connection function - try to connect but don't crash if it fails
function connectToDatabase() {
  try {
    db = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    db.connect((err) => {
      if (err) {
        console.error("Database connection failed:", err.stack);
        console.log("Running with limited functionality - database features will not work");
        databaseConnected = false;
      } else {
        console.log("Connected to MySQL database!");
        databaseConnected = true;
      }
    });
  } catch (error) {
    console.error("Error setting up database connection:", error);
    console.log("Running with limited functionality - database features will not work");
    databaseConnected = false;
  }
}

// Try to connect to database, but don't exit if it fails
connectToDatabase();

app.use(
  session({
    secret: "your_secret_key", 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set `true` if using HTTPS
  })
);

// Initialize Face-api.js Models
try {
  initializeModels();
  console.log("Face-api.js models initialized successfully");
} catch (error) {
  console.error("Error initializing Face-api.js models:", error);
  console.log("Face recognition features may not work properly");
}

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
  res.sendFile(path.join(__dirname, "public", "emojiSelector.html"));
});

// Helper function to check database connection for API routes
function checkDbConnection(req, res, next) {
  if (!databaseConnected) {
    return res.status(503).json({ 
      message: "Database not available", 
      info: "This feature requires a database connection which is not currently available."
    });
  }
  next();
}

// Save Mood Data Route (POST) - with DB check
app.post("/facialRecognition", checkDbConnection, (req, res) => {
  const { moodName, moodType } = req.body;
  const userId = req.session?.userId || 1;

  // Log request data for debugging
  console.log("Request Data Received:", req.body);

  if (!userId || !moodName || !moodType) {
      return res.status(400).json({ message: "User ID, mood name, and mood type are required." });
  }

  const query = `
    INSERT INTO moodlogs (user_id, type_id, logged_mood, log_date) 
    VALUES (?, (SELECT type_id FROM moodlog_types WHERE type_name = ?), ?, NOW())
  `;
  
  db.query(query, [userId, moodType, moodName], (err, result) => {
    if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ message: "Error saving mood data. Please try again later." });
    }
    res.status(201).json({ message: "Mood data saved successfully!" });
  });
});

// Save Emoji Mood Data Route (POST) - with DB check
app.post("/save-emoji", checkDbConnection, (req, res) => {
  const { moodName, moodType } = req.body;
  const userId = req.session?.userId;

  if (!userId) {
    return res.status(401).json({ message: "User not logged in." });
  }

  console.log("Request Data Received:", req.body);

  if (!moodName || !moodType) {
    console.error("Missing Fields:", req.body);
    return res.status(400).json({ message: "Mood name and mood type are required." });
  }

  const query = `
      INSERT INTO moodlogs (user_id, type_id, logged_mood, log_date) 
      VALUES (?, (SELECT type_id FROM moodlog_types WHERE type_name = ?), ?, NOW())
  `;

  db.query(query, [userId, moodType, moodName], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Error saving emoji mood data. Please try again later." });
    }
    res.status(201).json({ message: "Emoji mood data saved successfully!" });
  });
});

//comment

// Register Route (POST) - with DB check
app.post("/register", checkDbConnection, upload.single("profile_picture"), async (req, res) => {
  console.log("Register request received");

  const { username, password, email, name, surname } = req.body;
  console.log("Received user details:", { username, email, name, surname });

  let profile_picture = null;

  if (req.file) {
      console.log("📸 Profile picture received:", req.file.filename);
      profile_picture = `/uploads/${req.file.filename}`;
  } else if (req.body.avatar_path) {
      console.log("Avatar path received:", req.body.avatar_path);
      profile_picture = req.body.avatar_path;
  }
  // If neither a file nor a pre-selected avatar path exists, profile_picture remains null.

  if (!username || !password || !email) {
      return res.status(400).json({ message: "Username, password, and email are required." });
  }

  try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = `
          INSERT INTO users (username, password, email, name, surname, profile_picture, role) 
          VALUES (?, ?, ?, ?, ?, ?, 'user')
      `;
      db.query(query, [username, hashedPassword, email, name, surname, profile_picture], (err, result) => {
          if (err) {
              if (err.code === "ER_DUP_ENTRY") {
                  res.status(400).json({ message: "Username or email already exists!" });
              } else {
                  console.error("Error during registration:", err);
                  res.status(500).json({ message: "Error during registration. Please try again later." });
              }
          } else {
              res.status(201).json({ message: `User registered successfully! Welcome, ${name}` });
          }
      });
  } catch (error) {
      console.error("Error hashing password:", error);
      res.status(500).json({ message: "Internal server error." });
  }
});



// Login Route (POST) - with DB check
// Login Route (POST) - with DB check
app.post("/login", checkDbConnection, (req, res) => {
  console.log('Login route hit');
  const { username, password } = req.body;

  console.log("Received login request for username:", username);

  if (!username || !password) {
    return res.redirect("/login?error=Username and password are required.");
  }

  const query = "SELECT * FROM users WHERE username = ?";
  console.log('Executing query:', query, 'with username:', username);
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Error during login:", err);
      res.status(500).json({ message: "Error during login. Please try again later." });
    } else if (results.length === 0) {
      console.log('No user found with username:', username); // Log when no user is found
      res.status(401).json({ message: "Invalid username or password." });
    } else {
      const user = results[0];
      console.log('User found:', user);

      // Fallback: Set role to "user" if it is null or undefined
      if (!user.role) {
        console.log(`User ${user.username} has no role set. Defaulting to "user".`);
        user.role = "user";
      }

      try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          // Store user details in the session
          req.session.userId = user.user_id;
          req.session.username = user.username;
          req.session.role = user.role; // Store the user's role in the session
          console.log("Password match successful. Sending userId:", user.user_id);
          console.log('Password match successful for user:', user.username);

          // Update last_login time
          db.query("UPDATE users SET last_login = NOW() WHERE user_id = ?", [user.user_id], (err) => {
            if (err) console.error("Failed to update last_login:", err);
          });

          // Redirect based on role
          if (user.role === "admin") {
            res.status(200).json({ message: "Login successful!", userId: user.user_id, username: user.username, redirectUrl: "/admin" });
          } else {
            res.status(200).json({ message: "Login successful!", userId: user.user_id, username: user.username, redirectUrl: "/home" });
          }
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


// Get Profile - with DB check
app.get("/get-profile", checkDbConnection, (req, res) => {
  const userId = req.query.userId;

  console.log("Received profile request for userId:", userId);
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
      res.json(results[0]);
  });
});

// Update Profile - with DB check
app.post("/update-profile", checkDbConnection, upload.single('profile_picture'), (req, res) => {
  const { userId, name, surname, email, username } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : req.body.profile_picture || null; // Use file or avatar path

  console.log("Received update request for userId:", userId);

  if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
  }

  const query = `
      UPDATE users 
      SET name = ?, surname = ?, email = ?, username = ?, 
          profile_picture = COALESCE(?, profile_picture) 
      WHERE user_id = ?
  `;

  db.query(
      query, 
      [name, surname, email, username, profilePicture, userId], 
      (err, result) => {
          if (err) {
              console.error("Error updating profile:", err);
              return res.status(500).json({ message: "Error updating profile." });
          }

          console.log("Profile updated successfully for userId:", userId);
          res.json({ message: "Profile updated successfully!", redirectUrl: "/dashboard" });
      }
  );
});


// Get Username - with DB check
app.get("/get-username", checkDbConnection, (req, res) => {
  const userId = req.query.userId;

  console.log("Fetching username for userId:", userId);

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

// Get User Profile - with DB check
// Get User Profile - with DB check
app.get("/getUserProfile", checkDbConnection, (req, res) => {
  const userId = req.session?.userId; // Get the userId from the session

  if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
  }

  db.query("SELECT profile_picture FROM users WHERE user_id = ?", [userId], (err, results) => {
      if (err) {
          console.error("Error fetching user profile:", err);
          return res.status(500).json({ message: "Database error fetching user profile." });
      }
      if (results.length > 0) {
          res.json({ profile_picture: results[0].profile_picture });
      } else {
          res.json({ profile_picture: null });
      }
  });
});

// Delete Profile - with DB check
app.delete("/delete-profile", checkDbConnection, (req, res) => {
  const userId = req.body.userId;

  console.log("userId received on server:", userId);

  if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
  }

  const query = "DELETE FROM users WHERE user_id = ?";
  db.query(query, [userId], (err, result) => {
      if (err) {
          console.error("Error deleting profile:", err);
          return res.status(500).json({ message: "Error deleting profile." });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "User not found." });
      }

      res.json({ message: "Profile deleted successfully!" });
  });
});

// Fetch mood data (mood counts) - with DB check
app.get("/ratings", checkDbConnection, (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(403).json({ message: "User not authenticated." });
  }

  const start = req.query.start;
  const end = req.query.end;

  // If no start or end date is provided, default to current month
  const startDate = start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const endDate = end || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

  const countMoodsQuery = `
    SELECT 
      SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'happy' THEN 1 ELSE 0 END) AS happy,
      SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'sad' THEN 1 ELSE 0 END) AS sad,
      SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'angry' THEN 1 ELSE 0 END) AS angry,
      SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'excited' THEN 1 ELSE 0 END) AS excited,
      SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'neutral' THEN 1 ELSE 0 END) AS neutral,
      SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'surprised' THEN 1 ELSE 0 END) AS surprised
    FROM moodlogs
    WHERE user_id = ?
      AND log_date BETWEEN ? AND ?
  `;

  const individualMoodQuery = `
    SELECT 
      log_date AS dateTime, 
      logged_mood AS emotion
    FROM moodlogs
    WHERE user_id = ?
      AND log_date BETWEEN ? AND ?
    ORDER BY log_date DESC
  `;

  db.query(countMoodsQuery, [userId, startDate, `${endDate} 23:59:59`], (err, moodCounts) => {
    if (err) {
      console.error("Error counting moods:", err);
      return res.status(500).json({ message: "An error occurred while counting moods." });
    }

    db.query(individualMoodQuery, [userId, startDate, `${endDate} 23:59:59`], (err, individualMoods) => {
      if (err) {
        console.error("Error fetching individual moods:", err);
        return res.status(500).json({ message: "An error occurred while fetching mood records." });
      }

      res.json({ moodCounts, individualMoods });
    });
  });
});

app.get('/moodlogs/:date', checkDbConnection, async (req, res) => {
  if (!req.session.userId) {
    return res.status(403).json({ message: "User not authenticated." });
  }

  const userId = req.session.userId;
  const date = new Date(req.params.date).toISOString().split('T')[0];

  try {
    const [moodLogs] = await db.promise().query(
      `
      SELECT ml.logged_mood, mlt.type_name, ml.log_date
      FROM moodlogs ml
      JOIN moodlog_types mlt ON ml.type_id = mlt.type_id
      WHERE ml.user_id = ? AND DATE(ml.log_date) = ?
      ORDER BY ml.log_date DESC
      `,
      [userId, date]
    );

    const [moodCounts] = await db.promise().query(
      `
      SELECT 
        SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'happy' THEN 1 ELSE 0 END) AS happy,
        SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'sad' THEN 1 ELSE 0 END) AS sad,
        SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'angry' THEN 1 ELSE 0 END) AS angry,
        SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'excited' THEN 1 ELSE 0 END) AS excited,
        SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'neutral' THEN 1 ELSE 0 END) AS neutral,
        SUM(CASE WHEN LOWER(TRIM(logged_mood)) = 'surprised' THEN 1 ELSE 0 END) AS surprised
      FROM moodlogs
      WHERE user_id = ?
      `,
      [userId]
    );

    const [individualMoods] = await db.promise().query(
      `
      SELECT 
        log_date AS dateTime, 
        logged_mood AS emotion
      FROM moodlogs
      WHERE user_id = ?
      ORDER BY log_date DESC
      `,
      [userId]
    );

    res.json({ moodLogs, moodCounts: moodCounts[0], individualMoods });
  } catch (error) {
    console.error('Error in mood report fetch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Fetch tips - with DB check
app.post("/fetch-tips", checkDbConnection, (req, res) => {
  const userId = req.session?.userId;

  if (!userId) {
      return res.status(401).json({ message: "User not logged in." });
  }

  const query = `
        SELECT tips.tip_text
        FROM moodlogs
        JOIN tips ON moodlogs.logged_mood = tips.mood_name
        WHERE moodlogs.user_id = ?
        ORDER BY moodlogs.log_date DESC
        LIMIT 1
    `;

  db.query(query, [userId], (err, results) => {
      if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ message: "Error fetching tips. Please try again later." });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "No tips found for the logged mood." });
      }

      res.status(200).json({ tip_text: results[0].tip_text });

  });
});

const moodPlaylists = {
  "Happy": "https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC",  // Happy Hits
  "Sad": "https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1",    // Sad Songs
  "Angry": "https://open.spotify.com/playlist/37i9dQZF1DWYxwmBaMqxsl",  // Rage Beats
  "Calm": "https://open.spotify.com/playlist/37i9dQZF1DX3PIPIT6lEg5",   // Calm Vibes
  "Energetic": "https://open.spotify.com/playlist/37i9dQZF1DX8tZsk68tuDw" // Workout Motivation
};

app.post("/send-report", checkDbConnection, async (req, res) => {
  const userId = req.session?.userId; // Get the logged-in user's ID from the session

  if (!userId) {
    return res.status(403).json({ message: "User not authenticated." });
  }

  // Fetch the user's email from the database
  const getEmailQuery = "SELECT email FROM users WHERE user_id = ?";
  db.query(getEmailQuery, [userId], async (err, results) => {
    if (err) {
      console.error("Error fetching user email:", err);
      return res.status(500).json({ message: "Error fetching user email." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const email = results[0].email; // Get the user's email
    const { moods } = req.body;

    if (!moods || moods.length === 0) {
      return res.status(400).json({ message: "Mood data is required." });
    }

    const date = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

    const moodTable = moods
      .map((mood) => {
        const playlistUrl = moodPlaylists[mood.logged_mood] || "https://open.spotify.com";
        return `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${mood.logged_mood}</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${mood.type_name}</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${new Date(mood.log_date).toLocaleString()}</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
              <a href="${playlistUrl}" target="_blank">Playlist</a>
            </td>
          </tr>`;
      })
      .join("");

    const emailContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Your Mood Report</h1>
          <p style="margin: 0;">Date: ${date}</p>
        </div>
        <div style="padding: 20px;">
          <p>Hello,</p>
          <p>Here is your mood report for the selected date:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Mood</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Type</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Logged At</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Playlist</th>
              </tr>
            </thead>
            <tbody>
              ${moodTable}
            </tbody>
          </table>
          <p style="margin-top: 20px;">Thank you for using Moodify!</p>
        </div>
        <div style="background-color: #f9f9f9; color: #555; padding: 10px; text-align: center; font-size: 0.9em;">
          <p style="margin: 0;">Moodify &copy; 2025. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587, // Use 465 for SSL or 587 for TLS
        secure: false, // Set to true if using port 465
        auth: {
          user: process.env.APP_USER, // Your Gmail address
          pass: process.env.APP_PASSWORD, // Your Gmail app password
        },
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates
        },
      });

      const info = await transporter.sendMail({
        from: process.env.APP_USER, // Sender address
        to: "xnhlapo.nhlapo@gmail.com", // Recipient's email
        subject: "Your Mood Report ✔", // Subject line
        html: emailContent, // HTML body
      });

      console.log("Message sent: %s", info.messageId);
      res.status(200).json({ message: "Mood report sent successfully!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send mood report. Please try again later." });
    }
  });
});

// Configure email transporter only if environment variables are available
let transporter = null;
try {
  if (process.env.MAILTRAP_HOST && process.env.MAILTRAP_PORT && process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      }
    });
    console.log("Email transport configured successfully");
  } else {
    console.log("Email configuration not available - email features will not work");
  }
} catch (error) {
  console.error("Error configuring email transport:", error);
}

// Email sending function
async function sendEmail(to, subject, text) {
  if (!transporter) {
    console.log("Email transport not configured - skipping email send");
    return;
  }
  
  try {
    const info = await transporter.sendMail({
      from: `"MoodSync 👋" <${process.env.MAILTRAP_FROM_EMAIL || 'noreply@example.com'}>`,
      to: to,
      subject: subject,
      text: text,
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

const { v4: uuidv4 } = require('uuid'); // for generating unique tokens

// Forgot password - with DB check
app.post('/forgot-password', checkDbConnection, async (req, res) => {
  const { email } = req.body;
  
  db.query("SELECT user_id FROM users WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error querying the database' });
    }
    
    if (!result || result.length === 0) {
      return res.status(404).redirect('/notFound.html');
    }
  
    const userId = result[0].user_id;
    const resetToken = uuidv4();
    const resetLink = `http://localhost:3000/resetPassword.html?token=${resetToken}&userId=${userId}`;
  
    sendEmail(
      email,
      'Password Reset Request',
      `Click the link below to reset your password:\n\n${resetLink}`
    );
  
    res.status(200).redirect('/success.html');
  });
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'resetPassword.html'));
});

// Reset password - with DB check
app.post('/reset-password', checkDbConnection, async (req, res) => {
  const { token, userId } = req.query;
  const { newPassword } = req.body;

  if (!token || !userId || !newPassword) {
    return res.status(400).json({ message: 'Token, user ID, and new password are required.' });
  }

  //Hash the new password

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateQuery = 'UPDATE users SET password = ? WHERE user_id = ?';

    db.query(updateQuery, [hashedPassword, userId], (err, result) => {
      if (err) {
        console.error('Error updating password:', err);
        return res.status(500).json({ message: 'Error updating password.' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found or token is invalid.' });
      }

      res.status(200).redirect('/passwordResetSuccess.html');
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error while resetting password.' });
  }
});
  
app.get("/get-profile", (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const query = "SELECT name, surname, email, username FROM users WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching profile:", err);
      return res.status(500).json({ message: "Error fetching profile." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(results[0]);
  });
});

// Fetch Spotify playlists for mood
app.get('/spotify-results', (req, res) => {
  const mood = req.query.mood;

  if (!mood) {
      return res.status(400).send("Mood query param is required.");
  }

  const sql = 'SELECT * FROM spotify_playlist WHERE mood_name = ?';
  db.query(sql, [mood], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).send("Database error");
      }

      if (results.length === 0) {
          return res.status(404).send("No playlists or podcasts found for this mood.");
      }

      const data = results[0]; // Assuming we get the first match for the mood
      res.json({
          spotifyPlaylist: {
              amapianoLink: data.amapiano_link,
              kwaitoLink: data.kwaito_link,
              globalLink: data.global_link
          },
          podcasts: {
              podcastLink1: data.podcast_link_1,
              podcastLink2: data.podcast_link_2
          }
      });
  });
});

//

app.get('/youtube-results', (req, res) => {
  const mood = req.query.mood;

  if (!mood) {
      return res.status(400).send("Mood query param is required.");
  }

  const sql = 'SELECT * FROM youtube_playlist WHERE mood_name = ?';
  db.query(sql, [mood], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).send("Database error");
      }

      if (results.length === 0) {
          return res.status(404).send("No playlists or podcasts found for this mood.");
      }

      const data = results[0]; // Assuming we get the first match for the mood
      res.json({
          youtubePlaylist: {
              amapianoLink: data.amapiano_link,
              kwaitoLink: data.kwaito_link,
              globalLink: data.global_link
          },
          podcasts: {
              podcastLink1: data.podcast_link_1,
              podcastLink2: data.podcast_link_2
          }
      });
  });
});




// Fetch active users
app.get("/admin/active-users", checkDbConnection, (req, res) => {
  const query = `
      SELECT user_id, name, surname, username, email, last_login 
      FROM users 
      WHERE last_login >= NOW() - INTERVAL 7 DAY
      ORDER BY last_login DESC
  `;
  db.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching active users:", err);
          return res.status(500).json({ message: "Error fetching active users." });
      }
      res.json(results);
  });
});

// Fetch all users
app.get("/admin/registered-users", checkDbConnection, (req, res) => {
  const query = `
  SELECT user_id, name, surname, username, email, registration_date, role
  FROM sql3776573.users 
  ORDER BY user_id ASC 
  `;
  db.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching users:", err);
          return res.status(500).json({ message: "Error fetching users." });
      }
      res.json(results);
  });
});
function checkAdminRole(req, res, next) {
  if (req.session && req.session.role === 'admin') {
    next(); // User is admin — proceed
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
}

app.post("/admin/update-role", checkDbConnection, checkAdminRole, (req, res) => {
  const { userId, newRole } = req.body;

  console.log("Updating role for userId:", userId, "to newRole:", newRole); // Debugging log

  // Validate the new role
  if (!["user", "admin"].includes(newRole)) {
    return res.status(400).json({ message: "Invalid role specified." });
  }

  const query = "UPDATE users SET role = ? WHERE user_id = ?";
  db.query(query, [newRole, userId], (err, result) => {
    if (err) {
      console.error("Error updating user role:", err);
      return res.status(500).json({ message: "Error updating user role." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User role updated successfully!" });
  });
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.post("/validate-email", checkDbConnection, express.json(), (req, res) => {
  const { email } = req.body;

  // Basic input check
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const query = "SELECT email FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error validating email:", err);  // renamed log message
      return res.status(500).json({ error: "Database error during email validation" });
    }

    return res.json({ exists: results.length > 0 });
  });
});

//comment
app.post("/check-email", checkDbConnection, express.json(), (req, res) => {
  const { email } = req.body;

  // Basic input check
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const query = "SELECT email FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error checking email:", err);
      return res.status(500).json({ error: "Database error while checking email" });
    }

    return res.json({ exists: results.length > 0 });
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
