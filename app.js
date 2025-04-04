const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
require("dotenv").config();
require("./helpers/init-mongodb");

const AuthRoute = require("./routes/auth");
const { verifyAccessToken } = require("./helpers/jwt-helper");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", verifyAccessToken, async (req, res, next) => {
  try {
    res.json("Hello, World!");
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", AuthRoute);

// Middleware for unknown routes
app.use(async (req, res, next) => {
  //   const error = new Error("Not Found");
  //   error.status = 404;
  //   next(error);
  next(createError.NotFound("This route does not exist"));
});

// Middleware for error handling
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      status: error.status || 500,
      message: error.message,
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
