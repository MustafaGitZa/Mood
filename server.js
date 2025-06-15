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
const fs = require("fs");
const https = require('https');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle, TextRun } = require('docx');





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

// SSL options
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

// Serve your app via HTTPS
const server = https.createServer(sslOptions, app);

// Global database connection flag and variable
let databaseConnected = false;
let db = null;

// Database connection function - try to connect but don't crash if it fails
function connectToDatabase() {
  try {
    db = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
       port: process.env.DB_PORT,
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

  console.log("Request Data Received:", req.body);

  if (!userId || !moodName || !moodType) {
    return res.status(400).json({ message: "User ID, mood name, and mood type are required." });
  }

  const query = `
    INSERT INTO moodlog (user_id, type, logged_mood, log_date)
    VALUES (?, ?, ?, NOW())
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
    INSERT INTO moodlog (user_id, type, logged_mood, log_date)
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

//comment

// Register Route (POST) - with DB check
//updated register api cos date of birth is calculated and return as age

// Register Route (POST) - with DB check
app.post("/register", checkDbConnection, upload.single("profile_picture"), async (req, res) => {
  console.log("Register request received");

  const { username, password, email, name, surname, dob } = req.body; // Include dob from the form
  console.log("Received user details:", { username, email, name, surname, dob });

  let profile_picture = null;

  if (req.file) {
    console.log("📸 Profile picture received:", req.file.filename);
    profile_picture = `/uploads/${req.file.filename}`;
  } else if (req.body.avatar_path) {
    console.log("Avatar path received:", req.body.avatar_path);
    profile_picture = req.body.avatar_path;
  }

  // ✅ Calculate age from dob
  let calculatedAge = null;
  if (dob) {
    try {
      const normalizedDOB = dob.replace(/\//g, '-'); // Convert YYYY/MM/DD to YYYY-MM-DD
      const birthDate = new Date(normalizedDOB);
      const today = new Date();
      calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      console.log("Calculated age:", calculatedAge);
    } catch (error) {
      console.error("Invalid DOB format:", dob);
    }
  }

  if (!username || !password || !email) {
    return res.status(400).json({ message: "Username, password, and email are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO user (username, password, email, name, surname, profile_picture, age, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'user')
    `;

    db.query(
      query,
      [username, hashedPassword, email, name, surname, profile_picture, calculatedAge],
      (err, result) => {
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
      }
    );
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});



// Login Route (POST) - with DB check
// Login Route (POST) - with DB check
app.post("/login", checkDbConnection, (req, res) => {
  console.log('Login route hit');
  const { username, password, role } = req.body;


  console.log("Received login request for username:", username);

  if (!username || !password) {
    return res.redirect("/login?error=Username and password are required.");
  }

  const query = "SELECT * FROM user WHERE username = ? AND role = ?";
db.query(query, [username, role], async (err, results) => {
  if (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Error during login. Please try again later." });
  } else if (results.length === 0) {
    res.status(401).json({ message: "Invalid username, password or role." });
  } else {
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.userId = user.user_id;
      req.session.username = user.username;
      req.session.role = user.role;

      // Update last_login
      db.query("UPDATE user SET last_login = NOW() WHERE user_id = ?", [user.user_id]);

      // Redirect based on role
      if (user.role === "admin") {
        res.status(200).json({ message: "Login successful!", userId: user.user_id, username: user.username, redirectUrl: "/admin" });
      } else {
        res.status(200).json({ message: "Login successful!", userId: user.user_id, username: user.username, redirectUrl: "/home" });
      }
    } else {
      res.status(401).json({ message: "Invalid username or password." });
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

  const query = "SELECT username, name, surname, email FROM user WHERE user_id = ?";
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
      UPDATE user
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

  const query = "SELECT username FROM user WHERE user_id = ?";
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

  db.query("SELECT profile_picture FROM user WHERE user_id = ?", [userId], (err, results) => {
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

  const query = "DELETE FROM user WHERE user_id = ?";
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
    FROM moodlog
    WHERE user_id = ?
      AND log_date BETWEEN ? AND ?
  `;

  const individualMoodQuery = `
    SELECT 
      log_date AS dateTime, 
      logged_mood AS emotion
    FROM moodlog
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
      SELECT logged_mood, type, log_date
      FROM moodlog
      WHERE user_id = 1 AND DATE(log_date) = '2025-06-15'
      ORDER BY log_date DESC

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
      FROM moodlog
      WHERE user_id = ?
      `,
      [userId]
    );

    const [individualMoods] = await db.promise().query(
      `
      SELECT 
        log_date AS dateTime, 
        logged_mood AS emotion
      FROM moodlog
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

app.post("/send-report", checkDbConnection, async (req, res) => {
  const userId = req.session?.userId;

  if (!userId) {
    return res.status(403).json({ message: "User not authenticated." });
  }

  const getEmailQuery = "SELECT email FROM user WHERE user_id = ?";
  db.query(getEmailQuery, [userId], async (err, results) => {
    if (err) {
      console.error("Error fetching user email:", err);
      return res.status(500).json({ message: "Error fetching user email." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const email = results[0].email;
    const { moods } = req.body;

    if (!moods || moods.length === 0) {
      return res.status(400).json({ message: "Mood data is required." });
    }

    const date = new Date().toISOString().split("T")[0];

    // Async function to fetch playlist links for a mood
    const getPlaylistLinks = (moodName) => {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            s.amapiano_link AS spotify_amapiano, s.kwaito_link AS spotify_kwaito, s.global_link AS spotify_global,
            y.amapiano_link AS youtube_amapiano, y.kwaito_link AS youtube_kwaito, y.global_link AS youtube_global
          FROM spotify_playlist s
          LEFT JOIN youtube_playlist y ON s.mood_name = y.mood_name
          WHERE s.mood_name = ?
        `;
        db.query(query, [moodName], (err, results) => {
          if (err) {
            return reject(err);
          }
          if (results.length === 0) {
            // Default links if no match found
            return resolve({
              spotify_amapiano: "https://open.spotify.com",
              spotify_kwaito: "https://open.spotify.com",
              spotify_global: "https://open.spotify.com",
              youtube_amapiano: "https://youtube.com",
              youtube_kwaito: "https://youtube.com",
              youtube_global: "https://youtube.com",
            });
          }
          resolve(results[0]);
        });
      });
    };

    // Build moodTable with dynamic playlists
    const moodTablePromises = moods.map(async (mood) => {
      const links = await getPlaylistLinks(mood.logged_mood);

      return `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${mood.logged_mood}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${mood.type_name}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${new Date(mood.log_date).toLocaleString()}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
            <a href="${links.spotify_global}" target="_blank">Spotify Global</a><br/>
            <a href="${links.youtube_global}" target="_blank">YouTube Global</a>
          </td>
        </tr>`;
    });

    try {
      const moodTable = (await Promise.all(moodTablePromises)).join("");

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
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Playlists</th>
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

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.APP_USER,
          pass: process.env.APP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.APP_USER,
        to: email,
        subject: "Your Mood Report ✔",
        html: emailContent,
      });

      console.log("Message sent: %s", info.messageId);
      res.status(200).json({ message: "Mood report sent successfully!" });

    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send mood report. Please try again later." });
    }
  });
});




let transporter = null;

try {
  if (process.env.MAILTRAP_HOST && process.env.MAILTRAP_PORT && process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
    // Mailtrap config (for dev/testing)
    transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      }
    });
    console.log("Mailtrap email transport configured successfully");

  } else if (process.env.APP_USER && process.env.APP_PASSWORD) {
    // Gmail config (for live use)
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587, // Use 465 for SSL or 587 for TLS
      secure: false, // true for 465
      auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // allow self-signed certificates
      },
    });
    console.log("✅ Gmail email transport configured successfully");

  } else {
    console.log("⚠️ No email configuration found - emails will not send.");
  }
} catch (error) {
  console.error("❌ Error configuring email transport:", error);
}


// General email sending function
async function sendEmail(to, subject, emailContent) {
  if (!transporter) {
    console.log("⚠️ Email transport not configured - skipping email send");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"MoodSync 💙" <${process.env.APP_USER || 'noreply@moodsync.com'}>`,
      to: to,
      subject: subject,
      html: emailContent,
    });

    console.log('✅ Email sent: %s', info.messageId);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

module.exports = { sendEmail };


const { v4: uuidv4 } = require('uuid'); // for generating unique tokens

// Forgot password - with DB check
app.post('/forgot-password', checkDbConnection, async (req, res) => {
  const { email } = req.body;
  
  db.query("SELECT user_id FROM user WHERE email = ?", [email], (err, result) => {
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
    const updateQuery = 'UPDATE user SET password = ? WHERE user_id = ?';

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

  const query = "SELECT name, surname, email, username FROM user WHERE user_id = ?";
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


app.post("/validate-email", checkDbConnection, express.json(), (req, res) => {
  const { email, userId } = req.body;

  // Basic input check
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Modified query to exclude current user's email from duplication check
  const query = "SELECT user_id FROM user WHERE email = ? AND user_id != ?";
  db.query(query, [email, userId], (err, results) => {
    if (err) {
      console.error("Error validating email:", err);
      return res.status(500).json({ error: "Database error during email validation" });
    }

    return res.json({ exists: results.length > 0 });
  });
});

//comment
app.post("/check-email", checkDbConnection, express.json(), (req, res) => {
  const { email } = req.body;

  // Basic input check
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const query = "SELECT email FROM user WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error checking email:", err);
      return res.status(500).json({ error: "Database error while checking email" });
    }

    return res.json({ exists: results.length > 0 });
  });
});

// Route: EBooks
app.get('/ebook-results', (req, res) => {
  const mood = req.query.mood;
  const type = req.query.type;

  const query = 'SELECT googlebook_link_1, googlebook_link_2 FROM mood_ebook_audio WHERE mood_name = ? AND book_type = ?';
  db.execute(query, [mood, type], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'No ebooks found for this mood and type.' });

    res.json({
      googlebookLinks: [results[0].googlebook_link_1, results[0].googlebook_link_2]
    });
  });
});


// Route: Audiobooks
app.get('/audiobook-results', (req, res) => {
  const mood = req.query.mood;
  const type = req.query.type;

  const query = 'SELECT audiobook_link_1, audiobook_link_2 FROM mood_ebook_audio WHERE mood_name = ? AND book_type = ?';
  db.execute(query, [mood, type], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'No audiobooks found for this mood and type.' });

    res.json({
      audiobookLinks: [results[0].audiobook_link_1, results[0].audiobook_link_2]
    });
  });
});



// Route to send badge email
app.post("/send-badge", async (req, res) =>{
  const { email } = req.body;

  const emailContent = `
    <h2>🏅 Congrats, Mood Champion!</h2>
    <p>You've completed all your activities! Here's your badge:</p>
    <img src="https://img.icons8.com/external-flat-icons-inmotus-design/67/null/external-badge-gamification-flat-icons-inmotus-design.png" alt="Mood Champion Badge" width="120"/>
    <p>Keep shining 🌟</p>
  `;

  try {
    await sendEmail(email, "🎉 Your Mood Champion Badge!", emailContent);
    res.status(200).json({ message: "🏅 Badge sent to your inbox!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to send badge email." });
  }
});


// Fetch active users
app.get("/admin/active-users", checkDbConnection, (req, res) => {
  const query = `
      SELECT user_id, name, surname, username, email, last_login 
      FROM user
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
  FROM user
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

app.post("/admin/update-role", checkDbConnection, checkAdminRole, (req, res) => {
  const { userId, newRole } = req.body;

  console.log("Updating role for userId:", userId, "to newRole:", newRole); // Debugging log

  // Validate the new role
  if (!["user", "admin"].includes(newRole)) {
    return res.status(400).json({ message: "Invalid role specified." });
  }

  const query = "UPDATE user SET role = ? WHERE user_id = ?";
  db.query(query, [newRole, userId], (err, result) => {
    if (err) {
      console.error("Error updating user role:", err);
      return res.status(500).json({ message: "Error updating user role." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

       // If the role is changed to "admin", insert the user into the `admin` table
       if (newRole === "admin") {
        const insertAdminQuery = `
          INSERT INTO admin (name, surname, username, email, password, registration_date)
          SELECT name, surname, username, email, password, registration_date
          FROM user
          WHERE user_id = ?
          ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            surname = VALUES(surname), 
            email = VALUES(email), 
            password = VALUES(password), 
            registration_date = VALUES(registration_date)
        `;
        db.query(insertAdminQuery, [userId], (err) => {
          if (err) {
            console.error("Error adding user to admin table:", err);
            return res.status(500).json({ message: "Error adding user to admin table." });
          }
          console.log("User added to admin table successfully.");
        });
      } 

        // If the role is changed to "user", remove the user from the `admin` table
      if (newRole === "user") {
        const deleteAdminQuery = "DELETE FROM admin WHERE username = (SELECT username FROM user WHERE user_id = ?)";
        db.query(deleteAdminQuery, [userId], (err) => {
          if (err) {
            console.error("Error removing user from admin table:", err);
            return res.status(500).json({ message: "Error removing user from admin table." });
          }
          console.log("User removed from admin table successfully.");
        });
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

app.get("/spotify-page", (req, res) => {
  res.sendFile(path.join(__dirname, "public" ,"spotify-page.html"));
});

// Replace both /spotify-results and /youtube-results with this single endpoint
app.get('/music-recommendations', (req, res) => {
  const { platform, mood, genre } = req.query;

  // Validate required parameters
  if (!platform || !mood) {
    return res.status(400).json({ 
      error: "Platform and mood parameters are required",
      valid_platforms: ["spotify", "youtube"]
    });
  }

  // Build the query
  let sql = `
    SELECT * FROM mood_playlist
    WHERE platform = ? 
    AND mood_name = ?
  `;
  const params = [platform, mood];

  // Add genre filter if provided
  if (genre) {
    sql += ' AND genre = ?';
    params.push(genre);
  }

  // Execute query
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        error: "No recommendations found",
        suggestion: "Try a different mood or genre combination"
      });
    }

    // Format response
    const response = {
      platform,
      mood,
      recommendations: results.map(item => ({
        genre: item.genre,
        playlistLink: item.playlist_link,
        podcasts: [item.podcast_link_1, item.podcast_link_2].filter(Boolean)
      }))
    };

    res.json(response);
  });
});

function checkAdminRole(req, res, next) {
  if (!req.session || req.session.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden. Admins only." });
  }
  next();
}




// Fetch all playlists (replaces both /admin/spotify-playlists and /admin/youtube-playlists)
// Fetch all playlists
app.get('/admin/playlists', (req, res) => {
  const { platform } = req.query; // Optional platform filter
  
  let sql = `
    SELECT 
      id, platform, mood_name, genre, playlist_link, podcast_link_1, podcast_link_2
    FROM mood_playlist
  `;
  
  const params = [];
  
  if (platform) {
    sql += ' WHERE platform = ?';
    params.push(platform);
  }
  
  sql += ' ORDER BY mood_name, genre';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Database error");
    }
    
    // Transform to grouped by mood and genre format
    const grouped = results.reduce((acc, curr) => {
      if (!acc[curr.mood_name]) {
        acc[curr.mood_name] = {
          mood_name: curr.mood_name,
          genres: {}
        };
      }
      
      if (!acc[curr.mood_name].genres[curr.genre]) {
        acc[curr.mood_name].genres[curr.genre] = {
          genre: curr.genre,
          items: []
        };
      }
      
      acc[curr.mood_name].genres[curr.genre].items.push({
        id: curr.id,
        playlist_link: curr.playlist_link,
        podcasts: [curr.podcast_link_1, curr.podcast_link_2].filter(Boolean)
      });
      
      return acc;
    }, {});
    
    // Convert to array format expected by frontend
    const response = Object.values(grouped).map(mood => ({
      mood_name: mood.mood_name,
      genres: Object.values(mood.genres)
    }));
    
    res.json(response);
  });
});

// Update a playlist
// Update a playlist (now works for all platforms/genres)
app.post('/admin/playlists/update', (req, res) => {
  const { 
    id, 
    mood_name, 
    genre, 
    playlist_link, 
    podcast_link_1, 
    podcast_link_2 
  } = req.body;

  const sql = `
    UPDATE mood_playlist
    SET 
      mood_name = ?,
      genre = ?,
      playlist_link = ?,
      podcast_link_1 = ?,
      podcast_link_2 = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.query(sql, 
    [mood_name, genre, playlist_link, podcast_link_1, podcast_link_2, id], 
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Database error");
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).send("Playlist not found");
      }
      
      res.send("Playlist updated successfully");
  });
});

app.get('/admin/ebook-recommendations', (req, res) => {
  const { mood, book_type } = req.query;

  let sql = `SELECT * FROM mood_ebook_audio WHERE 1=1`;
  const params = [];

  if (mood) {
    sql += ' AND mood_name = ?';
    params.push(mood);
  }

  if (book_type) {
    sql += ' AND book_type = ?';
    params.push(book_type);
  }

  sql += ' ORDER BY mood_name, book_type';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: "No recommendations found",
        suggestion: "Try a different mood or book type combination"
      });
    }

    // Format response
    const response = results.map(item => ({
      id: item.id,
      mood_name: item.mood_name,
      book_type: item.book_type,
      googlebook_links: [item.googlebook_link_1, item.googlebook_link_2].filter(Boolean),
      audiobook_links: [item.audiobook_link_1, item.audiobook_link_2].filter(Boolean)
    }));

    res.json(response);
  });
});


app.post('/admin/ebook-recommendations/update', (req, res) => {
  const {
    id,
    mood_name,
    book_type,
    googlebook_link_1,
    googlebook_link_2,
    audiobook_link_1,
    audiobook_link_2
  } = req.body;

  const sql = `
    UPDATE mood_ebook_audio
    SET 
      mood_name = ?,
      book_type = ?,
      googlebook_link_1 = ?,
      googlebook_link_2 = ?,
      audiobook_link_1 = ?,
      audiobook_link_2 = ?
    WHERE id = ?
  `;

  db.query(sql, 
    [mood_name, book_type, googlebook_link_1, googlebook_link_2, audiobook_link_1, audiobook_link_2, id],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Database error");
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("Ebook recommendation not found");
      }

      res.send("Ebook recommendation updated successfully");
  });
});



// Route to get the logged-in user's role
app.get('/api/user-role', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "User not logged in." });
  }

  const userId = req.session.userId;

  const query = "SELECT role FROM user WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user role:", err);
      return res.status(500).json({ message: "Error fetching user role." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ role: results[0].role });
  });
});

app.get('/admin/user-report/:userId', checkDbConnection, (req, res) => {
  const userId = req.params.userId;

  const query = `
      SELECT name, surname, username, email, last_login
      FROM user
      WHERE user_id = ?
  `;

  const moodQuery = `
      SELECT logged_mood, log_date
      FROM moodlogs
      WHERE user_id = ?
      ORDER BY log_date DESC
  `;

  db.query(query, [userId], (err, userResults) => {
      if (err) {
          console.error('Error fetching user report:', err);
          return res.status(500).json({ message: 'Error fetching user report' });
      }

      if (userResults.length === 0) {
          return res.status(404).json({ message: 'User not found' });
      }

      const user = userResults[0];

      db.query(moodQuery, [userId], (err, moodResults) => {
          if (err) {
              console.error('Error fetching user moods:', err);
              return res.status(500).json({ message: 'Error fetching user moods' });
          }

          res.json({ ...user, moods: moodResults });
      });
  });
});

app.use('/admin', checkAdminRole);

// Fetch all books
app.get('/admin/books', checkDbConnection, (req, res) => {
  const query = 'SELECT * FROM mood_ebook_audio';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching books:', err);
          return res.status(500).json({ message: 'Error fetching books' });
      }
      res.json(results);
  });
});

// Add a new book
app.post('/admin/books', checkDbConnection, (req, res) => {
  const { mood_name, googlebook_link_1, googlebook_link_2, audiobook_link_1, audiobook_link_2 } = req.body;
  const query = `
      INSERT INTO mood_ebook_audio (mood_name, googlebook_link_1, googlebook_link_2, audiobook_link_1, audiobook_link_2)
      VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [mood_name, googlebook_link_1, googlebook_link_2, audiobook_link_1, audiobook_link_2], (err) => {
      if (err) {
          console.error('Error adding book:', err);
          return res.status(500).json({ message: 'Error adding book' });
      }
      res.status(201).json({ message: 'Book added successfully!' });
  });
});

// Update a book
app.put('/admin/books/:id', checkDbConnection, (req, res) => {
  const bookId = req.params.id;
  const { mood_name, googlebook_link_1, googlebook_link_2, audiobook_link_1, audiobook_link_2 } = req.body;
  const query = `
      UPDATE mood_ebook_audio
      SET googlebook_link_1 = ?, googlebook_link_2 = ?, audiobook_link_1 = ?, audiobook_link_2 = ?
      WHERE id = ?
  `;
  db.query(query, [mood_name, googlebook_link_1, googlebook_link_2, audiobook_link_1, audiobook_link_2, bookId], (err) => {
      if (err) {
          console.error('Error updating book:', err);
          return res.status(500).json({ message: 'Error updating book' });
      }
      res.json({ message: 'Book updated successfully!' });
  });
});


// Fetch admin details
app.get('/admin/admin-details', (req, res) => {
  const sql = `
      SELECT name, surname, username, email, registration_date
      FROM admin
  `;
  db.query(sql, (err, results) => {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Database error');
      }
      res.json(results);
  });
});

//search by mood api

app.post("/search-mood", checkDbConnection, (req, res) => {
  const userId = req.session?.userId;
  const { mood } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (!mood || typeof mood !== "string") {
    return res.status(400).json({ message: "Mood type is required." });
  }

  const moodSearch = `%${mood}%`;

  const query = `
    SELECT logged_mood, log_date
    FROM moodlog
    WHERE user_id = ? AND logged_mood LIKE ?
    ORDER BY log_date DESC
  `;

  db.query(query, [userId, moodSearch], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error retrieving moods." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No moods found matching that type." });
    }

    res.status(200).json(results);
  });
});

//journal paste both 1


const moment = require('moment-timezone');

app.post('/journal', async (req, res) => {
  const { mood, entry } = req.body;
  const userId = req.session.userId || 1; // Replace with actual session or logic

  // Get South African time
  const saTime = moment().tz('Africa/Johannesburg').format('YYYY-MM-DD HH:mm:ss');

  try {
    await db.execute(
      'INSERT INTO journal_entry (user_id, mood, entry, created_at) VALUES (?, ?, ?, ?)',
      [userId, mood, entry, saTime]
    );
    res.json({ message: 'Journal entry saved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save entry.' });
  }
});

//journal paste both 2


app.get('/journal', (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    const query = `SELECT mood, entry, created_at FROM journal_entry WHERE user_id = ? ORDER BY created_at DESC`;
    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching entries' });
        }
        res.json({ entries: results });
    });
});


app.get("/check-mood-health", checkDbConnection, (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(403).json({ message: "User not authenticated." });
  }

  const negativeMoods = ['sad', 'angry'];
  const threshold = 5;

  // Generate placeholders for the IN clause
  const placeholders = negativeMoods.map(() => '?').join(', ');

  const moodCheckQuery = `
    SELECT COUNT(*) AS negativeCount
    FROM moodlog
    WHERE user_id = ?
      AND LOWER(TRIM(logged_mood)) IN (${placeholders})
  `;

  const queryParams = [userId, ...negativeMoods];

  db.query(moodCheckQuery, queryParams, (err, results) => {
    if (err) {
      console.error("Error checking mood health:", err);
      return res.status(500).json({ message: "Error checking mood health." });
    }

    const negativeCount = results[0].negativeCount;

    res.json({
      shouldShowModal: negativeCount >= threshold,
      count: negativeCount,
      threshold
    });
  });
});




app.get('/todays-genres', (req, res) => {
  const sql = `
    SELECT DISTINCT genre FROM mood_playlist 
    WHERE genre IS NOT NULL
    ORDER BY RAND() 
    LIMIT 5
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    const genres = results.map(row => row.genre);
    res.json({ genres });
  });
});

// get playlists for a specific genre
app.get('/playlists-for-genre', (req, res) => {
  const genre = req.query.genre;
  if (!genre) {
    return res.status(400).json({ error: "Genre query parameter is required" });
  }

  const sql = `
    SELECT playlist_link, platform, mood_name
    FROM mood_playlist 
    WHERE genre = ?
    ORDER BY RAND()
    LIMIT 10
  `;

  db.query(sql, [genre], (err, results) => {
    if (err) {
      console.error("Database error fetching playlists:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Format results if needed (e.g., rename playlist_link to playlist_url)
    const playlists = results.map(row => ({
  url: row.playlist_link,
  platform: row.platform,
  mood_name: row.mood_name
}));


    res.json({ playlists });
  });
});


app.get('/recommended-reads', (req, res) => {
  const moods = ['Happy', 'Sad', 'Angry', 'Relaxed', 'Inspired', 'Focused'];
  const randomMood = moods[Math.floor(Math.random() * moods.length)];

  const sql = `
    SELECT * FROM mood_ebook_audio
    WHERE mood_name = ?
    ORDER BY RAND()
    LIMIT 5
  `;

  db.query(sql, [randomMood], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const recommendations = results.map(row => ({
      mood: row.mood_name,
      bookType: row.book_type,
      googleBooks: [row.googlebook_link_1, row.googlebook_link_2].filter(Boolean),
      audiobooks: [row.audiobook_link_1, row.audiobook_link_2].filter(Boolean)
    }));

    res.json({ recommendations });
  });
});

app.get('/api/mood-trends', (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: no user session" });
  }

  const sql = `
    SELECT 
      logged_mood, 
      DATE(log_date) AS day, 
      COUNT(*) AS count
    FROM moodlog
    WHERE user_id = ?
      AND log_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY logged_mood, day
    ORDER BY day ASC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Database error fetching mood trends:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ trends: results });
  });
});

app.get("/mood-posts", (req, res) => {
  const query = `
    SELECT mood_post.*, user.username 
    FROM mood_post 
    INNER JOIN user ON mood_post.user_id = user.user_id
    ORDER BY post_date DESC
    LIMIT 5
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching mood posts:", err);
      return res.status(500).json({ message: "Failed to fetch posts" });
    }
    res.json(results);
  });
});



app.post("/mood-posts", checkDbConnection, (req, res) => {
  const { userId, mood, content, isAnonymous } = req.body;

  if (!userId || !mood || !content) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  const query = "INSERT INTO mood_post (user_id, mood, content, is_anonymous) VALUES (?, ?, ?, ?)";
  db.query(query, [userId, mood, content, isAnonymous], (err, result) => {
    if (err) {
      console.error("Failed to insert mood post:", err);
      return res.status(500).json({ success: false, message: "Failed to save post." });
    }

    res.json({ success: true, message: "Post created." });
  });
});

app.delete('/mood-posts/:postId', (req, res) => {
  const postId = req.params.postId;

  const deleteQuery = 'DELETE FROM mood_post WHERE post_id = ?';

  db.query(deleteQuery, [postId], (err, result) => {
    if (err) {
      console.error('Failed to delete post:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete post.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    res.json({ success: true, message: 'Post deleted successfully.' });
  });
});


app.post('/mood-posts/:id/like', (req, res) => {
  const postId = parseInt(req.params.id);
  const { userId } = req.body;

  const getLikesQuery = `SELECT likes FROM mood_post WHERE post_id = ?`;
  db.query(getLikesQuery, [postId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error fetching post' });

    if (results.length === 0) return res.status(404).json({ success: false, message: 'Post not found' });

    let likes = JSON.parse(results[0].likes || '[]');

    if (likes.includes(userId)) {
      return res.json({ success: false, message: 'Already liked' });
    }

    likes.push(userId);

    const updateQuery = `UPDATE mood_post SET likes = ? WHERE post_id = ?`;
    db.query(updateQuery, [JSON.stringify(likes), postId], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error updating likes' });
      res.json({ success: true, like_count: likes.length });
    });
  });
});


app.post('/mood-posts/:id/repost', (req, res) => {
  const postId = parseInt(req.params.id);
  const { userId } = req.body;

  const getRepostsQuery = `SELECT reposts FROM mood_post WHERE post_id = ?`;
  db.query(getRepostsQuery, [postId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error fetching post' });

    if (results.length === 0) return res.status(404).json({ success: false, message: 'Post not found' });

    let reposts = JSON.parse(results[0].reposts || '[]');

    if (reposts.includes(userId)) {
      return res.json({ success: false, message: 'Already reposted' });
    }

    reposts.push(userId);

    const updateQuery = `UPDATE mood_post SET reposts = ? WHERE post_id = ?`;
    db.query(updateQuery, [JSON.stringify(reposts), postId], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error updating reposts' });
      res.json({ success: true, repost_count: reposts.length });
    });
  });
});


app.post('/mood-posts/:id/comment', (req, res) => {
  const postId = parseInt(req.params.id);
  const { userId, text } = req.body;

  const getCommentsQuery = `SELECT comments FROM mood_post WHERE post_id = ?`;
  db.query(getCommentsQuery, [postId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error fetching post' });

    if (results.length === 0) return res.status(404).json({ success: false, message: 'Post not found' });

    let comments = JSON.parse(results[0].comments || '[]');

    const newComment = {
      userId,
      text,
      timestamp: new Date().toISOString()
    };

    comments.push(newComment);

    const updateQuery = `UPDATE mood_post SET comments = ? WHERE post_id = ?`;
    db.query(updateQuery, [JSON.stringify(comments), postId], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error updating comments' });
      res.json({ success: true, comments_count: comments.length });
    });
  });
});



app.get('/admin/export-user-report/:userId/excel', checkDbConnection, (req, res) => {
  const userId = req.params.userId;

  const query = `SELECT name, surname, username, email, last_login FROM user WHERE user_id = ?`;
  const moodQuery = `SELECT logged_mood, log_date FROM moodlog WHERE user_id = ? ORDER BY log_date DESC`;

  db.query(query, [userId], (err, userResults) => {
    if (err) return res.status(500).send('Error fetching data');

    const user = userResults[0];
    db.query(moodQuery, [userId], async (err, moodResults) => {
      if (err) return res.status(500).send('Error fetching moods');

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('User Report');

      // Header row
      const headerRow = sheet.addRow(['Name', 'Surname', 'Username', 'Email', 'Last Login']);
      headerRow.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DF3952' } };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      });

      // User data row
      const userRow = sheet.addRow([user.name, user.surname, user.username, user.email, user.last_login]);
      userRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9F9F9' } };
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      });

      // Space then Mood Logs header
      sheet.addRow([]);
      const moodHeader = sheet.addRow(['Logged Mood', 'Date']);
      moodHeader.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DF3952' } };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      });

      // Mood log rows
      moodResults.forEach((mood, index) => {
        const row = sheet.addRow([mood.logged_mood, mood.log_date]);
        row.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: (index % 2 === 0) ? 'F9F9F9' : 'FFFFFF' } };
          cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="user-report-${userId}.xlsx"`);

      await workbook.xlsx.write(res);
      res.end();
    });
  });
});

const PDFDocument = require('pdfkit');

app.get('/admin/export-user-report/:userId/pdf', checkDbConnection, (req, res) => {
  const userId = req.params.userId;

  const query = `SELECT name, surname, username, email, last_login FROM user WHERE user_id = ?`;
  const moodQuery = `SELECT logged_mood, log_date FROM moodlog WHERE user_id = ? ORDER BY log_date DESC`;

  db.query(query, [userId], (err, userResults) => {
    if (err) return res.status(500).send('Error fetching data');

    const user = userResults[0];
    db.query(moodQuery, [userId], (err, moodResults) => {
      if (err) return res.status(500).send('Error fetching moods');

      const doc = new PDFDocument({ margin: 30 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="user-report-${userId}.pdf"`);

      doc.pipe(res);

      doc.fontSize(18).text('User Report', { align: 'center' });
      doc.moveDown();

      // User Info Table header style
      const headerBgColor = '#df3952';
      const altRowColor = '#f9f9f9';

      const tableX = doc.x;
      const tableY = doc.y;
      const colWidths = [80, 80, 80, 140, 100];

      // Draw User Info header
      doc.rect(tableX, tableY, colWidths.reduce((a, b) => a + b), 20).fill(headerBgColor);
      doc.fillColor('white').fontSize(10);
      let x = tableX;
      ['Name', 'Surname', 'Username', 'Email', 'Last Login'].forEach((header, i) => {
        doc.text(header, x + 4, tableY + 5, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      // Draw User Info row
      doc.fillColor('black').fontSize(9);
      doc.rect(tableX, tableY + 20, colWidths.reduce((a, b) => a + b), 20).fill(altRowColor);
      x = tableX;
      [user.name, user.surname, user.username, user.email, user.last_login].forEach((value, i) => {
        doc.text(String(value), x + 4, tableY + 25, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      let currentY = tableY + 45;

      // Mood Logs Table Header
      doc.moveDown().moveDown(0.5);
      doc.fillColor('black').fontSize(14).text('Mood Logs', { align: 'left' });
      currentY += 30;

      // Mood Logs Header Row
      doc.rect(tableX, currentY, 220, 20).fill(headerBgColor);
      doc.fillColor('white').fontSize(10);
      doc.text('Logged Mood', tableX + 4, currentY + 5, { width: 110, align: 'left' });
      doc.text('Date', tableX + 114, currentY + 5, { width: 106, align: 'left' });

      currentY += 20;

      // Mood Logs Data Rows
      moodResults.forEach((m, index) => {
        const rowColor = (index % 2 === 0) ? altRowColor : 'white';
        doc.rect(tableX, currentY, 220, 20).fill(rowColor);
        doc.fillColor('black').fontSize(9);
        doc.text(m.logged_mood, tableX + 4, currentY + 5, { width: 110, align: 'left' });
        doc.text(m.log_date, tableX + 114, currentY + 5, { width: 106, align: 'left' });
        currentY += 20;
      });

      doc.end();
    });
  });
});


app.get('/admin/export-user-report/:userId/word', checkDbConnection, (req, res) => {
  const userId = req.params.userId;

  const query = `SELECT name, surname, username, email, last_login FROM user WHERE user_id = ?`;
  const moodQuery = `SELECT logged_mood, log_date FROM moodlog WHERE user_id = ? ORDER BY log_date DESC`;

  db.query(query, [userId], (err, userResults) => {
    if (err) return res.status(500).send('Error fetching data');

    const user = userResults[0];
    db.query(moodQuery, [userId], async (err, moodResults) => {
      if (err) return res.status(500).send('Error fetching moods');

      const userTable = new Table({
        rows: [
          new TableRow({
            children: ['Name', 'Surname', 'Username', 'Email', 'Last Login'].map(text =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text, color: 'FFFFFF', bold: true })] })],
                shading: { fill: 'DF3952' },
              })
            ),
          }),
          new TableRow({
            children: [user.name, user.surname, user.username, user.email, user.last_login].map(text =>
              new TableCell({
                children: [new Paragraph(String(text))],
                shading: { fill: 'F9F9F9' },
              })
            ),
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 },
        },
      });

      const moodTable = new Table({
        rows: [
          new TableRow({
            children: ['Logged Mood', 'Date'].map(text =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text, color: 'FFFFFF', bold: true })] })],
                shading: { fill: 'DF3952' },
              })
            ),
          }),
          ...moodResults.map((mood, index) =>
            new TableRow({
              children: [mood.logged_mood, mood.log_date].map(text =>
                new TableCell({
                  children: [new Paragraph(String(text))],
                  shading: { fill: (index % 2 === 0) ? 'F9F9F9' : 'FFFFFF' },
                })
              ),
            })
          ),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 },
        },
      });

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: 'User Report', heading: 'Title' }),
            new Paragraph(''),
            userTable,
            new Paragraph(''),
            new Paragraph({ text: 'Mood Logs', heading: 'Heading1' }),
            new Paragraph(''),
            moodTable,
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="user-report-${userId}.docx"`);

      res.send(buffer);
    });
  });
});

// Submit contact form
app.post('/api/contact', (req, res) => {
  const userId = req.session.userId;
  const { subject, message } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: no active session" });
  }

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  const sql = `INSERT INTO contact_messages (user_id, subject, message) VALUES (?, ?, ?)`;
  db.query(sql, [userId, subject, message], (err, result) => {
    if (err) {
      console.error("Database error adding contact message:", err);
      return res.status(500).json({ error: "Failed to submit message." });
    }

    res.json({ message: "Your message has been sent successfully!" });
  });
});

// Fetch all contact messages (for admin)
app.get('/api/contact-messages', (req, res) => {
  const userId = req.session.userId;
  const userRole = req.session.role;

  if (!userId || userRole !== 'admin') {
    return res.status(403).json({ error: "Forbidden: admin only" });
  }

  const sql = `
    SELECT 
      cm.message_id, u.name, u.email, cm.subject, cm.message, cm.sent_at
    FROM contact_messages cm
    JOIN user u ON cm.user_id = u.user_id
    ORDER BY cm.sent_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error fetching contact messages:", err);
      return res.status(500).json({ error: "Failed to fetch messages." });
    }

    res.json({ messages: results });
  });
});

const PORT = process.env.PORT || 3000;

server.listen(3000, () => {
  console.log('Secure server running at https://localhost:3000');
});