"use strict";

const router = require("express").Router(),
	productController = require("../controllers/productController"),
	employeesController=require("../controllers/employeesController");


router.use(employeesController.verifyLoginUser);
router.get("/", productController.index, productController.indexView);
router.use(employeesController.verifyAdmin);
router.get("/create", productController.new);
router.post("/create", productController.create, productController.redirectView);
router.get("/:id/edit", productController.edit);
router.put("/:id/update", productController.update, productController.redirectView)
router.delete("/:id/delete", productController.delete, productController.redirectView);


module.exports = router;