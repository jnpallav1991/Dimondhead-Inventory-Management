"use strict";

const dateFormat = require("dateformat");
const Purchase = require("../models/purchase"),
	getPurchaseParams = body => {
		return {
			productName: body.pName,
			quantity: body.pQuantity,
			productPerPrice: body.pPrice,
			purchaseDate: body.perchaseDate,
			employeeId: 1
		};
	};

module.exports = {
	index: (req, res, next) => {
		Purchase.aggregate(
			[
				{
					$group: {
						_id: "$productName",
						totalQuantity: { $sum: "$quantity" },
						totalPrice: { $sum: "$totalPrice" },
						count: { $sum: 1 }
					}
				},
				{
					$addFields: {
						productPrice: { $divide: [ { $sum: "$totalPrice" }, { $sum: "$totalQuantity" } ] }
					}
				}
			]
		)
			.then(purchases => {
				console.log("purchase: ", purchases);
				res.locals.purchases = purchases;
				next();
			})
			.catch(error => {
				console.log(`Error fetching purchase: ${error.message}`);
				next(error);
			});
	},
	indexView: (req, res) => {
		res.render("purchase/index");
	},
	new: (req, res) => {
		res.render("purchase/new");
	},
	create: (req, res, next) => {
		let purchaseParams = getPurchaseParams(req.body);
		Purchase.create(purchaseParams)
			.then(purchases => {
				res.locals.redirect = "/purchase";
				res.locals.purchases = purchases;
				next();
			})
			.catch(error => {
				console.log(`Error saving purchase: ${error.message}`);
				next(error);
			});
	},

	delete: (req, res, next) => {
		let purchaseId = req.params.id;
		Purchase.findByIdAndRemove(purchaseId)
			.then(() => {
				console.log("Delete");
				//res.locals.redirect = "/purchase";
				res.locals.redirect = "purchase/detail";
				next();
			})
			.catch(err => {
				console.log(`Error deleting purchase by ID: ${err.message}`);
				next();
			});
	},

	edit: (req, res, next) => {
		let purchaseId = req.params.id;
		Purchase.findById(purchaseId)
			.then(purchase => {
				res.render("purchase/edit", {
					purchase: purchase
				});
			})
			.catch(err => {
				console.log(`Error editing purchase by ID: ${err.message}`);
				next();
			});

	},
	update: (req, res, next) => {
		let purchaseId = req.params.id,
			purchaseParams = getPurchaseParams(req.body);
		Purchase.findByIdAndUpdate(purchaseId, purchaseParams)
			.then(purchases => {
				res.locals.redirect = "/purchase";
				res.locals.purchases = purchases;
			})
			.catch(err => {
				console.log(`Error updating purchase by ID: ${err.message}`);
				next(error);
			});

	},

	show: (req, res, next) => {
		let pName = req.params.pName
		Purchase.find({ productName: pName })
			.then(purchases => {
				console.log("purchase: ",purchases)
				res.locals.purchases = purchases;
				next();
			})
			.catch(err => {
				console.log(`Error showing purchase by name: ${err.message}`);
				next();
			});
	},

	showView: (req, res, next) => {
		res.render("purchase/detail", {
			formatedPostedDate: dateFormat
		});
	},

	redirectView: (req, res, next) => {
		let redirectPath = res.locals.redirect;
		if (redirectPath !== undefined) res.redirect(redirectPath);
		else next();
	}
}