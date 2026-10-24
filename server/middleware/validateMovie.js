
const validateMovie = (data, isPartial = false) => {
    const allowedFields = [
        "title",
        "releaseYear",
        "genre",
        "rating",
        "review",
        "watchedAt"
    ];

    // 1. Check that data is an object
    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        return "Request body must be an object";
    }

    // 2. Reject unexpected fields
    const invalidField = Object.keys(data).find(
        (key) => !allowedFields.includes(key)
    );

    if (invalidField) {
        return `Unknown field: ${invalidField}`;
    }

    if (isPartial && Object.keys(data).length === 0) {
    return "Update data cannot be empty";
    }

    // 3. Require title when creating a movie
    if (!isPartial || data.title !== undefined) {
        if (
            typeof data.title !== "string" ||
            !data.title.trim()
        ) {
            return "Title is required";
        }
    }

    // 4. Validate rating
    if (data.rating !== undefined) {
        if (
            typeof data.rating !== "number" ||
            !Number.isFinite(data.rating) ||
            data.rating < 1 ||
            data.rating > 5
        ) {
            return "Rating must be a number between 1 and 5";
        }
    }

    // 5. Validate release year
    if (data.releaseYear !== undefined) {
        const currentYear = new Date().getFullYear();

        if (
            typeof data.releaseYear !== "number" ||
            !Number.isInteger(data.releaseYear) ||
            data.releaseYear < 1888 ||
            data.releaseYear > currentYear + 5
        ) {
            return `Release year must be an integer between 1888 and ${currentYear + 5}`;
        }
    }

    // 6. Validate genre
    if (data.genre !== undefined) {
        if (
            typeof data.genre !== "string" ||
            !data.genre.trim()
        ) {
            return "Genre must be a non-empty string";
        }
    }

    // 7. Validate review
    if (data.review !== undefined) {
        if (typeof data.review !== "string") {
            return "Review must be a string";
        }
    }

    // 8. Validate watchedAt
    if (data.watchedAt !== undefined) {
        if (
            typeof data.watchedAt !== "string" ||
            !data.watchedAt.trim() ||
            Number.isNaN(Date.parse(data.watchedAt))
        ) {
            return "Watched date must be a valid date string";
        }
    }

    return null;
};

module.exports = validateMovie;
