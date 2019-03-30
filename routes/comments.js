
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
//Comment Edit
router.get("/:comment_id/edit", checkCommentOwner, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, curComment) {
       if (err) {
           res.redirect("back");
       } else {
           res.render("comments/edit", {campground_id: req.params.id, curComment: curComment});
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

router.put("/:comment_id", checkCommentOwner, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id );
        }
    })
});

router.delete("/:comment_id", checkCommentOwner, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

function isLoggedIn (req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");

}

function checkCommentOwner(req, res, next) {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("back");
            } else {
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                }
                else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
}


module.exports = router;