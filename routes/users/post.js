import User from "../../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const compareStatus = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (compareStatus) {
        const token = jwt.sign(
          { email: user.email, userId: user._id },
          "strongsaltkeyhereonly",
          {
            expiresIn: "1h",
          }
        );
        res.json({
          status: {
            message: "login successfully",
            code: 200,
          },
          data: { token: token, expiresIn: 3600 },
        });
      } else {
        res.status(401).json({
          status: {
            message: "Auth failed ",
            code: 401,
          },
        });
      }
    } else {
      res.status(401).json({
        status: {
          message: "user do not exist ",
          code: 401,
        },
        data: "no data",
      });
    }
  } catch (error) {
    res.status(500).send({ message: "error occured", err: error, code: 500 });
  }
};
export const signup = async (req, res, next) => {
  let password;
  try {
    password = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: password,
    });
    const result = await user.save();

    res.json({
      status: {
        message: "user created successfully",
        code: 201,
      },
      data: result,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: {
        message: "unable to create user",
        code: 500,
      },
      data: "No data",
    });

    return;
  }
};
