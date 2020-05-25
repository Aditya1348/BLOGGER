var mongoose = require("mongoose");
var passpotLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    fullname: String,
    email: String,
    userimage: String,
    password: String,


    resetPasswordToken: String,
    resetPasswordExpires: Date

});

userSchema.plugin(passpotLocalMongoose);
module.exports = mongoose.model("User", userSchema);