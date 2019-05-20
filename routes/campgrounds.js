
var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var middleware = require("../middleware/index");

router.get("/", function (req, res) {
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {camps : allCampgrounds, currentUser : req.user});
        }
    });
});

router.post("/", middleware.isLoggedIn, function (req, res) {
    var name = req.body.campName;
    var price = req.body.campPrice;
    var image = req.body.campImage;
    var desc = req.body.campDesc;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCamp = {name: name, price: price, image: image, description : desc, author: author};
    Campground.create(newCamp, function (err, newAdded) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds")
        }
    });
});

router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

router.get("/:id", function (req, res) {
    Campground.findById(req.params.id).populate("comments").exec( function (err, foundCamp) {
        if (err || !foundCamp) {
            req.flash("error", "Campground not found");
            return res.redirect("back");
        } else {
            res.render("campgrounds/show", {thisCamp : foundCamp})
        }
    });
});
//Edit
router.get("/:id/edit", middleware.checkCampgroundOwner, function (req, res) {
        Campground.findById(req.params.id, function (err, foundCampId) {
            res.render("campgrounds/edit", {curCamp: foundCampId});
        });
});


//Update
router.put("/:id", middleware.checkCampgroundOwner, function (req, res) {
    // var updateCamp = {name: req.body.name,
    //     image: req.body.image,
    //     description: req.body.description};
    Campground.findByIdAndUpdate(req.params.id, req.body.campInfo, function (err, updatedCamp) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + updatedCamp._id);
        }
    });
});
//Delete
router.delete("/:id", middleware.checkCampgroundOwner, function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err) {
        if (err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    })
});


module.exports = router;