//Node Express.js backend set up by Mati Sawadogo

//in terminal run: "npm install bcrypt jsonwebtoken" for the password hash and security

//cd to backend then run "node server.js" in terminal to start server or every time you make changes

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();

const SECERET = "shelflog123"


app.use(cors());
app.use(express.json());



//login and signup route
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

//book and author route
//const bookAuthorRoutes = require("./routes/bookAuthorRoutes");
//app.use("/api/bookAuthor", bookAuthorRoutes);

//readinglist route
const readingListRoutes = require("./routes/readingListRoutes");
app.use("/api/lists", readingListRoutes);

//testing routes
app.get("/", (req, res) => {
    res.send("Backend is running.")
});


const PORT = 3000;
app.listen(PORT, () =>{
    console.log(`Server running on http://localhost:${PORT}`);
});



