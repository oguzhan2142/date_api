const express = require("express");

const router = express.Router();

const User = require("../model/user");

router.get("/next", async (req, res) => {
  const userId = req.query.userId;

  const user = await User.findById(userId);
  if (user == null) return res.status(404).json({ message: "user not found" });
  let excludeIdList = [userId];

  if (user.acceptedUsers != null) {
    excludeIdList = [...excludeIdList, ...user.acceptedUsers];
  }

  if (user.rejectUsers != null) {
    excludeIdList = [...excludeIdList, ...user.rejectUsers];
  }
  const candidate = await User.findById({ $nin: excludeIdList });

  if (candidate == null) {
    return res.status(404).json({ message: "You consumed all people nearby" });
  }

  res.json(candidate);
});

router.post("/", async (req, res) => {
  const userId = req.body.userId;
  const targetUserId = req.body.targetUserId;
  const isAccepted = req.body.isAccepted;

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
  const candidate = await User.findById({ $nin: excludeIdList });

  if (candidate == null) {
    return res.status(404).json({ message: "You consumed all people nearby" });
  }

  // TODO: age calculation

  var now = new Date();
  var diff = now - candidate.birthday;

  res.json({
    id: candidate.id,
    username: candidate.username,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    age: 20,
  });
});

module.exports = router;
