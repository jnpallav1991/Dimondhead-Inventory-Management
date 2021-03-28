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
	index: (req, res, next) => {
		Employee.find()
			.then(employees => {
				res.locals.employees = employees;
				next();
			})
			.catch(error => {
				console.log(`Error fetching employees: ${error.message}`);
				next(error);
			});
	},
	indexView: (req, res) => {
		res.render("employees/index", {
			formatedPostedDate: dateFormat
		});
	},

	new: (req, res) => {
		res.render("employees/new");
	},

	create: (req, res, next) => {
		console.log(req.skip)
		if (req.skip)next();
		console.log("Print new employee 1")
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
		console.log("Print new employee 2")
	},

	redirectView: (req, res, next) => {
		let redirectPath = res.locals.redirect;
		if (redirectPath !== undefined) res.redirect(redirectPath);
		else next();
	},

	show: (req, res, next) => {
		let employeeId = req.params.id;
		Employee.findById(employeeId)
			.then(employee => {
				res.locals.employee = employee;
				next();
			})
			.catch(error => {
				console.log(`Error fetching employee by ID: ${error.message}`);
				next(error);
			});
	},

	showView: (req, res) => {
		res.render("employees/show");
	},

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

	login: (req, res) => {
		res.render("employees/login");
	},

	validate: async (req, res, next) => {
		console.log("Print new employee 3")
		await check("fname", "Enter first name").notEmpty().run(req);
		await check("lname", "Enter last name").notEmpty().run(req);
		await check("dob", "Enter dob").notEmpty().run(req);
		await check("pnumber", "Enter phone number").notEmpty().run(req);
		await check("email").not().isEmpty().isEmail().normalizeEmail().run(req);
		await check("email", "Email is invalid").isEmail().run(req);
		await check("password", "Password cannot be empty").notEmpty().run(req);
		await check("userType", "Enter user type").notEmpty().run(req);
		await check("hireDate", "Enter hire date").notEmpty().run(req);

		console.log("Print new employee 4")
		const error = validationResult(req);
		if (!error.isEmpty()) {
			let messages = error.array().map(e => e.msg);
			req.skip = true;
			req.flash("error", messages.join(" and "));
			res.locals.redirect = "/employees/new";
			console.log("Print new employee 5")
			next();
			
		} else {
			console.log("Print new employee 6")
			next();
		}

	},

	authenticate: passport.authenticate("local", {
		failureRedirect: "/employees/login",
		failureFlash: "Failed to login.",
		successRedirect: "/",
		successFlash: "Logged in!"
	}),

	logout: (req, res, next) => {
		req.logout();
		req.flash("success", "You have been logged out!");
		res.locals.redirect = "/";
		next();
	},

	verifyAuthentication: (req, res, next) => {
		if (req.isAuthenticated()) {
			next();

		} else {
			req.flash("error", 'You must be signed in to view ${req.url}');
			res.redirect("/employees/login");
		}
	}
};
