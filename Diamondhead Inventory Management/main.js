"use strict";

const express = require("express"),
	app = express(),
	router = require("./routes/index"),
	layouts = require("express-ejs-layouts"),
	mongoose = require("mongoose"),
	methodOverride = require("method-override"),
	path = require("path"),
	passport = require("passport"),
	expressSession = require("express-session"),
	expressValidator = require("express-validator"),
	connectFlash = require("connect-flash"),
	Employee = require("./models/employee");
	require("dotenv").config();

// App Settings
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(layouts);
app.use(express.urlencoded({ extended: true }));
app.use(
	methodOverride("_method", {
		methods: ["POST", "GET"]
	})
);
app.use(express.json());
app.use(
	expressSession({
		secret: "secret_passcode",
		cookie: {
			maxAge: 4000000
		},
		resave: false,
		saveUninitialized: false
	})
);

//require connect mongo to store session in mongo databse 
//const MongoStore = require("connect-mongo");

mongoose.connect(
	process.env.MONGO_URI,
	{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }
);


// Set up session
// router.use(
// 	expressSession({
// 		secret: "secretCuisine123",
// 		cookie: {
// 			maxAge: 4000000
// 		},
// 		resave: false,
// 		saveUninitialized: false,
// 		//tell session to store its data in mongo databse that we connected to above
// 		store: MongoStore.create({ mongoUrl: "mongodb+srv://dbUser:dbUserPassword@gettingstarted.jauwg.mongodb.net/dimondhead?retryWrites=true&w=majority" })
// 	})
// );

app.use(passport.initialize());
app.use(passport.session());
passport.use(Employee.createStrategy());
passport.serializeUser(Employee.serializeUser());
passport.deserializeUser(Employee.deserializeUser());
app.use(connectFlash());

// Middleware function to attach user and flash info to res.locals for easy access in views
app.use((req, res, next) => {
	res.locals.loggedIn = req.isAuthenticated();
	res.locals.flashMessages = req.flash();
	res.locals.currentUser = req.user;
	next();
});

// ********  ROUTES ********

//router.use(homeController.logRequestPaths);

app.use("/", router);
 
// Start server
app.listen(app.get("port"), () => {
    console.log(`Server running at http://localhost:${app.get("port")}`);
  });