import { Router } from 'express';
const fuelRouter = Router();
import { createFuel, getAllFuels, getFuelById, updateFuel, deleteFuel } from '../controllers/fuelController.js';

fuelRouter.route('/fuel')
    .get(getAllFuels)
    .post(createFuel);

fuelRouter.route('/fuel/:id')
    .get(getFuelById)
    .put(updateFuel)
    .delete(deleteFuel);

export default fuelRouter; 