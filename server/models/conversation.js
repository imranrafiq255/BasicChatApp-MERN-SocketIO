const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema(
  {
    members: {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  { timestamps: true }
);

const conversationModel = mongoose.model("Conversation", conversationSchema);

module.exports = conversationModel;
