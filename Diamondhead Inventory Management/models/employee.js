"use strict";

const mongoose = require("mongoose"),
  { Schema } = require("mongoose"),
  passportLocalMongoose = require("passport-local-mongoose")
  

var employeeSchema = new Schema(
  {
    name: {
      first: {
        type: String,
        trim: true
      },
      last: {
        type: String,
        trim: true
      }
	},
	dob:{
		type:Date
	},
    email: {
      type: String,
      lowercase: true,
      unique: true
	},
	userType:{
		type:String
	},
    phoneNumber: {
      type: String
	},
	isAdmin:{
		type:Boolean,
		default:false
	},

    hireDate: {
        type: Date
    },
    // Password no longer needed since it is handled by Passport
    
    // password: {
    //   type: String,
    //   required: true
    // },
    // subscribedAccount: { type: Schema.Types.ObjectId, ref: "Subscriber" },
    // employees: [{ type: Schema.Types.ObjectId, ref: "Employee" }]
  },
  {
    timestamps: true
  }
);

employeeSchema.pre("save", function (next) {
	if(this.userType==="Admin"){
		this.isAdmin = true;
	}
	else{
		this.isAdmin = false;
	}
	next();
});

employeeSchema.virtual("fullName").get(function() {
  return `${this.name.first} ${this.name.last}`;
});

// plugging in package, passing in a configuration object. 
employeeSchema.plugin(passportLocalMongoose, {
  usernameField: "email"
});

module.exports = mongoose.model("Employee", employeeSchema);
