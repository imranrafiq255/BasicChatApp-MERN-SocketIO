const { STATUS_CODES } = require("http");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.models");
const isUserAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        statusCode: STATUS_CODES[401],
        message: "Token missing, please login again!",
      });
    }
    const comparedToken = await jwt.verify(token, process.env.USER_SECRET);
    if (!comparedToken) {
      return res.status(401).json({
        statusCode: STATUS_CODES[401],
        message: "Token not verified, please login again!",
      });
    }
    const user = await userModel.findOne({ _id: comparedToken._id });
    if (!user) {
      res.clearCookie("token");
      return res.status(404).json({
        statusCode: STATUS_CODES[404],
        message: "User not found, please create an account!",
      });
    }
    req.signedInUser = user;
    next();
  } catch (error) {
    return res.status(500).json({
      statusCode: STATUS_CODES[500],
      message: error.message,
    });
  }
};

module.exports = isUserAuthenticated;
