"use strict";

const express = require("express"),
	app = express(),
	router = express.Router(),
	layouts = require("express-ejs-layouts"),
	mongoose = require("mongoose"),
	methodOverride = require("method-override"),
	passport = require("passport"),
	expressSession = require("express-session"),
	expressValidator = require("express-validator"),
	connectFlash = require("connect-flash"),
	errorController = require("./controllers/errorController"),
	homeController = require("./controllers/homeController"),
	productController = require('./controllers/productController'),
	purchaseController = require('./controllers/purchaseController'),
	employeesController = require("./controllers/employeesController"),
	Employee = require("./models/employee");


//require connect mongo to store session in mongo databse 
const MongoStore = require("connect-mongo");

mongoose.connect(
	"mongodb+srv://dbUser:dbUserPassword@gettingstarted.jauwg.mongodb.net/dimondhead?retryWrites=true&w=majority",
	{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }
);

// ********  APP SETTINGS ********

app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");

// ********  APP MIDDLEWARE ********

router.use(methodOverride("_method", { methods: ["POST", "GET"] }));
router.use(layouts);
router.use(express.static("public"));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

// Set up session
router.use(
	expressSession({
		secret: "secretCuisine123",
		cookie: {
			maxAge: 4000000
		},
		resave: false,
		saveUninitialized: false,
		//tell session to store its data in mongo databse that we connected to above
		store: MongoStore.create({ mongoUrl: "mongodb+srv://dbUser:dbUserPassword@gettingstarted.jauwg.mongodb.net/dimondhead?retryWrites=true&w=majority" })
	})
);

// Flash mesagges
router.use(connectFlash());

// Configure Passport
router.use(passport.initialize());
router.use(passport.session());
passport.use(Employee.createStrategy());
passport.serializeUser(Employee.serializeUser());
passport.deserializeUser(Employee.deserializeUser());

// Middleware function to attach user and flash info to res.locals for easy access in views
router.use((req, res, next) => {
	res.locals.loggedIn = req.isAuthenticated();
	console.log("User Authenticated:", req.isAuthenticated())
	//res.locals.currentUser = req.user;
	//console.log("User details: ", req.user);
	//console.log("Session data:", req.session);
	res.locals.flashMessages = req.flash();
	console.log("Flash message: ", res.locals.flashMessages);
	next();
});

// ********  ROUTES ********

router.use(homeController.logRequestPaths);

router.get("/", homeController.index);

//Employee routes
router.get("/employees", employeesController.index, employeesController.indexView);
router.get("/employees/new", employeesController.new);
router.post("/employees/create", employeesController.validate, employeesController.create, employeesController.redirectView);
//router.get("/employees/login", employeesController.login);
//router.get("/employees/logout", employeesController.logout, employeesController.redirectView);
router.get("/employees/:id/edit", employeesController.edit);
router.put("/employees/:id/update", employeesController.update, employeesController.redirectView);
router.get("/employees/:id", employeesController.show, employeesController.showView);
router.delete("/employees/:id/delete", employeesController.delete, employeesController.redirectView);

//Product routes
router.get("/product", productController.index, productController.indexView);
router.get("/product/new", productController.new);
router.post("/product/create", productController.create, productController.redirectView);
router.get("/product/:id/edit", productController.edit);
router.put("/product/:id/update", productController.update, productController.redirectView)
router.delete("/product/:id/delete", productController.delete, productController.redirectView);

//Purchase routes
router.get("/purchase", purchaseController.index, purchaseController.indexView);
router.get("/purchase/new", purchaseController.new);
router.post("/purchase/create", purchaseController.create, purchaseController.redirectView);
router.get("/purchase/:id/edit", purchaseController.edit);
router.put("/purchase/:id/update", purchaseController.update)
router.delete("/purchase/:id/delete", purchaseController.delete, purchaseController.redirectView);
router.get("/purchase/:pName", purchaseController.show, purchaseController.showView);

// Error-handling routes
router.use(errorController.logErrors);
router.use(errorController.respondNoResourceFound);
router.use(errorController.respondInternalError);

// Mount router as app middleware
app.use("/", router);

// Launch app
app.listen(app.get("port"), () => {
	console.log(`Server running at http://localhost:${app.get("port")}`);
});