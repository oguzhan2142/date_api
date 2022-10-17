const express = require("express");

const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../model/user");

const expireIn = "2h";
router.get("/test",async(req,res)=>{
	let user = await User.find()
	res.send(user)
})
router.post("/test",(req,res)=>{
	res.status(400);
		
	res.json(req.body)
})
router.post("/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const mail = req.body.mail;

  let existingUser = await User.findOne({
    username: username,
  });

  if (existingUser) {
    return res.status(404).json({
      message: "Kullanıcı adi kullanılıyor",
    });
  }

  existingUser = await User.findOne({
    mail: mail,
  });

  if (existingUser) {
    return res.status(404).json({
      message: "Mail adresi kullanılıyor",
    });
  }

  const user = new User({
    username: username,
    password: password,
    firstName: firstName,
    lastName: lastName,
    mail: mail,
	birthday: new Date(),
    acceptedUsers: [],
    blockedUsers: [],
    rejectUsers: [],
    removedUsers: [],
  });

  const document = await user.save();
  console.log(document.id);
  

  const token = jwt.sign(user.toJSON(), process.env.SECRET_KEY, {
    expiresIn: expireIn,
  });

  res.json({
    user: {
      id: document.id,
      firstName: document.firstName,
      lastName: document.lastName,
      mail: document.mail,
      username: document.username,
    },
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
    user: {
      id: potentialUser.id,
      firstName: potentialUser.firstName,
      lastName: potentialUser.lastName,
      mail: potentialUser.mail,
      username: potentialUser.username,
    },
    token: token,
  });
});

module.exports = router;
