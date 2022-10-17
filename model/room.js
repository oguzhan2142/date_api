const mongoose = require("mongoose");

const Message = require("./message");

const RoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    users: {
      type: [mongoose.Types.ObjectId],
      required: true,
      ref: "User",
    },
    messages: {
      type: [Message.schema],
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Room", RoomSchema);
