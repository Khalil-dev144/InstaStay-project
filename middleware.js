const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

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