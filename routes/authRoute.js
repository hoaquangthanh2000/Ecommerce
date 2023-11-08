const express = require("express");
const {
  createUser,
  loginUserCtrl,
  getAllUser,
  getASingleUser,
} = require("../controller/userController");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.get("/all-users", getAllUser);
router.get("/:id", getASingleUser);
module.exports = router;
