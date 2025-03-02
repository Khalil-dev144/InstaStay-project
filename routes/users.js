const express = require("express");
const router = express.Router();
//isAuthenication middleware
const { saveRedirectUrl} = require("../middleware.js");
const passport = require("passport");
const User = require("../models/User.js");


//SignUp form
router.get("/signup", (req, res) => {
    res.render("users/SignUp.ejs");
})

//Save The SignUp data
router.post("/SignUp", async (req, res, next) => {
    try {
        let {username, email, password } = req.body; 
        let newUser = new User({ username, email }); 

        let registeredUser = await User.register(newUser, password);
        console.log(registeredUser);

        // Automatically log in the user after signup
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to InstaStay!");
            res.redirect("/listings");
        });

    } catch (error) {
        req.flash("error", "Email is already registered!");
        res.redirect("/SignUp");
    }
});

//Login form
router.get("/login", (req, res) => {
    res.render("users/Login.ejs");
})

//Login form post Request to check the user is present or not
router.post("/Login", saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/Login",
        failureFlash: true,
    }), (req, res) => {
        req.flash("success", "Welcome back to InstaStay!");
        //check the user is logged in then go to the page that he accessed.
        if (res.locals.RedirectUrl) {
            res.redirect(res.locals.RedirectUrl);
        } else {
            res.redirect("/listings");
        }

    });

//Logout Route to logged out the user.
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            next(err);
        } else {
            req.flash("success", "You logged out!");
            res.redirect("/listings");
        }
    })
})

module.exports = router;