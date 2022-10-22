const express = require("express");

const router = express.Router();

const User = require("../model/user");

router.post("/", async (req, res) => {
  const userId = req.body.userId;
  const targetUserId = req.body.targetUserId;
  const isAccepted = req.body.isAccepted;
  const count = req.body.count;

  const user = await User.findById({ _id: userId });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  let modifiedUser;
  if (isAccepted != undefined && targetUserId != undefined) {
    if (isAccepted) {
      const list = user.acceptedUsers;
      if (list.includes(targetUserId)) {
        return res.status(400).json({ message: "Already accepted" });
      }
      list.push(targetUserId);
      modifiedUser = await User.updateOne(
        { _id: userId },
        { acceptedUsers: list }
      );
    } else {
      const list = user.rejectUsers;
      if (list.includes(targetUserId)) {
        return res.status(400).json({ message: "Already rejected" });
      }

      list.push(targetUserId);
      modifiedUser = await User.updateOne(
        { _id: userId },
        { rejectUsers: list }
      );
    }
  }

  let excludeIdList = [userId];

  if (user.acceptedUsers != null) {
    excludeIdList = [...excludeIdList, ...user.acceptedUsers];
  }

  if (user.rejectUsers != null) {
    excludeIdList = [...excludeIdList, ...user.rejectUsers];
  }
  const candidates = await User.find({ $nin: excludeIdList }).limit(count ?? 1);

  if (candidates == null) {
    return res.status(404).json({ message: "You consumed all people nearby" });
  }

  // TODO: age calculation
  var now = new Date();
  var diff = now - candidates.birthday;
  const models = candidates.map((v) => {
    return {
      id: v.id,
      username: v.username,
      firstName: v.firstName,
      lastName: v.lastName,
      age: 20,
    };
  });

  res.json(models);
});

module.exports = router;
