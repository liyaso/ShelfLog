//Sign up and login routes with express js -Mati Sawadogo
const db = require("../db");
const express = require("express")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router()


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
        res.status(500).json({error: error.message})
    }
});


//login will go here


module.exports = router;