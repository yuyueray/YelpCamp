
var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");


// ============
// Comment
// ============
router.get("/new", isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCamp) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {thisCamp : foundCamp});
        }
    });
});

router.post("/", isLoggedIn,  function (req, res) {
    Campground.findById(req.params.id, function (err, thisCamp) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function (err, newComment) {
                if (err) {
                    console.log(err);
                } else {
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();
                    thisCamp.comments.push(newComment);
                    thisCamp.save();
                    res.redirect("/campgrounds/" + thisCamp._id);
                }
            });
        }
    });
});

function isLoggedIn (req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");

}

module.exports = router;