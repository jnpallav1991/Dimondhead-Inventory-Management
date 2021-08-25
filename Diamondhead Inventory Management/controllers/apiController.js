"use strict";

const httpStatus = require("http-status-codes");
const jsonWebToken = require("jsonwebtoken");
const Employee = require("../models/employee"),
	passport = require("passport");
module.exports = {

	errorJSON: (error, req, res, next) => {
		let errorObject;
		if (error) {
			errorObject = {
				status: httpStatus.INTERNAL_SERVER_ERROR,
				message: error.message
			};
		} else {
			errorObject = {
				status: httpStatus.INTERNAL_SERVER_ERROR,
				message: "Unknown Error."
			};
		}
		res.json(errorObject);
	},
	apiAuthenticate: (req, res, next) => {
		passport.authenticate("local", (errors, user) => {
			if (user) {
				let signedToken = jsonWebToken.sign(
					{
						data: user._id,
						exp: new Date().setDate(new Date().getDate() + 1)
					},
					"secret_encoding_passphrase"
				);
				res.json({
					success: true,
					token: signedToken
				});
			} else
				res.json({
					success: false,
					message: "Could not authenticate user."
				});
		})(req, res, next);
	},
	verifyJWT: (req, res, next) => {
		let token = req.headers.token;
		if (token) {
			jsonWebToken.verify(token, "secret_encoding_passphrase", (errors, payload) => {
				if (payload) {
					Employee.findById(payload.data).then(user => {
						if (user) {
							next();
						} else {
							res.status(httpStatus.FORBIDDEN).json({
								error: true,
								message: "No User account found."
							});
						}
					});
				} else {
					res.status(httpStatus.UNAUTHORIZED).json({
						error: true,
						message: "Cannot verify API token."
					});
					next();
				}
			});
		} else {
			res.status(httpStatus.UNAUTHORIZED).json({
				error: true,
				message: "Provide Token"
			});
		}
	},
}
