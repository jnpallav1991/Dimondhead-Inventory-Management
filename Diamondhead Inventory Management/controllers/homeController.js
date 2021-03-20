"use strict";


module.exports = {

  logRequestPaths : (req, res, next) => {
    console.log(`request made to: ${req.url}`);
    next();
  },
  index : (req, res) => {
    res.render("index");
  }
};