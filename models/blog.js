var mongoose = require("mongoose");

var blogSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    userid: String,
    creator: String,
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }]

})

module.exports = mongoose.model("Blogs", blogSchema);