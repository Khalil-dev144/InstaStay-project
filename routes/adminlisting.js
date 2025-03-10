const express = require("express");
const router = express.Router();
const app = express();
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const User = require("../models/User.js");
const Review = require("../models/review.js");
//isAuthenication middleware
const { isloggedIn, IsOwner, isAdmin } = require("../middleware.js");

// Admin Panel route
router.get("", isAdmin, async (req, res) => {
    const users = await User.find();
    const listings = await Listing.find();
    const bookings = await Booking.find().populate("user").populate("listing");
    let Revenue = 0;
    bookings.forEach(booking => {
        console.log(booking);
        Revenue += booking.listing.price;
    });
    console.log("Admin Panel accessed");
    res.render("adminlisting/home.ejs", { users, listings, bookings, Revenue });
})

// admin user route
router.get("/user", isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        if (!users) {
            req.flash("error", "No users found!");
            return res.redirect("/admin");
        }
        res.render("adminlisting/users.ejs", { users });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

//admin edit user route
router.get("/edit-user/:id", isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            req.flash("error", "User not found!");
            return res.redirect("/admin/user");
        }

        res.render("adminlisting/edit-user.ejs", { user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


//admin update user route
router.put("/update-user/:id", isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, isAdmin } = req.body;

        const updatedUser = await User.findByIdAndUpdate(id, { username, email, isAdmin }, { new: true });

        if (!updatedUser) {
            req.flash("error", "User not found!");
            return res.redirect("/admin/user");
        }

        req.flash("success", "User updated successfully!");
        res.redirect("/admin/user");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


//admin delete user route
router.get("/delete-user/:id", isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const UserBooing = await Booking.deleteMany({ user: id });
                console.log("Deleted Bookings:", UserBooing);
        
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            req.flash("error", "User not found!");
            return res.redirect("/admin/user");
        }

        req.flash("success", "User deleted successfully!");
        res.redirect("/admin/user");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

//admin listing route
router.get("/listing", isAdmin, async (req, res) => {
    try {
        const listings = await Listing.find();
        const users = await User.find();
        if (!listings || !users) {
            req.flash("error", "No listings found!");
            return res.redirect("/admin");
        }
        res.render("adminlisting/view-listing.ejs", { listings, users });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
})

//admin delete listing router
router.get("/delete-listing/:id", isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBookings = await Booking.deleteMany({ listing: id });
        console.log("Deleted Bookings:", deletedBookings);

        const deletedListing = await Listing.findByIdAndDelete(id);

        if (!deletedListing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/admin/listing");
        }

        req.flash("success", "Listing deleted successfully!");
        res.redirect("/admin/listing");
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

//admin booking route
router.get("/booking", isAdmin, async (req, res) => {
    try {
        console.log("Booking route");
        const bookings = await Booking.find().populate("user").populate("listing");
        if (!bookings) {
            req.flash("error", "No bookings found!");
            return res.redirect("/admin");
        }
        res.render("adminlisting/view-booking.ejs", { bookings });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

//admin edit booking route
router.get("/edit-booking/:id", isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).populate("user").populate("listing");

        if (!booking) {
            req.flash("error", "Booking not found!");
            return res.redirect("/admin/booking");
        }

        res.render("adminlisting/edit-booking.ejs", { booking });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

//admin update booking route
router.put("/edit-booking/:id", isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        let { checkin, checkout, roomType, payment } = req.body;
        const updateBooking = await Booking.findByIdAndUpdate(id, { checkin, checkout, roomType, payment });
        if (!updateBooking) {
            req.flash("error", "Booking not found!");
            return res.redirect("/admin/booking");
        }
        req.flash("success", "Booking updated successfully!");
        res.redirect("/admin/booking");
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong!");
        res.redirect("/admin/booking");
    }
});

// Get all reviews
router.get('/review',isAdmin, async (req, res) => {
    try {
        const reviews = await Review.find({}).populate('Author');
        if (!reviews) {
            req.flash('error', 'No reviews found!');
            return res.redirect('/admin');
        }
        res.render('adminlisting/review.ejs', { reviews });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).send('Server error');
    }
});

// Delete review
router.post('/review/:id/delete',isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await Review.findByIdAndDelete(id);
        res.redirect('/admin/review');
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).send('Server error');
    }
});

//admin Analytics route
router.get("/analytics", isAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find().populate("user").populate("listing");
        const users = await User.find();
        const listings = await Listing.find();
        if (!bookings || !users || !listings) {
            req.flash("error", "No data found!");
            return res.redirect("/admin");
        }
        let totalRevenue = 0;
        bookings.forEach(booking => {
            totalRevenue += booking.listing.price;
        });
        res.render("adminlisting/analytics.ejs", { bookings, users, listings, totalRevenue });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

//admin settings route
router.get("/setting", isAdmin, async (req, res) => {
    const user = req.user;
    const session = req.session;// Get the logged-in admin user
    res.render("adminlisting/setting.ejs", { user, session });
});

//admin update profile route
router.post("/setting/profile", isAdmin, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            req.flash("error", "User not found!");
            return res.redirect("/admin/setting");
        }

        user.username = username;
        user.email = email;
        if (password) user.password = password; // Hash before saving (implement hashing)

        await user.save();
        req.flash("success", "Profile updated successfully!");
        res.redirect("/admin/setting");
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong!");
        res.redirect("/admin/setting");
    }
});

//admin delete profile route 
router.get("/setting/delete", isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);

        if (!user) {
            req.flash("error", "User not found!");
            return res.redirect("/admin/setting");
        }

        req.flash("success", "Profile deleted successfully!");
        res.redirect("/admin/signup");
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong!");
        res.redirect("/admin/setting");
    }
});
module.exports = router;