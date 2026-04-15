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


//readinglist route
const readingListRoutes = require("./routes/readingListRoutes");
app.use("/api/lists", readingListRoutes);


//reviews route
const reviewRoutes = require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);


//progress route
const progressRoutes = require("./routes/progressRoutes");
app.use("/api/progress", progressRoutes);


//goal route
const goalRoutes = require("./routes/goalRoutes.js");
app.use("/api/goals", goalRoutes);


//milestone route
const milestoneRoutes = require("./routes/milestoneRoutes");
app.use("/api/milestones", milestoneRoutes);

//statistics route
const statisticsRoutes = require("./routes/statisticsRoutes");
app.use("/api/statistics", statisticsRoutes);

//testing routes
app.get("/", (req, res) => {
    res.send("Backend is running.")
});


const PORT = 3000;
app.listen(PORT, () =>{
    console.log(`Server running on http://localhost:${PORT}`);
});



