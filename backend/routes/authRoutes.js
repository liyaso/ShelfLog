//Sign up and login routes with express js -Mati Sawadogo
const db = require("../db");
const express = require("express")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router()
const SECRET = "shelflog123" 


//sign up
router.post("/signup", async (req, res) => {
    const {username, email, password} = req.body;
    
    //check if username already in database
    try {
        const existing_user = await db.query(
            "SELECT user_id FROM User WHERE username = ?", [username]
        );

        if (existing_user[0].length > 0) {
            return res.status(400).json({message: "Username already taken."});
        }

        //saving user into the database
        const password_hash = await bcrypt.hash(password, 10);
        
        await db.query(
            "INSERT INTO User (username, email, password_hash) VALUES (?, ?, ?)", [username, email, password_hash]
        );
        res.status(201).json({success: true, message: "User registered successfully."});
    } catch (error) {
        console.error("Signup Error: ", error);
        res.status(500).json({error: error.message});
    }
});


//login
router.post("/login", async (req, res) => {
    const {username, password} = req.body;

    try {
        const results = await db.query(
            "SELECT * FROM User WHERE username = ?", [username]
        );

        if (results[0].length === 0) {
            return res.status(400).json({error: "Invalid username or password."});
        }

        //check password 
        const isMatch = await bcrypt.compare(password, results[0][0].password_hash);

        if (isMatch) {
            const token = jwt.sign({user_id: results[0][0].user_id, username: results[0][0].username}, SECRET, {expiresIn: "2h"});
            res.status(201).json({success: true, username: results[0][0].username, user_id: results[0][0].user_id});
            
        } else {
            return res.status(400).json({error: "Invalid password."});
        }

    } catch (error) {
        console.log("Login Error: ", error);
        res.status(500).json({error: error.message});
    }
});

module.exports = router;