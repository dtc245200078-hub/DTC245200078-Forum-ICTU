
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Trang chu API
app.get("/", (req, res) => {
  res.json({
    message: "Forum De 15 API"
  });
});

// Kiem tra Backend va MySQL
app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      status: "success",
      message: "Forum API va MySQL dang hoat dong"
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(503).json({
      status: "error",
      message: "Khong ket noi duoc MySQL"
    });
  }
});

// Lay danh sach danh muc
app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM categories ORDER BY id"
    );

    res.json({
      status: "success",
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Loi lay danh muc"
    });
  }
});

// Lay danh sach bai viet
app.get("/api/posts", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.title,
        p.content,
        p.created_at,
        u.username,
        c.name AS category
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      status: "success",
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Loi lay bai viet"
    });
  }
});

app.use("/api/auth", require("./auth"));
app.use("/api/posts", require("./posts"));
app.use("/api/comments", require("./comments"));
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Forum API running on port ${PORT}`);
});
