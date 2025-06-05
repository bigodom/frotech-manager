import { Router } from 'express';
const vehicleRouter = Router();
import { createVehicle, getAllVehicles, getVehicleById, updateVehicle, deleteVehicle } from '../controllers/vehicleController.js';

vehicleRouter.route('/vehicle')
    .get(getAllVehicles)
    .post(createVehicle);

vehicleRouter.route('/vehicle/:id')
    .get(getVehicleById)
    .put(updateVehicle)
    .delete(deleteVehicle);

export default vehicleRouter;