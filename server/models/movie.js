
const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    releaseYear: {
        type: Number
    },
    genre: {
        type: String
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    review: {
        type: String
    },
    watchedAt: {
        type: Date,
        default: Date.now
    }
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
