
var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var middleware = require("../middleware/index");
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'ahsokaspace',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//show all camps OR searching results
router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        var regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({name: {"$regex": regex, "$options": "i"}}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else {
                if(allCampgrounds.length < 1) {
                    noMatch = "No campgrounds match that query, please try again.";
                }
                res.render("campgrounds/index",{camps : allCampgrounds, currentUser : req.user, page: "campgrounds", noMatch: noMatch});
            }
        });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else {
                res.render("campgrounds/index",{camps : allCampgrounds, currentUser : req.user, page: "campgrounds", noMatch: noMatch});
            }
        });
    }
});

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property
        var image = result.secure_url;
        var name = req.body.campName;
        var price = req.body.campPrice;
        var desc = req.body.campDesc;
        var author = {
            id: req.user._id,
            username: req.user.username
        };
        var newCamp = {name: name, price: price, image: image, description : desc, author: author};
        Campground.create(newCamp, function (err, newAdded) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/campgrounds/' + newAdded.id);
        });
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
router.put("/:id", middleware.checkCampgroundOwner, upload.single('image'), function (req, res) {
    // var updateCamp = {name: req.body.name,
    //     image: req.body.image,
    //     description: req.body.description};
    cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.campInfo.image = result.secure_url;
        Campground.findByIdAndUpdate(req.params.id, req.body.campInfo, function (err, updatedCamp) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            } else {
                req.flash("success", "Update success :)");
                res.redirect("/campgrounds/" + updatedCamp._id);
            }
        });
    });

});

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {

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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;