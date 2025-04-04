const express = require("express");
const createError = require("http-errors");

const User = require("../models/user");
const { authSchema } = require("../helpers/validation-schema");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt-helper");

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
    const refreshToken = await signRefreshToken(user._id);

    // Send response
    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error.isJoi) {
      error.status = 422;
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);

    const user = await User.findOne({ email: result.email });
    if (!user) {
      throw createError.NotFound("User not found");
    }

    const isMatch = await user.isValidPassword(result.password);
    if (!isMatch) {
      throw createError.Unauthorized("Invalid username or password");
    }

    const accessToken = await signAccessToken(user._id);
    const refreshToken = await signRefreshToken(user._id);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error.isJoi) {
      next(createError.BadRequest("Invalid username or password"));
    }
    next(error);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(createError.BadRequest("Refresh token is required"));
  }

  try {
    const userId = await verifyRefreshToken(refreshToken);
    const accessToken = await signAccessToken(userId);
    const newRefreshToken = await signRefreshToken(userId);

    res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/logout", async (req, res, next) => {
  res.json("Logout route");
});

module.exports = router;
