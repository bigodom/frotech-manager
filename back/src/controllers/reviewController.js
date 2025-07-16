import prisma from '../services/databaseClient.js';

const createReview = async (req, res) => {
    /* #swagger.tags = ['Review']
    #swagger.description = 'Create a new review' */
    try {
        const { maintenanceId, type, currentKm, nextReviewKm } = req.body;
        const review = await prisma.review.create({
            data: {
                maintenanceId,
                type,
                currentKm: parseInt(currentKm),
                nextReviewKm: parseInt(nextReviewKm),
            }
        });
        res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(400).json({ error: 'Error creating review' });
    }
}

const getReviews = async (req, res) => {
    /* #swagger.tags = ['Review']
    #swagger.description = 'Get all reviews' */
    try {
        const reviews = await prisma.review.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                Maintenance: true
            }
        });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Error fetching reviews' });
    }
}

const getReviewsByMaintenanceId = async (req, res) => {
    /* #swagger.tags = ['Review']
    #swagger.description = 'Get reviews by maintenance ID' */
    try {
        const reviews = await prisma.review.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews by maintenance ID:', error);
        res.status(500).json({ error: 'Error fetching reviews by maintenance ID' });
    }
}

const getReviewById = async (req, res) => {
    /* #swagger.tags = ['Review']
    #swagger.description = 'Get review by ID' */
    try {
        const { id } = req.params;
        const review = await prisma.review.findUnique({
            where: { id: parseInt(id) },
            include: {
                Maintenance: true
            }
        });
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        res.json(review);
    } catch (error) {
        console.error('Error fetching review by ID:', error);
        res.status(500).json({ error: 'Error fetching review by ID' });
    }
}

const updateReview = async (req, res) => {
    /* #swagger.tags = ['Review']
    #swagger.description = 'Update review' */
    try {
        const { id } = req.params;
        const { type, currentKm, nextReviewKm } = req.body;
        const review = await prisma.review.update({
            where: { id: parseInt(id) },
            data: {
                type,
                currentKm: parseInt(currentKm),
                nextReviewKm: parseInt(nextReviewKm),
            }
        });
        res.json(review);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(400).json({ error: 'Error updating review' });
    }
}

const deleteReview = async (req, res) => {
    /* #swagger.tags = ['Review']
    #swagger.description = 'Delete review' */
    try {
        const { id } = req.params;
        await prisma.review.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(400).json({ error: 'Error deleting review' });
    }
}

export {
    createReview,
    getReviews,
    getReviewsByMaintenanceId,
    getReviewById,
    updateReview,
    deleteReview
};