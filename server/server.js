
require("dotenv").config();

const express = require("express");
const movieRoutes = require("./routes/movieRoutes");
const { connectDB } = require("./database/db");

const app = express();

// Middleware: parse JSON and limit request body size to 10 KB
app.use(express.json({ limit: "10kb" }));

// Movie API routes
app.use("/api/movies", movieRoutes);

// Handle oversized request bodies and other middleware errors
app.use((err, req, res, next) => {
    if (err.type === "entity.too.large") {
        return res.status(413).json({
            message: "Request body is too large. Maximum size is 10 KB."
        });
    }

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            message: "Invalid JSON request body."
        });
    }

    console.error("Request error:", err);

    return res.status(500).json({
        message: "Internal server error"
    });
});

// Root route
app.get("/", (req, res) => {
    res.send("Hello World");
});

// Start server after database connection
const startServer = async () => {
    try {
        await connectDB();

        app.listen(5000, () => {
            console.log("Server on port 5000");
        });
    } catch (err) {
        console.error("Server not started:", err.message);
        process.exit(1);
    }
};

startServer();
