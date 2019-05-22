//all middleware

var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Login first");
    res.redirect("/login");
};

middlewareObj.checkCampgroundOwner = function (req, res, next) {
    if(req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, foundCampId) {
            if (err || !foundCampId) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                if (foundCampId.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                }
                else {
                    req.flash("error", "You do not have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please Login first");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwner = function (req, res, next) {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err || !foundComment) {
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                }
                else {
                    req.flash("error", "You do not have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please Login first.");
        res.redirect("back");
    }
};

module.exports = middlewareObj;