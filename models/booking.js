const mongoose = require("mongoose");
const Review = require("./review.js");
const User = require("./User.js");

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing", 
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    checkin: {
        type: Date,
        required: true
    },
    checkout: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        default: 1 
    },
    roomType: {
        type: String,
        required: true
    },
    requests: {
        type: String,
        default: "No special requests" 
    },
    payment: {
        type: String,
        required: true,
        default: "Pending"
    }
}); 
let Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
