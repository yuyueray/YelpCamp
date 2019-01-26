var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Campground = require("./models/campgrounds");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seed");
var methodOverride = require("method-override");

var indexRoutes      = require("./routes/index"),
    commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds");


mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser : true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
// seedDB();

app.use(require("express-session")({
    secret: "keyboardCat",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.use("/", indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

app.listen(5000, process.env.IP, function () {
    console.log("YC started.");
});