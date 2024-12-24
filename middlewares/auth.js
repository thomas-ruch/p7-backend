const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    console.log("Middleware auth called");
    const token = req.headers.authorization.split(" ")[1];
    console.log("Token received:", token);

    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SUPER_SECRET");
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
