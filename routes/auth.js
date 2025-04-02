const express = require("express");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  res.json("Register route");
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
