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
    },
    blockedUsers: {
      type: [mongoose.Types.ObjectId],
    },
    acceptedUsers: {
      type: [mongoose.Types.ObjectId],
    },
    removedUsers: {
      type: [mongoose.Types.ObjectId],
    },
  },
  { versionKey: false }
);

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
