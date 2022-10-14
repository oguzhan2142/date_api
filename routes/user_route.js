const express = require("express");

const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../model/user");

const expireIn = "2h";

router.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const existingUser = await User.findOne({ username: username });

  if (existingUser) {
    return res.status(404).json({
      message: "Kullanıcı adı kullanılıyor",
    });
  }

  const user = new User({
    username: username,
    password: password,
  });

  const document = await user.save();
  console.log(document.id);
  const token = jwt.sign(user.toJSON(), process.env.SECRET_KEY, {
    expiresIn: expireIn,
  });

  res.json({
    username: document.username,
    token: token,
  });
});

router.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const potentialUser = await User.findOne({
    username: username,
  });

  if (!potentialUser) {
    return res.status(404).json({
      message: "Kullanıcı bulunamadı.",
    });
  }

  if (potentialUser.password != password) {
    return res.status(404).json({ message: "Yanlış şifre girildi." });
  }

  const token = jwt.sign(potentialUser.toJSON(), process.env.SECRET_KEY, {
    expiresIn: expireIn,
  });

  res.json({
    username: potentialUser.username,
    token: token,
  });
});

module.exports = router;
