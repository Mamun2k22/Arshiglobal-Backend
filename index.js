// index.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import passport from "passport";
import fs from "fs";
import { UPLOAD_DIR } from "./config/paths.js";


import "./middleware/passport.js";
import "./db/database.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
// import contactRoutes from "./routes/contactRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import siteSettingRoutes from "./routes/siteSettingRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminStatsRoutes from "./routes/adminStatsRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";





dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
// uploads dir ensure (এক জায়গায়)
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
};

// production trust proxy
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://arshiglobal.com",
  "http://www.arshiglobal.com",
  "https://arshiglobal.com",
  "https://www.arshiglobal.com",
  "https://arshiglobal-frontend.vercel.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
// parsers
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
// session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_me",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);
// passport
app.use(passport.initialize());
app.use(passport.session());

// static: serve uploads (শেয়ার্ড পাথ)
app.use("/uploads", express.static(UPLOAD_DIR, { etag: true, maxAge: "7d" }));

// health
app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.get("/readyz", (_req, res) => res.status(200).json({ up: true }));

// tiny cache
app.use((req, res, next) => {
  if (req.method === "GET" && req.path.startsWith("/api/products")) {
    res.set("Cache-Control", "private, max-age=30");
  }
  next();
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/faqs", faqRoutes);
// app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/site-settings", siteSettingRoutes);
app.use("/api", contactRoutes);
app.use("/api", adminStatsRoutes);
app.use("/api", applicationRoutes);



// root
app.get("/", (_req, res) => res.send("Arshiglobal.com Server Is Running Now"));

// 404 + error
app.use((_req, res) => res.status(404).json({ message: "Not found" }));
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// start
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
