"use strict";

const router = require("express").Router(),
  employeeRoutes = require("./employeeRoutes"),
  orderRoutes = require("./orderRoutes"),
  productRoutes = require("./productRoutes"),
  purchaseRoutes = require("./purchaseRoutes"),
  airQualityRoute = require("./airQualityRoute"),
  errorRoutes = require("./errorRoutes"),
  apiRoutes = require("./apiRoutes"),
  homeRoutes = require("./homeRoutes");

router.use("/employees", employeeRoutes);
router.use("/order", orderRoutes);
router.use("/product", productRoutes);
router.use("/purchase", purchaseRoutes);
router.use("/airQuality", airQualityRoute);
router.use("/api", apiRoutes);
router.use("/", homeRoutes);
router.use("/", errorRoutes);

module.exports = router;
