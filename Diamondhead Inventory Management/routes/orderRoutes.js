"use strict";

const router = require("express").Router(),
	orderController = require("../controllers/orderController"),
	employeesController=require("../controllers/employeesController");


router.use(employeesController.verifyLoginUser);
router.get("/", orderController.index, orderController.indexView);

router.get("/create", orderController.new);
router.get("/search", orderController.search);
router.get("/get/:id", orderController.autoCompleteProduct);
router.post("/create", orderController.create, orderController.redirectView);
router.get("/:id", orderController.invoice, orderController.invoiceView);

module.exports = router;