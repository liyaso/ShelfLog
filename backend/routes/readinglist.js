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

// GET user lists
router.get("/my", authRequired, async (req, res) => {
    const [rows] = await pool.query(
        "SELECT * FROM ReadingList WHERE user_id = ?",
        [req.user.userId]
    );
    res.json(rows);
});

// CREATE list
router.post("/create", authRequired, async (req, res) => {
    const { name, description } = req.body;

    const [result] = await pool.query(
        "INSERT INTO ReadingList (user_id, name, description) VALUES (?, ?, ?)",
        [req.user.userId, name, description]
    );

    res.json({ list_id: result.insertId });
});

module.exports = router;
