
var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");

router.get("/", function (req, res) {
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {camps : allCampgrounds, currentUser : req.user});
        }
    });
});

router.post("/", isLoggedIn, function (req, res) {
    var name = req.body.campName;
    var image = req.body.campImage;
    var desc = req.body.campDesc;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCamp = {name: name, image: image, description : desc, author: author};
    Campground.create(newCamp, function (err, newAdded) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds")
        }
    });
});

router.get("/new", isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

router.get("/:id", function (req, res) {
    Campground.findById(req.params.id).populate("comments").exec( function (err, foundCamp) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", {thisCamp : foundCamp})
        }
    });
});
//Edit
router.get("/:id/edit", function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampId) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/edit", {curCamp: foundCampId});
        }
    });
});
//Update
router.put("/:id", function (req, res) {
    // var updateCamp = {name: req.body.name,
    //     image: req.body.image,
    //     description: req.body.description};
    Campground.findByIdAndUpdate(req.params.id, req.body.campInfo, function (err, updatedCamp) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params._id);
        }
    });
});
//Delete
router.delete("/:id", function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err) {
        if (err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    })
});

// middleware
function isLoggedIn (req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");

}

module.exports = router;