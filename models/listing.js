const mongoose = require("mongoose");
const Review = require("./review.js");
const User = require("./User.js");

let listSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        filename: String,
        url: String,
    },
    price: Number,
    location: {
        type: String,
        required: true
    },
    geometry:{
        type:{
            type:String,
            enum:["point"],
            required: true
        },
        coordinates:{
            type:[Number],
            required: true
        }
    },
    country: {
        type: String,
        required: true
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        },
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
    },
    status: {
        type: String,
        enum: ["Available", "Booked"],
        default: "Available"
    },
})

//Delete MiddleWare of findByIdAndDelete().
listSchema.post("findOneAndDelete", async (lists) => {
    if (lists) {
        await Review.deleteMany({ _id: { $in: lists.reviews } });
    }
})
let List = mongoose.model("List", listSchema);

module.exports = List;