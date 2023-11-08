const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User Already Exists");
    // res.json({
    //   msg: "User Already Exists",
    //   success: false,
    // });
  }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      module: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

//Update User
const updateUser = asyncHandler(async (req, res) => {
  console.log(req.user);
  const { _id } = req.user;
  try {
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        mobile: req.body.mobile,
      },
      {
        new: true,
      }
    );
    res.json({ updateUser });
  } catch (err) {
    throw new Error(err);
  }
});

// Get all users
const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (err) {
    throw new Error(err);
  }
});

// get a single user
const getASingleUser = asyncHandler(async (req, res) => {
  const { id } = req.user;
  try {
    const aUser = await User.findById(id);
    res.json({ aUser });
  } catch (err) {
    throw new Error(err);
  }
});

// Delete user
const deleteAUser = asyncHandler(async (req, res) => {
  const { id } = req.user;
  try {
    const userDelete = await User.findByIdAndDelete(id);
    res.json({ userDelete });
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createUser,
  loginUserCtrl,
  getAllUser,
  getASingleUser,
  deleteAUser,
  updateUser,
};
