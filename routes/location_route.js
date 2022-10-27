const express = require("express");

const router = express.Router();

const User = require("../model/user");

router.put("/", async (req, res) => {
  try {
    const userId = req.body.userId;
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;

    await User.updateOne(
      { _id: userId },
      { $set: { location: { latitude: latitude, longitude: longitude } } }
    );
    console.log(userId);

    res.json({ message: "ok" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;
