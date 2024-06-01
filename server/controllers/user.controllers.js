const { STATUS_CODES } = require("http");
const userModel = require("../models/user.models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const conversationModel = require("../models/conversation");
const messageModel = require("../models/message");
const cors = require("cors");
const io = require("socket.io")(8080, {
  cors: {
    origin: "http://localhost:3000",
  },
});
// Web sockets
let users = [];
io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);
  socket.on("addUser", (userId) => {
    const isUserExisted = users.find((user) => user.userId === userId);
    if (!isUserExisted) {
      const user = { userId, socketId: socket.id };
      users.push(user);
      io.emit("getUsers", users);
    }
  });
  socket.on(
    "sendMessage",
    ({ receiverId, senderId, conversationId, message }) => {
      console.log("Message received:", {
        receiverId,
        senderId,
        conversationId,
        message,
      });
      const receiver = users.find((user) => user.userId === receiverId);
      const sender = users.find((user) => user.userId === senderId);
      if (sender) {
        io.to(sender.socketId).emit("getMessage", {
          senderId,
          receiverId,
          message,
          conversationId,
        });
      } else {
        console.log("Sender not found: ", senderId);
      }
      if (receiver) {
        io.to(receiver.socketId).emit("getMessage", {
          senderId,
          receiverId,
          message,
          conversationId,
        });
      } else {
        console.log("Receiver not found: ", receiverId);
      }
    }
  );
  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("getUsers", users);
  });
});

exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const isUserExisted = await userModel.findOne({ email });
    if (!email.includes("@")) {
      return res.status(403).json({
        statusCode: STATUS_CODES[403],
        message: "Provide valid email",
      });
    }
    if (isUserExisted) {
      return res.status(409).json({
        statusCode: STATUS_CODES[409],
        message: "Email is already existed into database",
      });
    }
    const newUser = await userModel({
      fullName,
      email,
      password,
    }).save();
    const token = await jwt.sign({ _id: newUser._id }, process.env.USER_SECRET);
    const options = {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: true,
    };
    res.cookie("token", token, options);
    return res.status(201).json({
      statusCode: STATUS_CODES[201],
      message: `${newUser.fullName} is registered.`,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: STATUS_CODES[500],
      message: error.message,
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isUserExisted = await userModel
      .findOne({ email })
      .select("+password");
    if (!email.includes("@")) {
      return res.status(403).json({
        statusCode: STATUS_CODES[403],
        message: "Provide valid email",
      });
    }
    if (!isUserExisted) {
      return res.status(404).json({
        statusCode: STATUS_CODES[404],
        message: "Email not found into database",
      });
    }
    const comparedPassword = await bcrypt.compare(
      password,
      isUserExisted.password
    );
    if (!comparedPassword) {
      return res.status(401).json({
        statusCode: STATUS_CODES[401],
        message: "Password is incorrect",
      });
    }
    const token = await jwt.sign(
      { _id: isUserExisted._id },
      process.env.USER_SECRET
    );
    const options = {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: true,
    };
    res.cookie("token", token, options);
    return res.status(201).json({
      statusCode: STATUS_CODES[201],
      message: `You logged in successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: STATUS_CODES[500],
      message: error.message,
    });
  }
};
exports.conversation = async (req, res) => {
  try {
    const receiverId = req.params.receiver_id;
    const senderId = req.signedInUser._id;

    if (!receiverId) {
      return res.status(404).json({
        statusCode: STATUS_CODES[404],
        message: "Receiver Id is missing",
      });
    }
    const existingConversation = await conversationModel.findOne({
      $or: [
        { "members.senderId": senderId, "members.receiverId": receiverId },
        { "members.senderId": receiverId, "members.receiverId": senderId },
      ],
    });
    if (existingConversation) {
      return res.status(200).json({
        statusCode: STATUS_CODES[200],
        message: "Conversation already exists",
        conversationId: existingConversation._id,
      });
    }
    const newConversation = await new conversationModel({
      members: { senderId, receiverId },
    }).save();
    return res.status(201).json({
      statusCode: STATUS_CODES[201],
      message: "Conversation created successfully",
      conversationId: newConversation._id,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: STATUS_CODES[500],
      message: error.message,
    });
  }
};
exports.loadCurrentUserConversation = async (req, res) => {
  try {
    const userId = req.signedInUser._id;
    const conversations = await conversationModel
      .find({
        $or: [{ "members.senderId": userId }, { "members.receiverId": userId }],
      })
      .populate("members.senderId", "fullName email")
      .populate("members.receiverId", "fullName email");
    const conversationsWithOtherUser = conversations.map((conversation) => {
      const otherUser =
        conversation.members.senderId._id.toString() === userId.toString()
          ? conversation.members.receiverId
          : conversation.members.senderId;
      return {
        conversationId: conversation._id,
        otherUser: {
          _id: otherUser._id,
          fullName: otherUser.fullName,
          email: otherUser.email,
        },
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      };
    });
    return res.status(200).json({
      statusCode: STATUS_CODES[200],
      conversations: conversationsWithOtherUser,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: STATUS_CODES[500],
      message: error.message,
    });
  }
};
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    await new messageModel({
      conversationId,
      senderId: req.signedInUser._id,
      message,
    }).save();
    return res.status(201).json({
      statusCode: STATUS_CODES[201],
      message: "Message sent!",
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: STATUS_CODES[500],
      message: error.message,
    });
  }
};
exports.loadCurrentUser = async (req, res) => {
  try {
    const currentUser = await userModel.findOne({ _id: req.signedInUser._id });
    return res.status(200).json({
      statusCode: STATUS_CODES[200],
      isAuthenticated: true,
      currentUser,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: STATUS_CODES[500],
      message: error.message,
    });
  }
};
exports.loadMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversation_id;
    if (!conversationId) {
      return res.status(404).json({
        statusCode: STATUS_CODES[404],
        message: "Conversation Id is missing",
      });
    }
    const messages = await messageModel
      .find({ conversationId })
      .populate("senderId");
    res.status(200).json({
      statusCode: STATUS_CODES[200],
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: STATUS_CODES[500],
      message: error.message,
    });
  }
};
exports.loadAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json({
      statusCode: STATUS_CODES[200],
      users,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: STATUS_CODES[500],
      message: error.message,
    });
  }
};
