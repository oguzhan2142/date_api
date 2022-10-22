const express = require("express");

const router = express.Router();
const path = require("path");
const User = require("../model/user");

const imageStorage = require("../storage/image_storage");
const strConst = require("../constants/string_const");

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
  const candidates = await User.find({ _id: { $nin: excludeIdList } }).limit(
    count ?? 1
  );

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
      images: v.images.map((k) => {
        return {
          id: k.id,
          url: imageStorage.getPathOfImage(k.key, v.id),
        };
      }),
    };
  });

  res.json(models);
});

router.get("/matches", async (req, res) => {
  const userId = req.query.userId;

  const user = await User.findById({ _id: userId })
    .select("matches")
    .populate("matches", ["firstName", "lastName", "images"]);

  const matches = user.matches.map((v) => {
    return {
      firstName: v.firstName,
      lastName: v.lastName,
      image: imageStorage.getPathOfImageAsUrl(v.images[0]?.key, v.id),
    };
  });
  res.json(matches);
});
module.exports = router;
