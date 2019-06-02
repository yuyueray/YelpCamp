var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Campground = require("./models/campgrounds");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seed");
var methodOverride = require("method-override");

// configure dotenv
require('dotenv').config();

var indexRoutes      = require("./routes/index"),
    commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds");

var dbURI = process.env.MONGOATLAS_URI || "mongodb://localhost:27017/yelp_camp";
// mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser : true});
mongoose.connect(dbURI, {useNewUrlParser: true}).catch(function (reason) { console.log(reason) });
    // .then(() => console.log("DB connected")).catch(err => console.log("DB error: ${err.message}"));


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(cookieParser('secret'));


app.use(require("express-session")({
    secret: "keyboardCat",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.locals.moment = require('moment');

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(5000, process.env.IP, function () {
    console.log("YC started.");
});