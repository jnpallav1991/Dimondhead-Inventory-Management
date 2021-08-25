"use strict";

const router = require("express").Router(),
	airQualityController = require("../controllers/airQualityController");


router.get("/", airQualityController.airQuality);
router.post("/search",airQualityController.airQualitySearch,airQualityController.airQualityView);

module.exports = router;
