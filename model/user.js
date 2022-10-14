const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
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
});

module.exports = mongoose.model("User", UserSchema);
