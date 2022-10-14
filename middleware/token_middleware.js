const jwt = require("jsonwebtoken");

const duration = "1w";

const verify = (req, res, next) => {
  if (req.url == "/user/login/" || req.url == "/user/register/") {
    return next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

    next();
  } catch (error) {
    return res.status(400).json({
      message: "Token hatası",
    });
  }
};

module.exports = { verify };
