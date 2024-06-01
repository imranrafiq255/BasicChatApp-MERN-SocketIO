const express = require("express");
const {
  register,
  login,
  conversation,
  loadCurrentUserConversation,
  sendMessage,
  loadCurrentUser,
  loadMessages,
  loadAllUsers,
} = require("../controllers/user.controllers");
const isUserAuthenticated = require("../middlewares/isUserAuthenticated");

const Router = express.Router();
Router.route("/register").post(register);
Router.route("/login").post(login);
Router.route("/conversation/:receiver_id").get(
  isUserAuthenticated,
  conversation
);
Router.route("/load-current-user-conversation").get(
  isUserAuthenticated,
  loadCurrentUserConversation
);
Router.route("/send-message").post(isUserAuthenticated, sendMessage);
Router.route("/load-current-user").get(isUserAuthenticated, loadCurrentUser);
Router.route("/load-messages/:conversation_id").get(
  isUserAuthenticated,
  loadMessages
);
Router.route("/load-all-users").get(isUserAuthenticated, loadAllUsers);
module.exports = Router;
