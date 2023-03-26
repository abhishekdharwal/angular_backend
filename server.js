import express from "express";
const app = express();
import DbConnect from "./db.js";
import bodyParser from "body-parser";
import Todo from "./models/todo.js";
import multer from "multer";
import path from "path";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
DbConnect();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Orgin,X-Requested-With,Content-Type,Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET , POST , PUT , PATCH , DELETE , OPTIONS"
  );

  next();
});

app.use("/images", express.static(path.join("images")));
const MINE_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MINE_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
  destination: (req, file, cb) => {
    const isValid = MINE_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mine type");
    if (isValid) {
      error = null;
    }
    cb(error, "images");
  },
});
app.post(
  "/api/tasks",
  multer({ storage: storage }).single("image"),
  async (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    try {
      let data = new Todo({
        title: req.body.title,
        description: req.body.description,
        imagePath: url + "/images/" + req.file.filename,
      });
      await data.save();

      delete data.__v;
      res.status(200).json({
        status: {
          message: "success",
          code: 201,
        },
        data: data,
      });
    } catch (err) {
      res.status(400).json({
        status: {
          message: "failed",
          code: 400,
        },
      });
    }
  }
);
app.get("/api/tasks", async (req, res, next) => {
  try {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.currentpage;
    let task;
    if (pageSize && currentPage > -1) {
      task = await Todo.find()
        .skip(pageSize * currentPage)
        .limit(pageSize);
    }
    res.json({
      status: {
        message: "success",
        code: "200",
      },
      data: task,
      totalCount: 100,
    });
  } catch (error) {
    res.json({
      status: {
        message: "failed",
        code: "400",
        err: error,
      },
    });
  }
});
app.get("/api/tasks/:id", async (req, res, next) => {
  try {
    let task = await Todo.findById(req.params.id);
    console.log(task);

    delete task.__v;

    console.log(task);
    res.json({
      status: {
        message: "success",
        code: "200",
      },
      data: task,
    });
  } catch (error) {}
});
app.delete("/api/tasks/:id", async (req, res, next) => {
  try {
    await Todo.deleteOne({ _id: req.params.id });
    res.json({
      status: {
        message: " success delete",
        status: 200,
      },
    });
  } catch (err) {
    res.status(400).send({ message: "unable to delete " });
  }
});
app.put(
  "/api/tasks/:id",
  multer({ storage: storage }).single("image"),

  async (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    let imagePath = req.body.imagePath;
    if (req.file) {
      imagePath = url + "/images/" + req.file.filename;
    }
    try {
      const task1 = new Todo({
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        imagePath: imagePath,
      });
      let task = await Todo.findByIdAndUpdate({ _id: req.body._id }, req.body);
      delete task.__v;
      res.json({
        status: {
          message: "success update",
          status: 200,
        },
        data: task,
      });
    } catch (error) {
      res.status(400).send({ message: " unable to update" });
    }
  }
);
app.listen(3000, () => {
  console.log("app running on 3000");
});

// server.listen(3000);
//
