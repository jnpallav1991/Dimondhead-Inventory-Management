"use strict";

const router = require("express").Router(),
	productController = require("../controllers/productController"),
	apiController = require("../controllers/apiController");

router.post("/login", apiController.apiAuthenticate);
router.use(apiController.verifyJWT);
router.get(
	"/product",
	productController.index,
	productController.respondJSON
);

router.use(productController.errorJSON);

module.exports = router;



