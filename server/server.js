require("dotenv").config();
const express = require('express');
const movieRoutes = require('./routes/movieRoutes');
const {connectDB} = require('./database/db');

const app = express();
app.use(express.json());

app.use("/api/movies",movieRoutes);

app.get("/", (req,res) => {
    res.send("Hello World");
})

const startServer = async () => {
    try{
        await connectDB();

        app.listen(5000, () => {
            console.log("Server on port 5000");
        });
    }
    catch(err){
        console.error("server not started: ", err.message);
        process.exit(1);
    }
};

startServer();