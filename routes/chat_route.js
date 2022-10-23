const express = require("express");

const router = express.Router();

const idUtils = require("../utils/id_utils");

const Room = require("../model/room");

router.get("/messages", async (req, res) => {
  try {
    const userId = req.query.userId;
    const otherUserId = req.query.otherUserId;
    const page = req.query.page;
    const pageCount = 10;
    const roomId = idUtils.generateRoomId(userId, otherUserId);
    const room = await Room.findOne({ roomId: roomId });

    if (room == undefined) {
      return res.status(404).json({ message: "Room couldn't found" });
    }
    const start = (page - 1) * pageCount;
    const end = start + pageCount;
    const messages = room.messages.reverse().slice(start, end);

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unexpected error occurred" });
  }
});

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
