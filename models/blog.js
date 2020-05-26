var mongoose = require("mongoose");

var blogSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    userid: String,
    creator: String,
    time: String,
    totalDislikes: {
        type: Number,
        default: 0
    },
    totalLikes: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like"
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dislike"
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }]

})

module.exports = mongoose.model("Blogs", blogSchema);