const express = require("express");

const router = express.Router();

const User = require("../model/user");

router.get("/", async (req, res) => {
  const userId = req.query.userId;
  console.log(userId);
  const user = await User.findById(userId);

  console.log(user.username);

  const candidates = await User.find({ _id: { $ne: user.id } });

  const candidate = candidates[0];

  res.json(candidate);
});

module.exports = router;
