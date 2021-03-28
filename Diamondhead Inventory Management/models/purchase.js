"use strict";

const mongoose = require("mongoose"),
	{ Schema } = require("mongoose");

var purchaseSchema = new Schema(
	{
		productName: {
			type: String,
			required: true
		},
		quantity: {
			type: Number,
			default: 1,
			min: [1, "Enter product quantity"]
		},
		productPerPrice: {
			type: Number,
			default: 0,
			min: [0, "Enter product price"]
		},
		totalPrice: {
			type: Number
		},
		purchaseDate: {
			type: Date,
			default: Date.now
		},
		employeeId: {
			type: Number,
			required: true
		}
	},
	{
		timestamps: true
	}
);

purchaseSchema.virtual("productStatus").get(function () {
	if (this.productQuantity !== 0) {
		return "Available";
	}
	else {
		return "Out of Stock";
	}

});

purchaseSchema.pre("save", function (next) {
	this.totalPrice = this.quantity * this.productPerPrice;
	next();


});

module.exports = mongoose.model("Purchase", purchaseSchema);