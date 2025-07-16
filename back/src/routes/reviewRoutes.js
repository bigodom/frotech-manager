import { Router } from 'express';
import {
    createReview,
    getReviews,
    getReviewById,
    updateReview,
    deleteReview,
    getReviewsByMaintenanceId
} from '../controllers/reviewController.js';

const reviewRouter = Router();

reviewRouter.route('/review')
    .get(getReviews)
    .post(createReview);

reviewRouter.route('/review/:id')
    .get(getReviewById)
    .put(updateReview)
    .delete(deleteReview);

reviewRouter.route('/reviewwithmaintenance/:maintenanceId')
    .get(getReviewsByMaintenanceId);

export default reviewRouter;