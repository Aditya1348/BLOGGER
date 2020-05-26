var express = require("express");
var router = express.Router();
var Blogs = require("../models/blog");
var middleware = require("../middleware/index");
var Comment = require("../models/comment");
var moment = require("moment-timezone")
router.get("/blogs/:blogid/newcomment", middleware.isLoggedIn, function(req, res) {
    Blogs.findById(req.params.blogid, function(err, foundblog) {
        if (err) {
            console.log(err);
        } else if (foundblog === null) {
            req.flash("error", "It seems that creator has deleted this blog");
            return res.redirect("/blogs/show")
        } else {
            res.render("comment/new", { blog: foundblog });
        }
    })

});

router.post("/blogs/:blogid/newcomment", middleware.isLoggedIn, function(req, res) {
    Blogs.findById(req.params.blogid, function(err, blogfound) {
        if (err) {
            console.log(err);
        } else {

            Comment.create({ comment: req.body.comment, commentUser: req.user.username, userid: req.user._id, time: moment.tz("Asia/Kolkata").format("[PostedAt: ] LL [/] LT") }, function(err, comment) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {



                    blogfound.comments.push(comment);
                    blogfound.save();
                    req.flash("success", "successfully added comment")
                    res.redirect("/blogs/" + blogfound._id + "/about");
                }
            })
        }
    })
});

router.delete("/blogs/:blogid/:commentid/delcomment", middleware.isLoggedIn, function(req, res) {
    Comment.findByIdAndDelete(req.params.commentid, function(err, deleted) {

        if (err) {
            console.log(err);
        } else if (deleted === null) {
            req.flash("error", "It seems that creator has deleted this blog")
            return res.redirect("/blogs/show")
        } else {
            res.redirect("/blogs/" + req.params.blogid + "/about");
        }
    })

})
module.exports = router;