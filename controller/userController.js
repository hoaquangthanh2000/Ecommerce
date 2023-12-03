const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailController");

// Create User
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
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser?._id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
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

//Handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({
    refreshToken,
  });
  if (!user) {
    throw new Error("No Refresh token present in db or matched");
  }
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user.id);
    res.json({ accessToken });
  });
});

// Logout functionally
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user1 = await User.findOne({ refreshToken });
  if (!user1) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.status(204); // forbidden
  }
  await User.findByIdAndUpdate(user1.id, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.sendStatus(204); // forbidden
});

//Update User
const updateUser = asyncHandler(async (req, res) => {
  console.log(req.user);
  const { _id } = req.user;
  validateMongoDbId(_id);
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
  const { id } = req.params;
  validateMongoDbId(id);
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
  validateMongoDbId(id);
  try {
    const userDelete = await User.findByIdAndDelete(id);
    res.json({ userDelete });
  } catch (err) {
    throw new Error(err);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const blockUser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json(blockUser);
  } catch (err) {
    throw new Error(err);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User UnBlocked",
    });
  } catch (err) {
    throw new Error(err);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, please follow this link to reset Your Password . This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password${token}'>Click Here.<a/>`;
    const data = {
      to: email,
      text: "hey user",
      subject: "Forgot password link",
      htm: resetURL,
    };
    console.log("data", data);
    sendEmail(data);
    res.json(token);
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
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPassword,
};
