"use strict";

const mongoose = require("mongoose"),
  { Schema } = require("mongoose");

var productSchema = new Schema(
    {
        pName: {
            type: String,
            required: true,
            unique: true
        },
        pBrand: {
            type: String,
            required: true
        },
        pDescription: {
            type: String,
            required: true
        },
        employeeId: {
			type: Schema.Types.ObjectId,
			ref: "Employee"
		},
		productCount:{
			type:Number,
			default:0
		},
		productSale:{
			type:Number,
			default:0
		},
		productAvailable:{
			type:Number,
			default:0
		},
		productAveragePrice:{
			type:Number,
			default:0
		}
    },
    {
    timestamps: true
    }
);

module.exports = mongoose.model("Product", productSchema);