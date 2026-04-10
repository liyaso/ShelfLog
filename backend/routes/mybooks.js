const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db_config");

const router = express.Router();

// Middleware to check token
function authRequired(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "Missing token" });

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}

// GET /api/books/my
router.get("/my", authRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM user_books WHERE user_id = ?",
            [req.user.userId]
        );
        res.json(rows);
    } catch (err) {
        console.error("Get books error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/books/add
router.post("/add", authRequired, async (req, res) => {
    const { title, author, cover_url } = req.body;

    try {
        const [result] = await pool.query(
            "INSERT INTO user_books (user_id, title, author, cover_url) VALUES (?, ?, ?, ?)",
            [req.user.userId, title, author, cover_url]
        );

        res.json({
            id: result.insertId,
            title,
            author,
            cover_url
        });
    } catch (err) {
        console.error("Add book error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
