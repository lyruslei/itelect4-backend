import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import type { TokenPayload } from "../middleware/auth.js";

const router = Router();

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

router.post("/register", async (req: Request<unknown, unknown, RegisterBody>, res: Response) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ message: "That email is already registered" });
    return;
  }

  const user = await User.create({ name, email, password });
  res.status(201).json(user.toJSON());
});

router.post("/login", async (req: Request<unknown, unknown, LoginBody>, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "Email or password is incorrect" });
    return;
  }

  const payload: TokenPayload = { userId: String(user._id) };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "2h" });
  res.status(200).json({ token, user: user.toJSON() });
});

export const authRouter = router;
