const express = require('express');
const Movie = require('../models/movie');
const router = express.Router();
const validateMovie = require('../middleware/validateMovie');

router.get("/", async (req,res) => {
    try{
        const movies = await Movie.find();
        res.json(movies);
    }
    catch(error){
        res.status(500).json({
            message : "Failed to fetch Movies"
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const validationError = validateMovie(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const movieData = req.body;
        const newMovie = await Movie.create(movieData);

        return res.status(201).json(newMovie);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to add movie"
        });
    }
});


router.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;

        const updatedMovie = await Movie.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedMovie) {
            return res.status(404).json({
                message: "Movie does not exist"
            });
        }

        res.status(200).json(updatedMovie);

    } catch (error) {
        res.status(500).json({
            message: "Failed to update movie"
        });
    }
});

router.delete("/:id", async (req,res) => {
    try{
        const id = req.params.id;

        const deleteMovie = await Movie.findByIdAndDelete(id);

        if (!deleteMovie) {
            return res.status(404).json({
                message: "Movie does not exist"
            });
        }

        res.status(200).json({
            message : "Movie Deleted Succsessfully",
            movie : deleteMovie
        });
    }
    catch(error){
        res.status(500).json({
            message : "Failed to delete movie"
        })
    }
})

module.exports = router;