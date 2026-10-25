const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h", algorithm: "HS256" }
  );
}

// Dang ky tai khoan
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        status: "error",
        message: "Du lieu khong hop le"
      });
    }

    const name = username.trim();
    const mail = email.trim().toLowerCase();

    if (
      name.length < 3 ||
      name.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) ||
      mail.length > 150 ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        status: "error",
        message: "Ten, email hoac mat khau khong hop le"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      `INSERT INTO users
       (username, email, password_hash, role)
       VALUES (?, ?, ?, 'user')`,
      [name, mail, passwordHash]
    );

    return res.status(201).json({
      status: "success",
      message: "Dang ky thanh cong",
      data: {
        id: result.insertId,
        username: name,
        email: mail,
        role: "user"
      }
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        status: "error",
        message: "Username hoac email da ton tai"
      });
    }

    console.error("Register error:", error.code || error.message);

    return res.status(500).json({
      status: "error",
      message: "Loi may chu"
    });
  }
});

// Dang nhap
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        status: "error",
        message: "Email hoac mat khau khong hop le"
      });
    }

    const [rows] = await db.query(
      `SELECT id, username, email, password_hash, role
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        status: "error",
        message: "Email hoac mat khau khong dung"
      });
    }

    const token = createToken(user);

    return res.json({
      status: "success",
      message: "Dang nhap thanh cong",
      token,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error.code || error.message);

    return res.status(500).json({
      status: "error",
      message: "Loi may chu"
    });
  }
});

// Lay thong tin tai khoan dang nhap
router.get("/me", async (req, res) => {
  try {
    const authorization = req.headers.authorization || "";
    const match = authorization.match(/^Bearer (.+)$/i);

    if (!match) {
      return res.status(401).json({
        status: "error",
        message: "Chua dang nhap"
      });
    }

    const payload = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"]
    });

    const [rows] = await db.query(
      `SELECT id, username, email, role, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [payload.id]
    );

    if (!rows.length) {
      return res.status(401).json({
        status: "error",
        message: "Tai khoan khong ton tai"
      });
    }

    return res.json({
      status: "success",
      data: rows[0]
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError" ||
        error.name === "NotBeforeError") {
      return res.status(401).json({
        status: "error",
        message: "Token khong hop le hoac da het han"
      });
    }

    console.error("Profile error:", error.code || error.message);

    return res.status(500).json({
      status: "error",
      message: "Loi may chu"
    });
  }
});

module.exports = router;
