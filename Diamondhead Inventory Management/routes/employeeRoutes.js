"use strict";

const router = require("express").Router(),
	employeesController = require("../controllers/employeesController");

router.get("/login", employeesController.login);
router.post("/login", employeesController.authenticate);

router.use(employeesController.verifyLoginUser);
router.get("/logout", employeesController.logout, employeesController.redirectView);

router.use(employeesController.verifyAdmin);
router.get("/", employeesController.index, employeesController.indexView);
router.get("/create", employeesController.new);
router.post("/create", employeesController.validate, employeesController.create, employeesController.redirectView);
router.get("/:id/edit", employeesController.edit);
router.put("/:id/update", employeesController.update, employeesController.redirectView);
router.delete("/:id/delete", employeesController.delete, employeesController.redirectView);

module.exports = router;