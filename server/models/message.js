const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "conversationId required"],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "senderId required"],
    },
    message: {
      type: String,
      required: [true, "message required"],
    },
  },
  { timestamps: true }
);

const messageModel = mongoose.model("Message", messageSchema);

module.exports = messageModel;
