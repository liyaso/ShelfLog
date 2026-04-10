const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db_config");

const router = express.Router();

function authRequired(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "Missing token" });

    try {
        req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}

router.get("/current", authRequired, async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM ReadingGoal WHERE user_id = ? LIMIT 1",
            [req.user.userId]
        );

        res.json(rows[0] || {});
    } catch (err) {
        console.error("Goal load error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
