const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {  // Changed from "emails" to "email"
        type: String,
        required: true,
        unique: true // Prevent duplicate emails
    }
});

// Use passport-local-mongoose and set the email as the username field
UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

let User = mongoose.model("User", UserSchema);

module.exports = User;
