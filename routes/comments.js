var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");
var middleware = require("../middleware/index");

// ============
// Comment
// ============
router.get("/new", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCamp) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("comments/new", {thisCamp : foundCamp});
        }
    });
});
//Comment Edit
router.get("/:comment_id/edit", middleware.checkCommentOwner, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCamp) {
        if (err || !foundCamp) {
            req.flash("error", "No campground found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function (err, curComment) {
            if (err) {
                res.redirect("back");
            } else {
                res.render("comments/edit", {campground_id: req.params.id, curComment: curComment});
            }
        });
    });

});

router.post("/", middleware.isLoggedIn,  function (req, res) {
    Campground.findById(req.params.id, function (err, thisCamp) {
        if (err) {
            req.flash("error", "Something wrong with the Database");
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
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + thisCamp._id);
                }
            });
        }
    });
});

router.put("/:comment_id", middleware.checkCommentOwner, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id );
        }
    })
});

router.delete("/:comment_id", middleware.checkCommentOwner, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("error", "Successfully deleted comment");
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});



module.exports = router;