const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const myBooksRoutes = require("./routes/mybooks");
const reviewRoutes = require("./routes/reviews");
const readingListRoutes = require("./routes/readinglist");
const statsRoutes = require("./routes/stats");
const currentRoutes = require("./routes/currentlyReading");
const goalRoutes = require("./routes/goals");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", myBooksRoutes);
app.use("/api/books", currentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/lists", readingListRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/goals", goalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`ShelfLog backend running on http://localhost:${PORT}`);
});
