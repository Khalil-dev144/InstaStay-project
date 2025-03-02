//in the development phase they are used.
if(process.env.NODE_ENV != "production"){
    require('dotenv').config()   
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
const User = require("./models/User.js");
//isAuthenication middleware
const { saveRedirectUrl, IsOwner, IsReviewedAuthor } = require("./middleware.js");
const listingsRoutes = require("./routes/listings.js");
const reviewRoutes = require("./routes/reviews.js");
const UsersRoutes = require("./routes/users.js");
// const { title } = require("process");

const port = 3000;


app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
const cors = require("cors"); // Allow frontend requests
app.use(cors());  // Enable CORS for frontend requests
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


const sessionOption = {
    secret: "FirstProject",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1 * 24 * 60 * 60 * 1000,
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

//Using Express session
app.use(session(sessionOption));
//using flash.
app.use(flash());

//passport initialize
app.use(passport.initialize());
//passport session
app.use(passport.session());
//using User authentication in local strategy
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));
//Store info about the authenicate user  called serializeUser.
passport.serializeUser(User.serializeUser());
//Remove the store info about the authenicated user called deserializeUser.
passport.deserializeUser(User.deserializeUser());

//middleware for the flash message.
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
})

app.listen(port, (req, res) => {
    console.log("Port is working!");
})
//Root route
app.get("/", (req, res) => {
    console.log("I am the root route");
})

//URL of the database.
const url = process.env.MONGO_ATLAS_URL;
console.log(url);
//Connection to mongodb
async function main() {
    await mongoose.connect(url)
}

main().then((res) => {
    console.log("Working is succussfull!");
})
    .catch((err) => {
        console.log("The error is: ", err);
    })
 
//listings router.
app.use("/listings", listingsRoutes);
//Reviews router
app.use("/listings/:id/reviews", reviewRoutes);
// User router
app.use(UsersRoutes);



//Check the request to the above routes.
// if not met then it will send the error.
app.all("*", (req, res, next) => {
    next(new ExpressError(500, "page not found"));
});

//Middleware to handler error
app.use((err, req, res, next) => {
    let { statusCode, message } = err;
    res.status(statusCode).render("listing/Error.ejs", { message });
})

