//Node Express.js backend set up by Mati Sawadogo

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();

const SECERET = "shelflog123"


app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("Request received:", req.method, req.url);
  next();
});

//login and signup route
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

//testing routes
app.get("/", (req, res) => {
    res.send("Backend is running.")
});


const PORT = 3000;
app.listen(PORT, () =>{
    console.log(`Server running on http://localhost:${PORT}`);
});



