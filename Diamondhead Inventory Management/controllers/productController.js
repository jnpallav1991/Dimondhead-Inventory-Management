"use strict";

const dateFormat = require("dateformat");
const Product = require("../models/product"),
getProductParams = body => {
    return {
      pName: body.pName,
      pBrand: body.pBrand,
      pDescription: body.pDescription,
      employeeId:1
    };
  };

module.exports = {
    index: (req, res, next) => {
        Product.find()
          .then(products => {
            res.locals.products = products;
            //console.log("Products",products);
            next();
          })
          .catch(error => {
            console.log(`Error fetching products: ${error.message}`);
            next(error);
          });
      },
      indexView: (req, res) => {
        res.render("product/index");
      },
      new:(req,res)=>{
        res.render("product/new");
      },
      create: (req, res, next) => {
        let productParams = getProductParams(req.body);
        Product.create(productParams)
          .then(product => {
            res.locals.redirect = "/product";
            res.locals.products = product;
            next();
          })
          .catch(error => {
            console.log(`Error saving product: ${error.message}`);
            next(error);
          });
      },

      delete:(req,res,next)=>{
        let productId = req.params.id;
        Product.findByIdAndRemove(productId)
        .then(()=>{
          res.locals.redirect = "/product";
          next();
        })
        .catch(err=>{
          console.log(`Error deleting product by ID: ${err.message}`);
          next();
        });
      },

      edit:(req,res,next)=>{
        let productId = req.params.id;
        Product.findById(productId)
        .then(product=>{
          console.log("PDescription:",product.pDescription);
          res.render("product/edit", {
            product: product
          });
        })
        .catch(err=>{
          console.log(`Error editing product by ID: ${err.message}`);
          next();
        });

      },
      update:(req,res,next)=>{
        let productId = req.params.id,
        productParams = getProductParams(req.body);
        Product.findByIdAndUpdate(productId,productParams)
        .then(product=>{
          res.locals.redirect = "/product";
          res.locals.products = product;
          next();
        })
        .catch(err=>{
          console.log(`Error updating product by ID: ${err.message}`);
          next(error);
        });

      },
      redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath !== undefined) res.redirect(redirectPath);
        else next();
      }
}