"use strict";

const router = require("express").Router(),
	purchaseController = require("../controllers/purchaseController"),
	employeesController = require("../controllers/employeesController");


router.use(employeesController.verifyLoginUser);
router.get("/", purchaseController.index, purchaseController.indexView);
router.get("/create", purchaseController.new);
router.post("/create", purchaseController.create, purchaseController.redirectView);
router.get("/:id/edit", purchaseController.edit);
router.put("/:id/update", purchaseController.update, purchaseController.redirectView)
router.delete("/:id/delete", purchaseController.delete, purchaseController.redirectView);
router.get("/:pName", purchaseController.show, purchaseController.showView);

module.exports = router;