const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db_config");

const router = express.Router();

// Auth middleware
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

// GET user books
router.get("/my", authRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                UserBooks.user_id,
                UserBooks.book_id,
                UserBooks.title,
                UserBooks.author,
                UserBooks.cover_url,
                Book.cover_image_url
             FROM UserBooks
             JOIN Book ON UserBooks.book_id = Book.book_id
             WHERE UserBooks.user_id = ?`,
            [req.user.userId]
        );

        res.json(rows);

    } catch (err) {
        console.error("Load My Books error:", err);
        res.status(500).json({ error: "Server error" });
    }
});



// ADD book
router.post("/add", authRequired, async (req, res) => {
    const { title, author, cover_url } = req.body;

    try {
        const [bookRows] = await pool.query(
            "SELECT book_id FROM Book WHERE title = ? AND author = ?",
            [title, author]
        );

        let bookId;

        if (bookRows.length) {
            bookId = bookRows[0].book_id;
        } else {
            const [insertBook] = await pool.query(
                "INSERT INTO Book (title, author, cover_image_url) VALUES (?, ?, ?)",
                [title, author, cover_url]
            );
            bookId = insertBook.insertId;
        }

        await pool.query(
            `INSERT IGNORE INTO UserBooks (user_id, book_id, title, author, cover_url)
             VALUES (?, ?, ?, ?, ?)`,
            [req.user.userId, bookId, title, author, cover_url]
        );

        res.json({ book_id: bookId });

    } catch (err) {
        console.error("Add book error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;