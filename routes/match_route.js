const express = require("express");

const router = express.Router();

const User = require("../model/user");
const Room = require("../model/room");
const haversine = require("haversine-distance");

const imageStorage = require("../storage/image_storage");

// dislike
const leftDir = "left";
// like
const rightDir = "right";

router.post("/", async (req, res) => {
  try {
    const userId = req.body.userId;
    const swipeDirection = req.body.swipeDirection;
    const targetUserId = req.body.targetUserId;

    const targetUser = await User.findById({ _id: targetUserId });
    const user = await User.findById({ _id: userId });
    console.log(targetUser.firstName);

    const matchesList = user.matches;
    const acceptedList = user.acceptedUsers ?? [];
    if (acceptedList.includes(targetUserId)) {
      return res.status(400).json({ message: "Already accepted" });
    }

    if (swipeDirection === leftDir) {
      const rejectedUserList = user.rejectUsers;
      if (rejectedUserList.includes(targetUserId)) {
        return res.status(400).json({ message: "Already rejected" });
      }

      rejectedUserList.push(targetUserId);
      await User.updateOne({ _id: userId }, { rejectUsers: rejectedUserList });
    } else if (swipeDirection === rightDir) {
      const acceptedList = user.acceptedUsers;

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
      await User.updateOne(
        { _id: userId },

        { acceptedUsers: acceptedList, matches: matchesList }
      );
    } else {
      return res.status(400).json({ message: "invalid direction" });
    }
    res.json({ message: "ok" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "unexpected error occurred" });
  }
});

router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId;

    const count = req.query.count;

    const user = await User.findById({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

    const locationOfUser = [user.location.latitude, user.location.longitude];

    const models = candidates.map((v) => {
      const otherLoc = [v?.location?.latitude, v?.location?.longitude];
      const distInKm = haversine(locationOfUser, otherLoc) / 1000;

      let distance = null;

      if (distInKm < 1) {
        distance = Math.round(distInKm * 10) / 10;
      } else {
        distance = Math.round(distInKm);
      }

      return {
        id: v.id,
        username: v.username,
        firstName: v.firstName,
        lastName: v.lastName,
        age: 20,
        distance: distance,
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

  res.json(matches);
});
module.exports = router;
