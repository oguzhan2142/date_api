const express = require("express");

const router = express.Router();

const Room = require("../model/room");

router.get("/", async (req, res) => {
  const userId = req.query.userId;

  const rooms = await Room.find(
    {
      users: userId,
    },
    {
      messages: { $slice: -1 },
    }
  ).populate({
    path: "users",
    select: ["username", "firstName", "lastName"],
    match: { _id: { $ne: userId } },
  });

  if (!rooms) {
    return res.status(404).json({ message: "room doesn't exist" });
  }

  const objects = [];
  for (let i = 0; i < rooms.length; i++) {
    const element = rooms[i];
    const otherUser = element.users[0];
    const model = {
      id: element.id,
      createdAt: element.createdAt,
      message: element.messages[0] ?? null,
      contact: {
        id: otherUser.id,
        name: `${otherUser.firstName} ${otherUser.lastName}`,
        username: otherUser.username,
      },
    };

    objects.push(model);
  }

  res.json(objects);
});

module.exports = router;
