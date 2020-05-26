var mongoose = require("mongoose");

var likeShecma = new mongoose.Schema({
    likeUser: String,
    like: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Like", likeShecma);