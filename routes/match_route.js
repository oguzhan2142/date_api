const express = require("express");

const router = express.Router();

const User = require("../model/user");
const Room = require("../model/room");

const imageStorage = require("../storage/image_storage");

router.post("/", async (req, res) => {
  try {
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
      const targetUser = await User.findById({ _id: targetUserId });
      if (isAccepted) {
        const acceptedList = user.acceptedUsers;
        const matchesList = user.matches;
        if (acceptedList.includes(targetUserId)) {
          return res.status(400).json({ message: "Already accepted" });
        }

        if (targetUser.acceptedUsers.includes(user.id)) {
          const targetMatches = targetUser.matches;
          targetMatches.push(user.id);

          await User.updateOne(
            { _id: targetUser.id },
            { matches: targetMatches }
          );
          matchesList.push(targetUser.id);
        }
        acceptedList.push(targetUserId);

        modifiedUser = await User.updateOne(
          { _id: userId },

          { acceptedUsers: acceptedList, matches: matchesList }
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
      return res
        .status(404)
        .json({ message: "You consumed all people nearby" });
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
            url: imageStorage.getPathOfImageAsUrl(k.key, v.id),
          };
        }),
      };
    });

    res.json(models);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "unexpected error occurred" });
  }
});

router.get("/matches", async (req, res) => {
  const userId = req.query.userId;

  const user = await User.findById({ _id: userId })
    .select("matches")
    .populate("matches", ["firstName", "lastName", "images"]);

  const roomsOfUser = await Room.find({ users: userId });

  const matches = [];

  for (let i = 0; i < user.matches.length; i++) {
    const element = user.matches[i];

    const otherUserId = element.id;

    const room = roomsOfUser.find((x) => x.roomId.includes(otherUserId));

    if (room) {
      continue;
    }

    const obj = {
      userId: element.id,
      firstName: element.firstName,
      lastName: element.lastName,
      image: imageStorage.getPathOfImageAsUrl(
        element.images[0]?.key,
        element.id
      ),
    };

    matches.push(obj);
  }

  console.log(matches);

  res.json(matches);
});
module.exports = router;
