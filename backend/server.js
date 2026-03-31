//Node Express backend set up by Mati Sawadogo


const mysql = require("mysql2");
const dbConfig = require("./db_config");
const express = require("express");
const cors = require("cors");


const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool(dbConfig);

app.get("/", (req, res) => {
    res.send("Backend is running.")
});

const PORT = 3000;
app.listen(PORT, () =>{
    console.log(`Server running on http://localhost:${PORT}`);
});