const express = require("express");

const router = express.Router();

const Room = require("../model/room");
const Message = require("../model/message");

router.get("/", async (req, res) => {
  const userId = req.query.userId;

  const room = await Room.find(
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

  if (!room) {
    return res.status(404).json({ message: "room doesn't exist" });
  }
  res.json(room);
});

module.exports = router;
