import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import type { RegisterBody, LoginBody } from "../types/index.js";

export const authRouter = Router();

// POST /register
authRouter.post(
  "/register",
  async (req: Request<object, object, RegisterBody>, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }

    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ message: "That email is already registered" });
      return;
    }

    const user = await UserModel.create({
      name,
      email,
      password,
      role: "student",
    });

    res.status(201).json({ user });
  }
);

// POST /login
authRouter.post(
  "/login",
  async (req: Request<object, object, LoginBody>, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      res.status(401).json({ message: "Email or password is incorrect" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Email or password is incorrect" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: "Something went wrong" });
      return;
    }

    const payload: { userId: string } = { userId: String(user._id) };
    const token = jwt.sign(payload, secret, { expiresIn: "2h" });

    res.status(200).json({ token, user });
  }
);
