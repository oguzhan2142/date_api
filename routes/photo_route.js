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

    console.log(req.body.qq);

    const fileName = `${imageKey}.png`;
    cb(null, fileName);
  },
});

var upload = multer({ storage: storage }).single("image");

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
router.put("/", async (req, res) => {
  try {
    const userId = req.query.userId;
    const imageKey = req.query.key;
    const index = parseInt(req.query.index);

    const user = await User.findById(userId);

    const images = user.images;

    const imageIndex = images.findIndex((x) => x.key == imageKey);

    if (imageIndex == undefined) {
      return res.status(404).json({ message: "image key not found" });
    }
    const image = images[imageIndex];

    images.splice(imageIndex, 1);

    images.splice(index, 0, image);

    await user.updateOne({
      $set: {
        images: images,
      },
    });
    res.json({ message: "ok" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unexpected error occurred" });
  }
});
router.post("/", upload, async (req, res) => {
  const userId = req.query.userId;
  const key = req.query.key;
  let user = await User.findById(userId);

  if (user.images.length == 9) {
    return res.status(400).json({ message: "Images cant be more than 9" });
  }

  await user.updateOne({
    $push: {
      images: { key: key },
    },
  });

  user = await User.findById(userId);

  const insertedImage = user.images.find((x) => x.key == key);

  if (req.file) {
    res.json({
      id: insertedImage.id,
      key: insertedImage.key,
      url: imageStorage.getPathOfImageAsUrl(insertedImage.key, userId),
    });
  } else {
    res.status(400).json({ message: "not uploaded" });
  }
});

module.exports = router;
