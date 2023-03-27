import Router from "express";
import { login, signup } from "./post.js";
let user = Router();
user.post("/login", login);
user.post("/signup", signup);

export default user;
