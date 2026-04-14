const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db_config");

const router = express.Router();

// -------------------------------
// AUTH MIDDLEWARE
// -------------------------------
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

// -------------------------------
// ADD REVIEW
// -------------------------------
router.post("/add", authRequired, async (req, res) => {
    const { book_id, rating, review_text } = req.body;

    try {
        const [result] = await pool.query(
            "INSERT INTO Review (user_id, book_id, rating, review_text) VALUES (?, ?, ?, ?)",
            [req.user.userId, book_id, rating, review_text]
        );

        res.json({ review_id: result.insertId });

    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "You already reviewed this book." });
        }

        console.error("Review error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// -------------------------------
// ROUTE 1: GET USER'S OWN REVIEWS (myreviews.html)
// -------------------------------
router.get("/my", authRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                Review.review_id,
                Review.rating,
                Review.review_text,
                Review.date_posted,
                Book.title AS book_title,
                Book.cover_image_url AS cover_url
             FROM Review
             JOIN Book ON Review.book_id = Book.book_id
             WHERE Review.user_id = ?
             ORDER BY Review.date_posted DESC`,
            [req.user.userId]
        );

        res.json(rows);

    } catch (err) {
        console.error("Load my reviews error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// -------------------------------
// ROUTE 2: GET REVIEWS FOR A SPECIFIC BOOK (bookreviews.html)
// -------------------------------
router.get("/book", authRequired, async (req, res) => {
    const { title } = req.query;

    try {
        const [rows] = await pool.query(
            `SELECT 
                Review.review_id,
                Review.rating,
                Review.review_text,
                Review.date_posted,
                Book.title AS book_title,
                Book.cover_image_url AS cover_url
             FROM Review
             JOIN Book ON Review.book_id = Book.book_id
             WHERE Book.title = ?
             ORDER BY Review.date_posted DESC`,
            [title]
        );

        res.json(rows);

    } catch (err) {
        console.error("Load book reviews error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
