import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ============================
// REGISTER USER
// ============================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let profileImage = null;
    if (req.file) {
      profileImage = req.file.path; // file upload ka URL ya path
    }

    // 🔸 Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 🔸 Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // 🔸 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔸 Create new user
    const user = await User.create({
      name,
      email,
      profileImage,
      password: hashedPassword,
    });

    // 🔸 Generate JWT with user ID (important fix)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // ✅ Dynamic cookie config (local + vercel support)
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd, // ✅ production pe true, local pe false
      sameSite: isProd ? "None" : "Lax", // ✅ cookies properly send/receive
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
      token,
    });

  } catch (error) {
    console.error("Register Error:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ============================
// LOGIN USER
// ============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔸 Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 🔸 Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User does not exist" });
    }

    // 🔸 Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // 🔸 Generate JWT with user ID
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
      token,
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ============================
// GET ALL USERS
// ============================
export const getUser = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    if (!users.length) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error("Get User Error:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ============================
// LOGOUT USER
// ============================
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    });

    return res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
