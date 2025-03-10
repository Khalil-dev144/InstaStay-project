const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require('./models/User.js');
const { body} = require("express-validator");

module.exports.validateSignup = [
    body("username").trim().notEmpty().withMessage("Username is required."),
    body("email").isEmail().withMessage("Invalid email format."),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long.")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number.")
        .matches(/[!@#$%^&*]/)
        .withMessage("Password must contain at least one special character."),
];

module.exports.isloggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        console.log(req.path, "..", req.originalUrl);
        req.session.RedirectUrl = req.originalUrl;
        console.log(req.session.RedirectUrl);

        req.flash("error", "You must be login to create lsiting");
        res.redirect("/Login");
    }
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.RedirectUrl) {
        res.locals.RedirectUrl = req.session.RedirectUrl;
        console.log(res.locals.RedirectUrl);
    }
    next();
}

module.exports.IsOwner = async (req, res, next) => {
    let { id } = req.params;
    console.log(id);
    let listing = await Listing.findById(id);
    //check the current user that is the onwer if not then error message flash. 
    if (!listing.owner._id.equals(res.locals.currUser._id) && res.locals.currUser) {
        req.flash("error", "Your are not the onwer of this!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.IsReviewedAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    console.log(id);
    let review = await Review.findById(reviewId);
    //check the current user that is the onwer if not then error message flash. 
    if (!review.Author._id.equals(res.locals.currUser._id) && res.locals.currUser) {
        req.flash("error", "Your are not the Author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

// Middleware to check if user is an admin
module.exports.isAdmin = (req, res, next)=> {
    console.log(req.user);
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    req.flash("error", "You do not have permission to view this page.");
    res.redirect("/listings"); // Redirect unauthorized users to login
}

module.exports.restrictAdminSignup = async (req, res, next) => {
    try {
        const adminExists = await User.findOne({ isAdmin: true });

        if (adminExists) {
            // If admin already exists, redirect to login
            return res.redirect('/admin/login');
        }
        next();
    } catch (error) {
        console.error('Error checking admin existence:', error);
        res.status(500).send('Server error');
    }
}
