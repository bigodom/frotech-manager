import { Router } from 'express';
import { createTire, getAllTires, getTireById, updateTire, deleteTire } from '../controllers/tireController.js';

const tireRouter = Router();

tireRouter.route('/tire')
    .get(getAllTires)
    .post(createTire);

tireRouter.route('/tire/:id')
    .get(getTireById)
    .put(updateTire)
    .delete(deleteTire);

export default tireRouter;