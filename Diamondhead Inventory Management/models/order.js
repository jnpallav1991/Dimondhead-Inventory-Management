"use strict";

const mongoose = require("mongoose"),
	{ Schema } = require("mongoose");

	// Schema for an order item
// No explicit model is created using this schema
// Instead, it is used as a type in the orderSchema
const orderProductSchema = new mongoose.Schema({

    // Explicitly define the _id property, since we will pass in the existing ID of the course
    _id: {
        type: String,
        required: true
    },
    product_name: {
        type: String,
        required: true
    },
    product_price: {
        type: String,
        required: true
	},
    product_quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    }
});

// Virtual attribute for extended price (price * quantity)
orderProductSchema.virtual("extendedPrice").get(function () {
	let p = this.product_price.replace("$","")
    return parseFloat(p) * this.product_quantity;
});

orderProductSchema.virtual("price_product").get(function () {
	return parseFloat(this.product_price.replace("$",""))
});

var orderSchema = new Schema(
	{
		products: [{
			type: orderProductSchema,
			required: true
		}],
		orderPersonName: {
			type: String,
			required: true
		},
		orderDate: {
			type: Date,
			default: Date.now
		},
		orderPhoneNumber: {
			type: String,
			required: true
		},
		totalPrice: {
			type: Number
		},
		employeeId: {
			type: Schema.Types.ObjectId,
			ref: "Employee"
		}
	},
	{
		timestamps: true
	}
);

orderSchema.pre("save", function (next) {
	let products = this.products;
	let totalPrice=0;
	products.forEach(product => {
		let p = product.product_price.replace("$","")
		let total = parseFloat(p) * parseInt(product.product_quantity);
		totalPrice+= parseInt(total);
	});
	this.totalPrice = totalPrice;
	next();


});

module.exports = mongoose.model("Order", orderSchema);