const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    birthday: {
      type: Date,
      required: true,
    },
    mail: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    images: {
      type: [
        {
          key: String,
          date: Date,
        },
      ],
    },
    rejectUsers: {
      type: [mongoose.Types.ObjectId],
      ref: "User",
    },
    blockedUsers: {
      type: [mongoose.Types.ObjectId],
      ref: "User",
    },
    acceptedUsers: {
      type: [mongoose.Types.ObjectId],
      ref: "User",
    },
    matches: {
      type: [mongoose.Types.ObjectId],
      ref: "User",
    },
    removedUsers: {
      type: [mongoose.Types.ObjectId],
      ref: "User",
    },
  },
  { versionKey: false }
);

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
