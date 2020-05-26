var mongoose = require("mongoose");

var dislikeShecma = new mongoose.Schema({
    dislikeUser: String,
    dislike: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("DisLike", dislikeShecma);