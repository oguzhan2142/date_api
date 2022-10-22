const express = require("express");

const User = require("../model/user");
var fs = require("fs");
var path = require("path");
var multer = require("multer");
const router = express.Router();

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dirPath = path.join(process.cwd(), `/uploads/${req.query.userId}/`);
    fs.mkdirSync(dirPath, { recursive: true });
    cb(null, dirPath);
  },
  filename: (req, file, cb) => {
    const imageKey = req.query.key;
    console.log(imageKey);
    const fileName = `${imageKey}.png`;
    cb(null, fileName);
  },
});

var upload = multer({ storage: storage }).single("image");

router.post("/order", async (req, res) => {
  const images = req.body.images;
  const userId = req.body.userId;
  const existImages = [];
  for (let i = 0; i < images.length; i++) {
    const element = images[i];
    const dirPath = path.join(
      process.cwd(),
      `/uploads/${userId}/`,
      `${element.key}.png`
    );

    console.log(dirPath);

    if (fs.existsSync(dirPath)) {
      existImages.push(element);
    }
  }

  console.log(existImages);

  await User.updateOne({ _id: userId }, { images: existImages });

  res.json({ message: "ok" });
});

router.post("/", upload, async (req, res) => {
  // const userId = req.query.userId;
  // const imageKey = req.query.key;

  if (req.file) {
    res.json({ message: "ok" });
  } else {
    res.status(400).json({ message: "not uploaded" });
  }
});

module.exports = router;
