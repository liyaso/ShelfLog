const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const myBooksRoutes = require("./routes/mybooks");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", myBooksRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`ShelfLog backend running on http://localhost:${PORT}`);
});
