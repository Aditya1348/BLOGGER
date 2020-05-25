var express = require("express");
var router = express.Router();
var middleware = require("../middleware/index");
var User = require("../models/User");
var Comment = require("../models/comment");
var Blogs = require("../models/blog");
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

router.get("/user/home/:id", middleware.isLoggedIn, function(req, res) {
    User.findById(req.params.id, function(err, found) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("user/profile", { current: found })
        }
    })

})
router.get("/user/image", middleware.isLoggedIn, function(req, res) {
    res.render("user/imageupload");
})
router.put("/user/image/:id", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property


        // add author to campground
        // req.body.campground.author = {
        //     id: req.user._id,
        //     username: req.user.username
        // };
        User.findByIdAndUpdate(req.params.id, { userimage: result.secure_url }, function(err, blogcreated) {
            if (err) {
                // req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect("/user/home/" + req.params.id);
        });
    });

});


router.put("/user/image/:id/delete", middleware.isLoggedIn, function(req, res) {

    User.findByIdAndUpdate(req.params.id, { userimage: null }, function(err, blogcreated) {
        if (err) {
            // req.flash('error', err.message);
            return res.redirect('back');
        }
        res.redirect("/user/home/" + req.params.id);
    });

})
router.get("/blogcreated/:userId", function(req, res) {
    User.findById(req.params.userId, function(err, found) {

        if (err) {
            res.redirect("back");
        } else if (found === null) {
            req.flash("error", "It seems that some body has deleted his/her account")
            return res.redirect("/blogs/show");
        } else {
            res.render("user/allcreators", { current: found });
        }
    })
});



router.delete("/user/:userId/:username/deleteAccount", middleware.isLoggedIn, function(req, res) {
    User.findByIdAndDelete(req.params.userId, function(err, deleted) {
        if (err) {
            return res.redirect("back");
        } else {
            Blogs.find({ creator: req.params.username }, function(err, found) {
                for (var i = 0; i < found.length; i++) {
                    Blogs.findByIdAndDelete(found[i]._id, function(err, deleted) {
                        if (err) {
                            console.log(err);
                        } else {
                            Comment.deleteMany({ _id: { $in: deleted.comments } }, function(err) {
                                console.log(err);
                            })
                        }
                    })
                }
            })

            req.flash("success", "You have successfully deleted your account");
            return res.redirect("/")

        }
    })
})

module.exports = router;