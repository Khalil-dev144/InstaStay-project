if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utility/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo"); // For session storage
const cors = require("cors");

const User = require("./models/User.js");
const { saveRedirectUrl, IsOwner, IsReviewedAuthor, isAdmin } = require("./middleware.js");
const listingsRoutes = require("./routes/listings.js");
const reviewRoutes = require("./routes/reviews.js");
const UsersRoutes = require("./routes/users.js");
const adminRoutes = require("./routes/admin.js");
const adminlistingsRoutes = require("./routes/adminlisting.js");

const port = process.env.PORT || 3000; // Use environment port if available

app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// MongoDB connection
const dbUrl = process.env.MONGO_ATLAS_URL || "mongodb://localhost:27017/myapp";

async function connectDB() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Successfully connected to MongoDB!");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1); // Exit the application on failure
    }
}
connectDB();

// Session store using MongoDB
const sessionStore = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600, // Reduces session updates
    crypto: {
        secret: process.env.SESSION_SECRET || "FirstProject",
    }
});


sessionStore.on("error", (err) => {
    console.log("Session Store Error:", err);
});

const sessionOptions = {
    store: MongoStore.create({ mongoUrl: process.env.MONGO_ATLAS_URL }),
    secret: process.env.SESSION_SECRET || "FirstProject",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1 * 24 * 60 * 60 * 1000,
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport authentication setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
});

// Root route
app.get("/", (req, res) => {
    console.log("Root route accessed");
    res.send("Welcome to Instay!");
});

// Routes
app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use(UsersRoutes);
app.use("/admin", adminlistingsRoutes);
app.use("/admin", adminRoutes);


// Handle undefined routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).render("listing/Error.ejs", { message });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
