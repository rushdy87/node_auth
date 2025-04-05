const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const connectRedis = require("./init_redis");

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

  signRefreshToken: async (userId) => {
    try {
      const payload = {};
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: "1y",
        issuer: "node_auth",
        audience: userId.toString(),
      };

      const token = JWT.sign(payload, secret, options); // sync in most cases unless you use RS256

      const redisClient = await connectRedis();
      // Redis v4 uses promises
      await redisClient.set(userId.toString(), token, {
        EX: 365 * 24 * 60 * 60, // 1 year in seconds
      });

      return token;
    } catch (err) {
      console.error("Error in signRefreshToken:", err);
      throw createError.InternalServerError();
    }
  },
  verifyRefreshToken: async (token) => {
    try {
      if (!token) {
        throw createError.Unauthorized();
      }
      const payload = JWT.verify(token, process.env.REFRESH_TOKEN_SECRET);
      if (!payload) {
        throw createError.Unauthorized();
      }
      const redisClient = await connectRedis();
      const userId = payload.aud;
      const result = await redisClient.get(userId.toString());
      if (!result) {
        throw createError.Unauthorized();
      }
      if (result !== token) {
        throw createError.Unauthorized();
      }
      // Token is valid and matches the one in Redis
      return userId;
    } catch (err) {
      console.error("Error in verifyRefreshToken:", err);
      throw createError.Unauthorized();
    }
  },
};
