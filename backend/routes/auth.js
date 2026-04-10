const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db_config");

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    try {
        const [existing] = await pool.query(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const hash = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            [username, hash]
        );

        res.json({ id: result.insertId, username });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.query(
            "SELECT id, username, password_hash FROM users WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
