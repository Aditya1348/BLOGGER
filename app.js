var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),

    User = require("./models/User"),
    flash = require("connect-flash");

var blogs = require("./routes/blogs"),
    index = require("./routes/index"),
    profile = require("./routes/user"),
    comment = require("./routes/comment");

require("dotenv").config()

mongoose.connect("mongodb://127.0.0.1:27017/BLOGGER", { useUnifiedTopology: true, useNewUrlParser: true });
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(flash());

//Passport configuration
app.use(require("express-session")({
    secret: "My blogs is nothing infront of other",
    resave: false,
    saveUninitialized: false
}));
app.locals.moment = require("moment");

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next) {
    res.locals.user = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})


app.use(blogs);
app.use(index);
app.use(profile);
app.use(comment);
app.listen(process.env.PORT || 8080, process.env.IP, function() {
    console.log("server has started just now");
});