const express = require("express");
const passport = require("passport");
const User = require("../models/User.js"); // User schema
const router = express.Router();
const { validationResult } = require("express-validator");
const { validateSignup, restrictAdminSignup} = require("../middleware.js");

// Render Admin Signup Page
router.get("/signup", restrictAdminSignup, (req, res) => {
    res.render("users/admin/SignUp.ejs");
});

// Handle Admin Signup with Validation
router.post("/signup", validateSignup, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(err => err.msg).join(", "));
        return res.redirect("/admin/signup");
    }

    try {
        const { username, email, password } = req.body;

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email, isAdmin: true });
        if (existingAdmin) {
            req.flash("error", "Admin already exists! Please login.");
            return res.redirect("/admin/login");
        }

        // Create a new admin
        const admin = new User({ username, email, isAdmin: true });
        await User.register(admin, password); // Passport-local-mongoose handles hashing
        req.flash("success", "Registered successfully! Please login.");
        res.redirect("/admin/login");

    } catch (error) {
        req.flash("error", "An error occurred during signup. Please try again.");
        res.redirect("/admin/signup");
    }
});

// Render Admin Login Page
router.get("/login", (req, res) => {
    res.render("users/admin/Login.ejs");
});

// Handle Admin Login
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/admin/login",
    failureFlash: true,
}), (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        req.flash("error", "Access denied. Admins only.");
        return res.redirect("/admin/login");
    }
    res.redirect("/admin"); // Redirect to admin dashboard
});

// Handle Admin Logout
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            req.flash("error", "Logout failed. Please try again.");
            return res.redirect("/admin");
        }
        res.redirect("/admin/login");
    });
});

module.exports = router;
