import jwt from "jsonwebtoken";
export const checker = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, "strongsaltkeyhereonly");
    next();
  } catch (error) {
    res.status(401).json({
      status: {
        message: "Auth Failed",
        code: 401,
      },
    });
  }
};
