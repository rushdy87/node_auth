const JWT = require("jsonwebtoken");
const createError = require("http-errors");

module.exports = {
  signAccessToken: (userId) => {
    console.log(userId);

    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: "15m",
        issuer: "node_auth",
        audience: userId.toString(),
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.error(err);
          reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },
  verifyAccessToken: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(createError.Unauthorized());
    }
    const token = authHeader.split(" ")[1];

    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        const message =
          err.message === "JsonWebTokenError" ? "Unauthorized" : err.message;
        return next(createError.Unauthorized(message));
      }
      req.payload = payload;
      next();
    });
  },

  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: "1y",
        issuer: "node_auth",
        audience: userId.toString(),
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.error(err);
          reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },
  verifyRefreshToken: (token) => {
    return new Promise((resolve, reject) => {
      JWT.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) {
          return reject(createError.Unauthorized());
        }
        const userId = payload.aud;
        resolve(userId);
      });
    });
  },
};
