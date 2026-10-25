const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db");

const router = express.Router();

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

// Xem binh luan theo bai viet
router.get("/", async (req, res) => {
  try {
    const postId = Number(req.query.post_id);

    if (!Number.isSafeInteger(postId) || postId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "post_id khong hop le"
      });
    }

    const [rows] = await db.query(
      `SELECT
         c.id,
         c.post_id,
         c.user_id,
         u.username,
         c.content,
         c.created_at
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC, c.id ASC`,
      [postId]
    );

    return res.json({
      status: "success",
      data: rows
    });
  } catch (error) {
    console.error("Get comments:", error.code || error.message);
    return res.status(500).json({
      status: "error",
      message: "Loi may chu"
    });
  }
});

// Tao binh luan
router.post("/", requireLogin, async (req, res) => {
  try {
    const { post_id, content } = req.body || {};

    if (
      !Number.isSafeInteger(post_id) ||
      post_id <= 0 ||
      typeof content !== "string" ||
      content.trim().length < 2 ||
      content.trim().length > 5000
    ) {
      return res.status(400).json({
        status: "error",
        message: "Du lieu binh luan khong hop le"
      });
    }

    const [posts] = await db.query(
      "SELECT id FROM posts WHERE id = ?",
      [post_id]
    );

    if (!posts.length) {
      return res.status(404).json({
        status: "error",
        message: "Bai viet khong ton tai"
      });
    }

    const [result] = await db.query(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES (?, ?, ?)`,
      [post_id, req.user.id, content.trim()]
    );

    return res.status(201).json({
      status: "success",
      message: "Binh luan thanh cong",
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error("Create comment:", error.code || error.message);
    return res.status(500).json({
      status: "error",
      message: "Loi may chu"
    });
  }
});

// Sua binh luan cua minh
router.put("/:id", requireLogin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { content } = req.body || {};

    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      typeof content !== "string" ||
      content.trim().length < 2 ||
      content.trim().length > 5000
    ) {
      return res.status(400).json({
        status: "error",
        message: "Du lieu khong hop le"
      });
    }

    const [result] = await db.query(
      `UPDATE comments
       SET content = ?
       WHERE id = ? AND user_id = ?`,
      [content.trim(), id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        status: "error",
        message: "Khong tim thay binh luan cua ban"
      });
    }

    return res.json({
      status: "success",
      message: "Cap nhat binh luan thanh cong"
    });
  } catch (error) {
    console.error("Update comment:", error.code || error.message);
    return res.status(500).json({
      status: "error",
      message: "Loi may chu"
    });
  }
});

// Xoa binh luan cua minh
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
      "DELETE FROM comments WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        status: "error",
        message: "Khong tim thay binh luan cua ban"
      });
    }

    return res.json({
      status: "success",
      message: "Xoa binh luan thanh cong"
    });
  } catch (error) {
    console.error("Delete comment:", error.code || error.message);
    return res.status(500).json({
      status: "error",
      message: "Loi may chu"
    });
  }
});

module.exports = router;

