"use strict";

const dateFormat = require("dateformat");
const Order = require("../models/order"),
	Product = require("../models/product"),
	Purchase = require("../models/purchase"),
	getOrderParams = body => {
		return {
			products: body.product,
			orderPersonName: body.OPersonName,
			orderDate: body.orderDate,
			orderPhoneNumber: body.pnumber,
			employeeId: 1
		};
	};

module.exports = {
	index: (req, res, next) => {
		Order.find().sort({orderDate: -1})
			.then(orders => {
				res.locals.orders = orders;
				next();
			})
			.catch(error => {
				console.log(`Error fetching orders: ${error.message}`);
				next(error);
			});
	},
	indexView: (req, res) => {
		res.render("order/index", {
			formatedPostedDate: dateFormat
		});
	},
	new: (req, res) => {
		res.render("order/create");
	},
	create: (req, res, next) => {
		console.log(req.body)
		let orderParams = getOrderParams(req.body);
		orderParams["employeeId"] = req.user._id;
		Order.create(orderParams)
			.then(orders => {
				let products = req.body.product;
				let count = products.length;
				products.forEach(p => {
					Product.findById(p._id)
						.then(product => {
							let productSale = parseInt(product.productSale) + parseInt(p.product_quantity);
							let productRemaining = product.productAvailable - p.product_quantity;
							Product.findByIdAndUpdate(product._id, { $set: { productSale: productSale, productAvailable: productRemaining } })
								.then(() => {
									count--;
									if (count === 0) {
										return;
									}
								})
								.then(() => {
									res.locals.redirect = "/order";
									next();
								})
								.catch(error => {
									console.log(`Error updating product: ${error.message}`);
									next(error);
								});
						});
				});

				//res.locals.redirect = "/order";
				//res.locals.orders = orders;
				//next();
			})
			.catch(error => {
				console.log(`Error saving purchase: ${error.message}`);
				next(error);
			});


	},
	search: async (req, res, next) => {
		try {
			let result = await Product.aggregate([
				{
					"$search": {
						"autocomplete": {
							"query": `${req.query.query}`,
							"path": "pName",
							"fuzzy": {
								"maxEdits": 2,
								"prefixLength": 3
							}
						}
					}
				}
			]);
			res.send(result);
		} catch (e) {
			res.status(500).send({ message: e.message });
		}
	},
	autoCompleteProduct: async (req, res, next) => {
		try {
			await Product.findOne({ _id: req.params.id })
				.then(product => {
					res.send(product);
				})
				.catch(error => {
					console.log(`Error fetching purchase: ${error.message}`);
					next(error);
				});

		} catch (e) {
			res.status(500).send({ message: e.message });
		}
	},
	invoice: (req, res, next) => {
		let orderId = req.params.id;
		Order.findById(orderId)
		  .then(order => {
			res.locals.order = order;
			next();
		  })
		  .catch(error => {
			console.log(`Error fetching order by ID: ${error.message}`);
			next(error);
		  });
	  },
	
	  invoiceView: (req, res) => {
		res.render("order/invoice");
	  },

	redirectView: (req, res, next) => {
		let redirectPath = res.locals.redirect;
		if (redirectPath !== undefined) res.redirect(redirectPath);
		else next();
	}
}