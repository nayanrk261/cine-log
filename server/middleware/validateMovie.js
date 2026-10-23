const validateMovie = (data) => {
    if (
        typeof data.title !== "string" ||
        !data.title.trim()
    ) {
        return "Title is required";
    }

    if (data.rating !== undefined) {
       if (
           typeof data.rating !== "number" ||
           data.rating < 1 ||
           data.rating > 5
        ) {
        return "Rating must be a number between 1 and 5";
        }
    }
    
    return null;
};

module.exports = validateMovie;