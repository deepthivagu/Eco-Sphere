// import axios from 'axios';
import express from "express";
import bodyParser from "body-parser";
import connectDB from './db.js'; 
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import cors from "cors";
import cookieParser from "cookie-parser";
import householdRouter from "./householdData.js";
import { contactUsRouter } from "./contactus.js";  // Named import

import authRouter from "./Authentication.js";
import businessRouter from "./businessData.js";
import adminRouter from "./adminData.js";
import memorystore from 'memorystore';
import path from "path";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from './models/user.js'; // MongoDB User mode
const MemoryStore = memorystore(session);
const app = express();
const port = process.env.PORT || 3001;


// // Enable CORS
// app.use(
//   cors({
//     origin: "http://localhost:5173", // Replace with your frontend origin
//     credentials: true,
//   })
// );

app.use(cookieParser()); // Add cookie-parser middleware

// // Middleware setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());


// MongoDB connection
connectDB();



passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // Email as the username
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        console.log("Email:", email);
        console.log("Password:", password);

        const user = await User.findOne({ email });

        console.log("Query Result:", user);

        if (!user) {
          console.log("Authentication failed: User not found");
          return done(null, false, { message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
          console.log("Authentication successful:", user);
          return done(null, user);
        } else {
          console.log("Authentication failed: Invalid password");
          return done(null, false, { message: 'Incorrect password' });
        }

      } catch (err) {
        console.error("Error during authentication:", err);
        return done(err);
      }
    }
  )
);
// async function findOrCreateUser(googleId, profile) {
//   try {
 
//     let result = await db.query("SELECT * FROM users WHERE google_id = $1", [googleId]);

//     if (result.rows.length > 0) {
//       return result.rows[0]; // User found
//     } else {
//       const defaultPassword = await bcrypt.hash('defaultpassword', 10); // Generate a hashed default password
//       const newUser = await db.query(
//         "INSERT INTO users (google_id, email, name, password, type, isVerified) VALUES ($1, $2, $3, $4, $5, true) RETURNING *",
//         [googleId, profile.emails[0].value, profile.displayName, defaultPassword, 'user']
//       );
//       return newUser.rows[0]; // New user created
//     }
//   } catch (err) {
//     throw new Error(`Error finding or creating user: ${err.message}`);
//   }
// }


// passport.use(
//   new GoogleStrategy({
//     clientID: process.env.OAUTH_CLIENT_ID,
//     clientSecret: process.env.OAUTH_SECRET,
//     callbackURL: "https://prithwe.onrender.com/auth/google/prithwe",
//     userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
//   },
//   async function(accessToken, refreshToken, profile, cb) {
//     try {
//       const user = await findOrCreateUser(profile.id, profile);
//       return cb(null, user); 
//     } catch (err) {
//       return cb(err);
//     }
//   }
// ));



// // app.get('/auth/google',
// //   passport.authenticate('google', { scope: ['profile', 'email'] }));
// app.get('/auth/google', async (req, res, next) => {
//   const {userType} = req.query;
//   res.cookie('userType', userType) 

//   passport.authenticate('google', {
//     scope: ['profile', 'email'],
//   })(req, res, next);
 
// });


// app.get('/auth/google/prithwe', 
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   async function (req, res) {
//     let result = await db.query("UPDATE users SET type = $1 WHERE email = $2", [req.cookies.userType, req.user.email]);
//     res.clearCookie('userType');
//     res.redirect('https://prithwe.onrender.com'); // Adjust the redirect URL as needed
//   });

// Other routes

app.use(express.json());
app.use("/api/household", householdRouter);
app.use("/api/contact", contactUsRouter);
app.use("/api/auth", authRouter);
app.use("/api/business", businessRouter);
app.use("/api/admin", adminRouter);

app.listen(port, () => console.log("App is listening"));

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "client", "dist")));
//   app.get("*", (_, res) => {
//     res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"));
//   });
// } else {
//   app.get("/", (_, res) => {
//     res.send("App is under development!");
//   });
// }



// const url = `https://prithwe.onrender.com/`; 
// const interval = 800000; // Interval in milliseconds (8min)

// function reloadWebsite() {
//   axios.get(url)
//     .then(response => {
//       console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`);
//     })
//     .catch(error => {
//       console.error(`Error reloading at ${new Date().toISOString()}:`, error.message);
//     });
// }


// setInterval(reloadWebsite, interval);








