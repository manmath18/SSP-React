import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";
import Joi from "joi";
import { Types } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const userRouter = Router();
const SECRET_JWT_CODE = process.env.SECRET_JWT_CODE;

if (!SECRET_JWT_CODE) {
    throw new Error("SECRET_JWT_CODE is not defined in environment variables");
}

// Password validation schema
const passwordSchema = Joi.string()
    .min(8)
    .max(20)
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,1024}$/)
    .required()
    .messages({
        "string.pattern.base": "Password must contain an uppercase, lowercase, digit, and special character",
        "string.min": "Password should have at least 8 characters",
        "string.max": "Password should have at most 20 characters",
    });

// Register new user
userRouter.post("/register", async (req, res) => {
    try {
        const { name, email, password, type } = req.body;

        const schema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().min(8).max(50).required().email(),
            password: passwordSchema,
            type: Joi.string().valid("admin", "seeker", "owner").required(),
        });

        const { error } = schema.validate({ name, email, password, type });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword, type });
        res.json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(400).json({ error: "An error occurred while registering the user." });
    }
});

// Get user list
userRouter.get("/", async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(400).json({ error: "An error occurred while fetching the users." });
    }
});

userRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Joi schema validation
        const schema = Joi.object({
            email: Joi.string().email().min(8).max(50).required(),
            password: Joi.string().min(6).max(20).required(),
        });

        const { error } = schema.validate({ email, password });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const SECRET_JWT_CODE = process.env.SECRET_JWT_CODE;  // Ensure it's loaded from env
        const token = jwt.sign({ id: user._id, email: user.email }, SECRET_JWT_CODE, { expiresIn: "1d" });

        // Remove password before sending response
        const safeUser = user.toObject();
        delete safeUser.password;

        res.json({ user: safeUser, token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "An error occurred during login." });
    }
});

// Reset password
userRouter.post("/resetPassword/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid user id" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const validation = passwordSchema.validate(password);
        if (validation.error) {
            return res.status(400).json({ error: validation.error.details[0].message });
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();
        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(400).json({ error: "An error occurred during password reset." });
    }
});

// Update user info
userRouter.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { cash, interac } = req.body;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid user id" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        if (typeof cash !== "boolean" && (typeof interac !== "string" || interac.trim() === "")) {
            return res.status(400).json({ error: "Must provide cash or a valid interac string" });
        }

        if (typeof cash === "boolean") user.cash = cash;
        if (interac) user.interac = interac;

        await user.save();
        res.json({ message: "User updated successfully" });
    } catch (error) {
        console.error("Error during user update:", error);
        res.status(400).json({ error: "An error occurred during the user update." });
    }
});

// Delete user
userRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid user id" });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error during user deletion:", error);
        res.status(400).json({ error: "An error occurred during the user deletion." });
    }
});

export default userRouter;
