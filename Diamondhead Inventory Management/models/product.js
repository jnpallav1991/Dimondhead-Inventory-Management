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
        employeeId:{
            type: Number,
            required: true
        }
    },
    {
    timestamps: true
    }
);




module.exports = mongoose.model("Product", productSchema);