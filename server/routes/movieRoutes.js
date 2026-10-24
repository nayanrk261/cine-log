
const express = require("express");
const mongoose = require("mongoose");
const Movie = require("../models/movie");
const validateMovie = require("../middleware/validateMovie");
const normalizeMovie = require("../middleware/normalizeMovie");

const router = express.Router();

const allowedFields = [
    "title",
    "releaseYear",
    "genre",
    "rating",
    "review",
    "watchedAt"
];

const sortFields = {
    date: "watchedAt",
    rating: "rating",
    year: "releaseYear",
    title: "title"
};

// Escape special regex characters in user input
const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET all movies: search, filters, sorting, pagination
router.get("/", async (req, res) => {
    try {
        let {
            page = "1",
            limit = "10",
            genre,
            minRating,
            search,
            sortBy = "date",
            order = "desc"
        } = req.query;

        page = Number(page);
        limit = Number(limit);

        if (
            !Number.isSafeInteger(page) ||
            !Number.isSafeInteger(limit) ||
            page < 1 ||
            limit < 1
        ) {
            return res.status(400).json({
                message: "Page and limit must be positive integers"
            });
        }

        limit = Math.min(limit, 100);

        const filter = {};

        // Search by partial movie title
        if (search !== undefined) {
            if (typeof search !== "string" || !search.trim()) {
                return res.status(400).json({
                    message: "Search cannot be empty"
                });
            }

            filter.title = {
                $regex: escapeRegex(search.trim()),
                $options: "i"
            };
        }

        // Filter by genre (case-insensitive exact match)
        if (genre !== undefined) {
            if (typeof genre !== "string" || !genre.trim()) {
                return res.status(400).json({
                    message: "Genre cannot be empty"
                });
            }

            filter.genre = {
                $regex: `^${escapeRegex(genre.trim())}$`,
                $options: "i"
            };
        }

        // Filter by minimum rating
        if (minRating !== undefined) {
            minRating = Number(minRating);

            if (
                !Number.isFinite(minRating) ||
                minRating < 1 ||
                minRating > 5
            ) {
                return res.status(400).json({
                    message: "minRating must be between 1 and 5"
                });
            }

            filter.rating = { $gte: minRating };
        }

        // Validate sorting options
        if (
            typeof sortBy !== "string" ||
            !Object.hasOwn(sortFields, sortBy)
        ) {
            return res.status(400).json({
                message: "sortBy must be date, rating, year, or title"
            });
        }

        if (
            typeof order !== "string" ||
            !["asc", "desc"].includes(order)
        ) {
            return res.status(400).json({
                message: "order must be asc or desc"
            });
        }

        const sortDirection = order === "asc" ? 1 : -1;
        const sort = {
            [sortFields[sortBy]]: sortDirection,
            _id: 1
        };

        const skip = (page - 1) * limit;

        const [movies, totalMovies] = await Promise.all([
            Movie.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Movie.countDocuments(filter)
        ]);

        return res.status(200).json({
            movies,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMovies / limit),
                totalMovies,
                limit
            },
            filters: {
                search: search ?? null,
                genre: genre ?? null,
                minRating: minRating ?? null
            },
            sorting: {
                sortBy,
                order
            }
        });
    } catch (error) {
        console.error("Failed to fetch movies:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// GET one movie by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid movie ID"
            });
        }

        const movie = await Movie.findById(id);

        if (!movie) {
            return res.status(404).json({
                message: "Movie does not exist"
            });
        }

        return res.status(200).json(movie);
    } catch (error) {
        console.error("Failed to fetch movie:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// POST create a movie
router.post("/", async (req, res) => {
    try {
        const validationError = validateMovie(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const movieData = normalizeMovie(req.body);
        const newMovie = await Movie.create(movieData);

        return res.status(201).json(newMovie);
    } catch (error) {
        console.error("Failed to add movie:", error);

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({
                message: "Invalid movie data"
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// PATCH update a movie
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid movie ID"
            });
        }

        const validationError = validateMovie(req.body, true);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const normalizedData = normalizeMovie(req.body);
        const updateData = {};

        for (const field of allowedFields) {
            if (normalizedData[field] !== undefined) {
                updateData[field] = normalizedData[field];
            }
        }

        const updatedMovie = await Movie.findByIdAndUpdate(
            id,
            updateData,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!updatedMovie) {
            return res.status(404).json({
                message: "Movie does not exist"
            });
        }

        return res.status(200).json(updatedMovie);
    } catch (error) {
        console.error("Failed to update movie:", error);

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({
                message: "Invalid movie data"
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// DELETE a movie
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid movie ID"
            });
        }

        const deletedMovie = await Movie.findByIdAndDelete(id);

        if (!deletedMovie) {
            return res.status(404).json({
                message: "Movie does not exist"
            });
        }

        return res.status(200).json({
            message: "Movie deleted successfully",
            movie: deletedMovie
        });
    } catch (error) {
        console.error("Failed to delete movie:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

module.exports = router;
