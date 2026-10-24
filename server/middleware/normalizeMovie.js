const normalizeMovie = (data) => {
    const normalizedData = { ...data };

    if (typeof normalizedData.title === "string") {
        normalizedData.title = normalizedData.title.trim();
    }

    if (typeof normalizedData.genre === "string") {
        normalizedData.genre = normalizedData.genre.trim();
    }

    if (typeof normalizedData.review === "string") {
        normalizedData.review = normalizedData.review.trim();
    }

    return normalizedData;
};

module.exports = normalizeMovie;