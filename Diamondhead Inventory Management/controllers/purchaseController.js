"use strict";

const dateFormat = require("dateformat");
const Product = require("../models/product");
const Purchase = require("../models/purchase"),
	getPurchaseParams = body => {
		return {
			productName: body.pName,
			quantity: body.pQuantity,
			productPerPrice: body.pPrice,
			purchaseDate: body.perchaseDate,
			productId: body.productId
		};
	},
	getPurchaseUpdateParams = body => {
		return {
			productName: body.pName,
			quantity: body.pQuantity,
			productPerPrice: body.pPrice,
			purchaseDate: body.perchaseDate,
			productId: body.productId,
			totalPrice: body.pQuantity * body.pPrice
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
						productPrice: { $divide: [{ $sum: "$totalPrice" }, { $sum: "$totalQuantity" }] }
					}
				}
			]
		)
			.then(purchases => {
				console.log("purchase index: ", purchases);
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
		res.render("purchase/create");
	},
	create: (req, res, next) => {
		let purchaseParams = getPurchaseParams(req.body);
		purchaseParams["employeeId"] = req.user._id;
		Purchase.create(purchaseParams)
			.then(purchases => {
				//console.log("Purchase:",purchases);
				return Product.findById(purchases.productId);
			})
			.then(product => {
				let productObject = {};
				let oldPrice = product.productCount * product.productAveragePrice;
				let newPrice = parseInt(req.body.pQuantity) * parseInt(req.body.pPrice);
				let totalProductCount = product.productCount + parseInt(req.body.pQuantity);
				let averagePrice = parseFloat((oldPrice + newPrice) / totalProductCount);
				let availableProductCount = totalProductCount - product.productSale;
				productObject["count"] = totalProductCount;
				productObject["averagePrice"] = averagePrice;
				productObject["availableProduct"] = availableProductCount;
				productObject["id"] = product._id;
				return productObject;
			})
			.then(productObject => {
				console.log(productObject);
				return Product.findByIdAndUpdate(productObject.id, { $set: { productCount: productObject.count, productAveragePrice: productObject.averagePrice, productAvailable: productObject.availableProduct } });
			})
			.then(product => {
				//res.locals.purchases = purchases;
				res.locals.redirect = "/purchase";
				next();
			}).catch(error => {
				console.log(`Error saving purchase: ${error.message}`);
				next(error);
			});
	},

	delete: (req, res, next) => {
		let purchaseId = req.params.id;
		Purchase.findByIdAndRemove(purchaseId)
			.then(purchases => {
				//console.log("Purchase:",purchases);
				Product.findById(purchases.productId)
					.then(product => {
						let productObject = {};
						let oldPrice = product.productCount * product.productAveragePrice;
						let newPrice = purchases.quantity * purchases.productPerPrice;
						let totalProductCount = product.productCount - purchases.quantity;
						let averagePrice = parseFloat((oldPrice - newPrice) / totalProductCount);
						let availableProductCount = totalProductCount - product.productSale;
						productObject["availableProduct"] = availableProductCount;
						productObject["count"] = totalProductCount;
						productObject["averagePrice"] = averagePrice;
						productObject["id"] = product._id;
						return productObject;
					})
					.then(productObject => {
						console.log(productObject);
						return Product.findByIdAndUpdate(productObject.id, { $set: { productCount: productObject.count, productAveragePrice: productObject.averagePrice, productAvailable: productObject.availableProduct } });
					})
					.then(product => {
						//res.locals.purchases = purchases;
						let productName = product.pName;
						res.locals.redirect = "/purchase/" + productName;
						next();
					}).catch(error => {
						console.log(`Error deleting purchase by ID: ${error.message}`);
						next(error);
					});
			});

	},

	edit: (req, res, next) => {
		let purchaseId = req.params.id;
		Purchase.findById(purchaseId)
			.then(purchase => {
				res.render("purchase/edit", {
					purchase: purchase,
					formatedPostedDate: dateFormat
				});
			})
			.catch(err => {
				console.log(`Error editing purchase by ID: ${err.message}`);
				next();
			});

	},
	// update: (req, res, next) => {
	// 	let purchaseId = req.params.id,
	// 		purchaseParams = getPurchaseParams(req.body);
	// 	Purchase.findByIdAndUpdate(purchaseId, purchaseParams)
	// 		.then(purchase => {
	// 			let productName = purchase.productName;
	// 			res.locals.redirect = "/purchase/" + productName;
	// 			next();
	// 		})
	// 		.catch(err => {
	// 			console.log(`Error updating purchase by ID: ${err.message}`);
	// 			next(error);
	// 		});

	// },
	update: (req, res, next) => {
		let purchaseId = req.params.id,
			purchaseParams = getPurchaseUpdateParams(req.body);
			purchaseParams["employeeId"] = req.user._id;
		Purchase.findByIdAndUpdate(purchaseId, purchaseParams)
			.then(purchase => {
				let productId = purchase.productId;
				Purchase.aggregate(
					[
						{ $match: { productName: purchase.productName } },
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
								productPrice: { $divide: [{ $sum: "$totalPrice" }, { $sum: "$totalQuantity" }] }

							}
						}
					]
				)
					.then(purchases => {
						let productAggregate = purchases[0];
						Product.findByIdAndUpdate(productId, { $set: { productCount: productAggregate.totalQuantity, productAveragePrice: productAggregate.productPrice } })
							.then((product) => {
								let available = productAggregate.totalQuantity - product.productSale;
								Product.findByIdAndUpdate(product._id, { $set: { productAvailable: available } })
									.then((product) => {
										let productName = product.pName;
										res.locals.redirect = "/purchase/" + productName;
										next();
									})
									.catch(error => {
										console.log(`Error fetching purchase: ${error.message}`);
										next(error);
									});
							})
							.catch(error => {
								console.log(`Error fetching product: ${error.message}`);
								next(error);
							});
					})

			});
	},

	show: (req, res, next) => {
		let pName = req.params.pName
		Purchase.find({ productName: pName }).sort({purchaseDate: -1})
			.then(purchases => {
				if (purchases === undefined || purchases.length == 0) {
					res.redirect("/purchase");
				}
				else {
					res.locals.purchases = purchases;
					next();
				}

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