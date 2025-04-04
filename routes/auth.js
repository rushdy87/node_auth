const express = require("express");
const createError = require("http-errors");

const User = require("../models/user");
const { authSchema } = require("../helpers/validation-schema");
const { signAccessToken } = require("../helpers/jwt-helper");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  const result = await authSchema.validateAsync(req.body);

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: result.email });

    if (existingUser) {
      throw createError.Conflict(
        `User with email ${result.email} already exists`
      );
    }

    // Create new user
    const newUser = new User(result);
    const user = await newUser.save();

    const accessToken = await signAccessToken(user._id);

    // Send response
    res
      .status(201)
      .json({ message: "User registered successfully", accessToken });
  } catch (error) {
    if (error.isJoi) {
      error.status = 422;
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  res.json("Login route");
});

router.post("/refresh-token", async (req, res, next) => {
  res.json("Refresh token route");
});

router.delete("/logout", async (req, res, next) => {
  res.json("Logout route");
});

module.exports = router;
