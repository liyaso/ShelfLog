const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db_config");

const router = express.Router();

function authRequired(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "Missing token" });

    const token = header.split(" ")[1];

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}

// ADD REVIEW
router.post("/add", authRequired, async (req, res) => {
    const { bookId, rating, text } = req.body;

    try {
        const [result] = await pool.query(
            "INSERT INTO Review (user_id, book_id, rating, review_text) VALUES (?, ?, ?, ?)",
            [req.user.userId, bookId, rating, text]
        );

        res.json({ review_id: result.insertId });
    } catch (err) {
        console.error("Review error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
