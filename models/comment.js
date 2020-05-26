var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
    comment: String,
    commentUser: String,
    userId: String,
    time: String
})


module.exports = mongoose.model("Comment", commentSchema);