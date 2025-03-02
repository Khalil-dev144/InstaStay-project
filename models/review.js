const mongoose = require("mongoose");
let ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    comment: String,
    createAt:{
        type: Date,
        default: Date.now()
    },
    Author :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
    }
})

let Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
