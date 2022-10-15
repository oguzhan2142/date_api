const express = require("express");

const router = express.Router();

const User = require("../model/user");

router.get("/next", async (req, res) => {
  const userId = req.query.userId;
  console.log(userId);
  const user = await User.findById(userId);

  let excludeIdList = [userId];

  if (user.acceptedUsers != null) {
    excludeIdList = [...excludeIdList, ...user.acceptedUsers];
  }

  console.log(`rejectedUser : ${user.rejectUsers}`);

  if (user.rejectUsers != null) {
    excludeIdList = [...excludeIdList, ...user.rejectUsers];
  }
  console.log(`excludeIdList : ${excludeIdList}`);
  const candidate = await User.findById({ $nin: excludeIdList });

  if (candidate == null) {
    return res.status(404).json({ message: "You consumed all people nearby" });
  }
  console.log(`user: ${user.username} : ${user.id}`);
  console.log(`candidate: ${candidate.username} : ${candidate.id}`);
  res.json(candidate);
});

router.post("/answer", async (req, res) => {
  const userId = req.body.userId;
  const targetUserId = req.body.targetUserId;
  const isAccepted = req.body.isAccepted;

  const user = await User.findById({ _id: userId });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (isAccepted == undefined) {
    res.status(400).json({ message: "isAccepted is required" });
  }

  let modifiedUser;
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
    modifiedUser = await User.updateOne({ _id: userId }, { rejectUsers: list });
  }

  res.json(modifiedUser);
});

module.exports = router;
