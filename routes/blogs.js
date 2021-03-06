var express = require("express");
var router = express.Router();
var Blogs = require("../models/blog");
var middleware = require("../middleware/index");
var Comment = require("../models/comment");
var moment = require("moment-timezone");
var Like = require("../models/like");
var Dislike = require("../models/dislike")

require("dotenv").config();
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function(req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'aditya1348',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get("/blogs/show", function(req, res) {
    Blogs.find({}, function(err, found) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("blogs/allblogs", { blogs: found })
        }
    })

});

router.get("/blogs/new", middleware.isLoggedIn, function(req, res) {
    res.render("blogs/new");
})
router.post("/blogs/new", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.blog.image = result.secure_url;
        req.body.blog.userid = req.user._id;
        req.body.blog.creator = req.user.username;
        req.body.blog.time = moment.tz("Asia/Kolkata").format("[PostedAt: ] LL [/] LT")
            // add author to campground
            // req.body.campground.author = {
            //     id: req.user._id,
            //     username: req.user.username
            // };
        Blogs.create(req.body.blog, function(err, blogcreated) {
            if (err) {
                // req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect("/blogs/" + req.user.username + "/userblog");
        });
    });

});
router.get("/blogs/:id/about", function(req, res) {
    Blogs.findById(req.params.id).populate("comments").exec(function(err, found) {

        if (err) {
            res.redirect("back");
        } else if (found === null) {
            req.flash("error", "it seems that creator has delted this blog")
            return res.redirect("/blogs/show")
        } else {
            res.render("blogs/about", { blog: found });
        }
    })
});

router.get("/blogs/:blogId/dislike", middleware.isLoggedIn, function(req, res) {
    Blogs.findById(req.params.blogId, function(err, found) {
        console.log(found)
        Dislike.find({ dislikeUser: req.user.username }, function(err, finddislike) {

            if (finddislike[0] !== undefined) {
                req.flash("error", "You have already did that");
                return res.redirect("/blogs/" + req.params.blogId + "/about");

            } else {
                Dislike.create({ dislikeUser: req.user.username, dislike: 1 }, function(err, created) {
                    if (err) {
                        console.log(err);
                    } else {

                        found.dislikes.push(created);
                        found.save()

                        Blogs.findByIdAndUpdate(req.params.blogId, { totalDislikes: Adition(found.totalDislikes) }, function(err, updated) {
                            if (err) {
                                console.log(err);
                            } else {
                                Like.find({ likeUser: req.user.username }, function(err, likefound) {
                                    if (likefound[0] !== undefined) {
                                        Like.findOneAndDelete({ likeUser: req.user.username }, function(err, deletd) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                Blogs.findByIdAndUpdate(req.params.blogId, { totalLikes: Substraction(found.totalLikes) }, function(err, updated) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        return res.redirect("/blogs/" + req.params.blogId + "/about");
                                                    }
                                                })
                                            }
                                        })
                                    } else {

                                        return res.redirect("/blogs/" + req.params.blogId + "/about");
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })



    })
});
router.get("/blogs/:blogId/like", middleware.isLoggedIn, function(req, res) {

    Blogs.findById(req.params.blogId, function(err, found) {
        console.log(found)
        Like.find({ likeUser: req.user.username }, function(err, findlkes) {

            if (findlkes[0] !== undefined) {
                req.flash("error", "You have already did that");
                return res.redirect("/blogs/" + req.params.blogId + "/about");



            } else {
                Like.create({ likeUser: req.user.username, like: 1 }, function(err, created) {
                    if (err) {
                        console.log(err);
                    } else {

                        found.likes.push(created);
                        found.save()



                        Blogs.findByIdAndUpdate(req.params.blogId, { totalLikes: Adition(found.totalLikes) }, function(err, updated) {
                            if (err) {
                                console.log(err);
                            } else {
                                Dislike.find({ dislikeUser: req.user.username }, function(err, dislikefound) {
                                    if (dislikefound[0] !== undefined) {
                                        Dislike.findOneAndDelete({ dislikeUser: req.user.username }, function(err, deletd) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                Blogs.findByIdAndUpdate(req.params.blogId, { totalDislikes: Substraction(found.totalDislikes) }, function(err, updated) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        return res.redirect("/blogs/" + req.params.blogId + "/about");
                                                    }
                                                })
                                            }
                                        })
                                    } else {

                                        return res.redirect("/blogs/" + req.params.blogId + "/about");
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })



    })
});

router.get("/blogs/:creator/userblog", middleware.isLoggedIn, function(req, res) {
    Blogs.find({ creator: req.params.creator }, function(err, found) {
        if (err) {
            return res.redirect("back")
        } else if (found[0] === undefined) {
            req.flash("success", "You don't have any your created bloggs ,So go on create")
            res.redirect("/blogs/new")
        } else {
            res.render("blogs/userblog", { found: found });
        }
    })
});
router.delete("/blogs/:blogId/delete", middleware.isLoggedIn, function(req, res) {
    Blogs.findByIdAndDelete(req.params.blogId, function(err, deleted) {

        if (err) {
            return res.redirect("back")
        } else {
            Comment.deleteMany({ _id: { $in: deleted.comments } }, function(err) {
                if (err) {
                    res.redirect("back");

                } else {
                    req.flash("success", "Successfully deleted blogs");
                    res.redirect("/blogs/" + req.user.username + "/userblog");
                }
            })

        }
    })
});
router.get("/blogs/:blogId/edit", middleware.isLoggedIn, function(req, res) {
    Blogs.findById(req.params.blogId, function(err, found) {


        if (err) {
            return res.redirect("back");
        } else {
            res.render("blogs/editMyblog", { found: found })
        }
    })
});
router.put("/blogs/:blogId/edit", middleware.isLoggedIn, function(req, res) {
    console.log(req.body.data)
    Blogs.findByIdAndUpdate(req.params.blogId, req.body.data, function(err, found) {
        if (err) {
            return res.redirect("back");
        } else {
            req.flash("success", "Successfully edited blog");
            res.redirect("/blogs/" + req.user.username + "/userblog");
        }
    })
});

function Adition(num) {
    if (num === null) {
        return 1;
    } else {
        return num + 1;
    }

}

function Substraction(num) {
    if (num === null) {
        return 1;
    } else {
        return num - 1
    }
}



module.exports = router;