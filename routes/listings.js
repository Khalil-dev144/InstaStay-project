const express = require("express");
const router = express.Router();
const app = express();
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
//isAuthenication middleware
const { isloggedIn, IsOwner } = require("../middleware.js");
//Parseing file-data
const multer = require('multer');
const { storage, cloudinary } = require("../cloudConfigs.js");
// const upload = multer({ dest: "uploads/"});
const upload = multer({ storage: storage });


//Index Route
router.get("", async (req, res, next) => {
    try {
        console.log("Hello world!");
        let allListings = await Listing.find();
        res.render("listing/index.ejs", { allListings });
    } catch (err) {
        next(err);
    }
})

//Create new listing Route
router.get("/new", isloggedIn, (req, res) => {
    console.log("Hello world");
    res.render("listing/new");
})


//Saved the Created listing.
router.post("/new", upload.single('image'), async (req, res, next) => {

    try {
        let { title, description, price, location, country } = req.body;
        //Leaflet Map plugin LocationIQ Api
        const url = `https://us1.locationiq.com/v1/search?key=${process.env.LEAFLET_TOKEN}&format=json&q=${location}`;
        const response = await fetch(url);

        // Check if the response is OK (status code 200)
        if (!response.ok) {
            // If the response is not OK, throw an error
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        let newlisting = await new Listing({
            title: title,
            description: description,
            price: price,
            location: location,
            country: country
        });
        //Adding owner of the list.
        newlisting.owner = req.user._id;
        newlisting.image.filename = req.file.filename;
        newlisting.image.url = req.file.path;
        //Set the geometry of the listing.
        newlisting.geometry.type = "point";
        newlisting.geometry.coordinates = [data[0].lon, data[0].lat];
        //New listing Saved
        newlisting.save();
        //flash message of the succuss
        req.flash("success", "New Listing succussfully Added!");

        res.redirect("/listings");
        console.log("Data saved succussfully!");
    } catch (err) {
        next(err);
    }
})

//filter get route
router.get("/filter", isloggedIn, async (req, res) => {
    console.log("Getting the booking route");
    res.render("listing/filter.ejs");
})


//filter post route
router.post("/filter", async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Request body is empty" });
    }

    try {
        let { price, location } = req.body;

        console.log("Received Price:", price);
        console.log("Received Location:", location);

        // Convert `price` to an integer and validate it
        price = parseInt(price);
        if (isNaN(price)) {
            return res.status(400).json({ error: "Invalid price. Please enter a valid numeric price." });
        }

        // Step 1: Filter based on price only
        let query = {
            price: {
                $gte: price - 100,
                $lte: price + 100
            }
        };

        let filteredRooms = await Listing.find(query);
        console.log("Rooms Found (Price-based):", filteredRooms.length);

        // Step 2: If `location` exists, refine the results
        if (location && typeof location === "string") {
            query.location = { $regex: new RegExp(location, "i") };

            console.log("the mongoose query is: ", query);
            let locationFilteredRooms = await Listing.find(query);
            console.log("Rooms Found (Price & Location-based):", locationFilteredRooms.length);

            // If rooms are found with location filtering, update `filteredRooms`
            if (locationFilteredRooms.length > 0) {
                filteredRooms = locationFilteredRooms;
            }
        }

        // Final response
        if (filteredRooms.length > 0) {
            return res.json(filteredRooms);
        }

        return res.status(404).json({ message: "No rooms found within the given price range." });

    } catch (error) {
        // Handle CastError specifically
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ error: "Invalid data format. Please check your input values." });
        }
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
});

//Booking get Route
router.get("/:id/booking", isloggedIn, (req, res) => {
    console.log("My name is Muhammad Khaili");
    let { id } = req.params;
    console.log("The room id is: ", id);
    res.render("listing/booking.ejs", { id });
})

// Booking post route
router.post("/:id/booking", isloggedIn, async (req, res, next) => {
    console.log("The request body of the form: ", req.body);
    let { id } = req.params;
    console.log("The room id is: ", id);

    try {
        const { name, email, phone, checkin, checkout, guests, roomType, requests, payment } = req.body;

        // Check if the listing exists
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings/filter");
        }

        // Check if the room is already booked in the given date range
        const isRoomBooked = await Booking.findOne({
            listing: id,
            $or: [
                {
                    checkin: { $lt: new Date(checkout) },
                    checkout: { $gt: new Date(checkin) }
                }
            ]
        });

        if (isRoomBooked) {
            req.flash("error", "This room is already booked for the selected dates.");
            return res.redirect("/listings");
        }

        // Create a new booking
        const newBooking = new Booking({
            user: req.user._id, // Logged-in user
            listing: id,
            name,
            email,
            phone,
            checkin: new Date(checkin),
            checkout: new Date(checkout),
            guests: guests,
            roomType,
            requests: requests,
            payment: payment
        });

        // Save the booking
        await newBooking.save();

        // Update the listing status to "Booked"
        listing.status = "Booked";
        await listing.save();

        req.flash("success", "Booking successful!");
        res.redirect("/listings");
    } catch (error) {
        next(error);
    }
});

//AboutUs page get route
router.get("/AboutUs", (req, res) => {
    res.render("listing/AboutUs.ejs");
});

//Edit the listing route
router.get("/:id/edit", isloggedIn, IsOwner, async (req, res, next) => {
    try {
        let { id } = req.params;
        let editlisting = await Listing.findById(id);
        let originalUrl = editlisting.image.url;
        let editingUrl = originalUrl.replace("/upload", "/upload/w_300");
        if (!editlisting) {
            req.flash("error", "Your listing was deleted!");
            res.redirect("/listings");
        }
        res.render("listing/edit.ejs", { editlisting, editingUrl });
    } catch (err) {
        next(err);
    }
})

//UPDATE listing Route
router.put("/:id/edit", upload.single("image"), isloggedIn, IsOwner, async (req, res, next) => {
    try {
        let { id } = req.params;
        let { title, description, price, location, country } = req.body;
        await Listing.findByIdAndUpdate(id, {
            title: title,
            description: description,
            price: price,
            location: location,
            country: country
        });
        if (typeof req.file !== "undefined") {
            let originalListingUrl = await Listing.findById(id);
            originalListingUrl.image.filename = req.file.filename;
            originalListingUrl.image.url = req.file.path;
            originalListingUrl.save();
        }
        console.log('Update data successfully');
        //flash listing updated
        req.flash("success", "succussfully Update!");

        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
})

// Delete listing Route
router.get("/:id/delete", isloggedIn, IsOwner, async (req, res, next) => {
    try {
        let { id } = req.params;

        // Delete related bookings before deleting the listing
        const deletedBookings = await Booking.deleteMany({ listing: id });
        console.log("Deleted Bookings:", deletedBookings);


        // Delete the listing
        await Listing.findByIdAndDelete(id);

        // Flash message for success
        req.flash("success", "Listing and associated bookings deleted!");
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
});


//Read listing Route
router.get("/:id", async (req, res) => {
    let { id } = req.params;
    let showDetails = await Listing.findById(id).populate(
        {
            path: "reviews",
            populate: {
                path: "Author",
            },
        }).populate("owner");
    console.log(showDetails);
    if (!showDetails) {
        req.flash("error", "Your listing was deleted!");
        res.redirect("/listings");
    }
    res.render("listing/show.ejs", { showDetails });
})

module.exports = router;