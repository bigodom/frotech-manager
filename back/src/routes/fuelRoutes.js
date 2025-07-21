import { Router } from 'express';
const fuelRouter = Router();
import { createFuel, getAllFuels, getFuelById, updateFuel, deleteFuel, getFuelByPlate, getOrphanedFuels } from '../controllers/fuelController.js';

fuelRouter.route('/fuel')
    .get(getAllFuels)
    .post(createFuel);

fuelRouter.route('/fuel/:id')
    .get(getFuelById)
    .put(updateFuel)
    .delete(deleteFuel);

fuelRouter.route('/fuel/plate/:plate')
    .get(getFuelByPlate);

fuelRouter.route('/orphaned/fuel')
    .get(getOrphanedFuels);

export default fuelRouter; 