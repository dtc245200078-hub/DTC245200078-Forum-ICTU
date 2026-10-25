const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db");

const router = express.Router();

// Kiem tra JWT
function requireLogin(req, res, next) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer (.+)$/i);

  if (!match) {
    return res.status(401).json({
      status: "error",
      message: "Ban can dang nhap"
    });
  }

  try {
    req.user = jwt.verify(
      match[1],
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Token khong hop le hoac da het han"
    });
  }
}

// Tao bai viet
router.post("/", requireLogin, async (req, res) => {
  try {
    const { title, content, category_id } = req.body || {};

    if (
      typeof title !== "string" ||
      typeof content !== "string" ||
      title.trim().length < 5 ||
      title.trim().length > 255 ||
      content.trim().length < 10 ||
      !Number.isSafeInteger(category_id) ||
      category_id <= 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "Du lieu bai viet khong hop le"
      });
    }

    const [categories] = await db.query(
      "SELECT id FROM categories WHERE id = ?",
      [category_id]
    );

    if (!categories.length) {
      return res.status(404).json({
        status: "error",
        message: "Danh muc khong ton tai"
      });
    }

    const [result] = await db.query(
      `INSERT INTO posts
       (user_id, category_id, title, content)
       VALUES (?, ?, ?, ?)`,
      [
        req.user.id,
        category_id,
        title.trim(),
        content.trim()
      ]
    );

    return res.status(201).json({
      status: "success",
      message: "Tao bai viet thanh cong",
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error("Create post:", error.code || error.message);
    return res.status(500).json({
      status: "error",
      message: "Loi may chu"
    });
  }
});

// Sua bai viet cua minh
router.put("/:id", requireLogin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, content } = req.body || {};

    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      typeof title !== "string" ||
      typeof content !== "string" ||
      title.trim().length < 5 ||
      title.trim().length > 255 ||
      content.trim().length < 10
    ) {
      return res.status(400).json({
        status: "error",
        message: "Du lieu khong hop le"
      });
    }

    const [result] = await db.query(
      `UPDATE posts
       SET title = ?, content = ?
       WHERE id = ? AND user_id = ?`,
      [
        title.trim(),
        content.trim(),
        id,
        req.user.id
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        status: "error",
        message: "Khong tim thay bai viet cua ban"
      });
    }

    return res.json({
      status: "success",
      message: "Cap nhat bai viet thanh cong"
    });
  } catch (error) {
    console.error("Update post:", error.code || error.message);
    return res.status(500).json({
      status: "error",
      message: "Loi may chu"
    });
  }
});

// Xoa bai viet cua minh
router.delete("/:id", requireLogin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        status: "error",
        message: "ID khong hop le"
      });
    }

    const [result] = await db.query(
      "DELETE FROM posts WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        status: "error",
        message: "Khong tim thay bai viet cua ban"
      });
    }

    return res.json({
      status: "success",
      message: "Xoa bai viet thanh cong"
    });
  } catch (error) {
    console.error("Delete post:", error.code || error.message);
    return res.status(500).json({
      status: "error",
      message: "Loi may chu"
    });
  }
});

module.exports = router;

