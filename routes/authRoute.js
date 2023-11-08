const express = require("express");
const {
  createUser,
  loginUserCtrl,
  getAllUser,
  getASingleUser,
  deleteAUser,
  updateUser,
} = require("../controller/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.get("/all-users", authMiddleware, getAllUser);
router.get("/:id", authMiddleware, isAdmin, getASingleUser);
router.delete("/:id", authMiddleware, isAdmin, deleteAUser);
router.put("/edit-user", authMiddleware, updateUser);
module.exports = router;
