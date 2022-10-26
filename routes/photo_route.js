const express = require("express");

const User = require("../model/user");

const imageStorage = require("../storage/image_storage");
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
    const dirPath = imageStorage.getPathOfImage(element.key, userId);

    if (fs.existsSync(dirPath)) {
      existImages.push(element);
    }
  }

  console.log(existImages);

  await User.updateOne({ _id: userId }, { images: existImages });

  res.json({ message: "ok" });
});

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const photos = user.images.map((x) => {
      return {
        id: x.id,
        key: x.key,
        url: imageStorage.getPathOfImageAsUrl(x.key, userId),
      };
    });

    res.json(photos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unexpected error occurred" });
  }
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
