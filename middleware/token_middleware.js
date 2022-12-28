const jwt = require("jsonwebtoken");

const duration = "1w";

const verify = (req, res, next) => {
  console.log(req.url);
  if (req.url == "/api/auth/login" || req.url == "/api/auth/signup") {
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
