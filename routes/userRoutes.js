const express = require("express");
const userController = require("../controllers/userController");
const { route } = require("../app");
const router = express.Router();

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get(
  "/getAllUsers",
  userController.protect,
  userController.restricTo("admin"),
  userController.getAllUser
);
router.patch(
  "/updateuser/:id",
  userController.protect,
  userController.restricTo("admin"),
  userController.updateUser
);
router.delete(
  "/deleteuser/:id",
  userController.protect,
  userController.restricTo("admin"),
  userController.deleteUser
);
router.get("/getme", userController.protect, userController.getme);
router.patch(
  "/updateme",
  userController.protect,
  userController.uploadUserPhoto,
  userController.updateMe
);
router.delete("/deleteme", userController.protect, userController.deleteme);

module.exports = router;
