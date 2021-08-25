"use strict";

const dateFormat = require("dateformat");
const { check, validationResult } = require("express-validator");
const Employee = require("../models/employee"),
	passport = require("passport"),
	getEmployeeParams = body => {
		return {
			name: {
				first: body.fname,
				last: body.lname
			},
			dob: body.dob,
			phoneNumber: body.pnumber,
			email: body.email,
			userType: body.userType,
			//password: body.password,  //No longer needed; now handled by Passport
			hireDate: body.hireDate
		};
	},
	getEditEmployeeParams = body => {
		return {
			name: {
				first: body.fname,
				last: body.lname
			},
			dob: body.dob,
			phoneNumber: body.pnumber,
			userType: body.userType,
			//password: body.password,  //No longer needed; now handled by Passport
			hireDate: body.hireDate
		};
	};

module.exports = {
	//get all employees detail
	index: (req, res, next) => {
		Employee.find().sort({hireDate: -1})
			.then(employees => {
				res.locals.employees = employees;
				next();
			})
			.catch(error => {
				console.log(`Error fetching employees: ${error.message}`);
				next(error);
			});
	},
	//employee view
	indexView: (req, res) => {
		res.render("employees/index", {
			formatedPostedDate: dateFormat
		});
	},

	//create view for new employee
	new: (req, res) => {
		res.render("employees/create");
	},

	//create new employee
	create: (req, res, next) => {
		console.log(req.skip)
		if (req.skip) next();
		let newEmployee = new Employee(getEmployeeParams(req.body));
		Employee.register(newEmployee, req.body.password, (e, employee) => {
			if (employee) {
				req.flash("success", `${employee.fullName}'s account created successfully!`);
				res.locals.redirect = "/employees";
				next();
			} else {
				req.flash("error", `Failed to create employee account because: ${e.message}.`);
				res.locals.redirect = "/employees/new";
				next();
			}
		});

	},

	//redirect view
	redirectView: (req, res, next) => {
		let redirectPath = res.locals.redirect;
		if (redirectPath !== undefined) res.redirect(redirectPath);
		else next();
	},

	//view to edit employee details
	edit: (req, res, next) => {
		let employeeId = req.params.id;
		Employee.findById(employeeId)
			.then(employee => {
				res.render("employees/edit", {
					employee: employee,
					formatedPostedDate: dateFormat
				});
			})
			.catch(error => {
				console.log(`Error fetching employee by ID: ${error.message}`);
				next(error);
			});
	},

	//update employee details to db
	update: (req, res, next) => {
		let employeeId = req.params.id,
			employeeParams = getEditEmployeeParams(req.body);

		Employee.findByIdAndUpdate(employeeId, {
			$set: employeeParams
		})
			.then(employee => {
				//res.locals.redirect = `/employees/${employeeId}`;
				res.locals.redirect = `/employees`;
				res.locals.employees = employee;
				next();
			})
			.catch(error => {
				console.log(`Error updating employee by ID: ${error.message}`);
				next(error);
			});
	},

	//delete employee
	delete: (req, res, next) => {
		let employeeId = req.params.id;
		Employee.findByIdAndRemove(employeeId)
			.then(() => {
				res.locals.redirect = "/employees";
				next();
			})
			.catch(error => {
				console.log(`Error deleting employee by ID: ${error.message}`);
				next();
			});
	},

	//show login view
	login: (req, res) => {
		if (req.session.auth) // if user is still authenticated
		{
			res.redirect('/');
		}
		else {
			res.render("employees/login");
		}
	},

	//validate employee details
	validate: async (req, res, next) => {

		await check("fname", "Enter first name").notEmpty().run(req);
		await check("lname", "Enter last name").notEmpty().run(req);
		await check("dob", "Enter dob").notEmpty().run(req);
		await check("pnumber", "Enter phone number").notEmpty().run(req);
		await check("email").not().isEmpty().isEmail().normalizeEmail().run(req);
		await check("email", "Email is invalid").isEmail().run(req);
		await check("password", "Password cannot be empty").notEmpty().run(req);
		await check("userType", "Enter user type").notEmpty().run(req);
		await check("hireDate", "Enter hire date").notEmpty().run(req);


		const error = validationResult(req);
		if (!error.isEmpty()) {
			let messages = error.array().map(e => e.msg);
			req.skip = true;
			req.flash("error", messages.join(" and "));
			res.locals.redirect = "/employees/new";

			next();

		} else {

			next();
		}

	},

	//authenticate employee login
	authenticate: passport.authenticate("local", {
		failureRedirect: "/employees/login",
		failureFlash: "Failed to login.",
		successRedirect: "/",
		successFlash: "Logged in!"
	}),

	//logout employee
	logout: (req, res, next) => {
		req.logout();
		req.flash("success", "You have been logged out!");
		res.locals.redirect = "/";
		next();
	},

	//verify authentication if user is logged in or not
	verifyAuthentication: (req, res, next) => {
		if (req.isAuthenticated()) {
			next();

		} else {
			req.flash("error", 'You must be signed in to view ${req.url}');
			res.redirect("/employees/login");
		}
	},
	
	//verify whether user is admin
	verifyAdmin: (req, res, next) => {
		if (req.user && req.user.isAdmin) {
			next();
		} else {
			res.send("Not authorized");
		}
	},

	//verify whether user is loggedIn
	verifyLoginUser: (req, res, next) => {
		if (req.user) {
			next();
		} else {
			res.send("Not authorized");
		}
	},
};
