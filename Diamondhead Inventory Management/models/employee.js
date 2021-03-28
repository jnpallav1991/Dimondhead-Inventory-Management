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

employeeSchema.virtual("fullName").get(function() {
  return `${this.name.first} ${this.name.last}`;
});


// pre save hook. creating a hook, operation that will occur before something else 
// going to occur before the save operation. 
//checking to see if there is a subscriber account with the same email. if so associate it. 
// employeeSchema.pre("save", function(next) {
//   let employee = this;
//   if (employee.subscribedAccount === undefined) {
//     Subscriber.findOne({
//       email: employee.email
//     })
//       .then(subscriber => {
//         employee.subscribedAccount = subscriber;
//         next();
//       })
//       .catch(error => {
//         console.log(`Error in connecting subscriber: ${error.message}`);
//         next(error);
//       });
//   } else {
//     next();
//   }
// });


// plugging in package, passing in a configuration object. 
employeeSchema.plugin(passportLocalMongoose, {
  usernameField: "email"
});

module.exports = mongoose.model("Employee", employeeSchema);
