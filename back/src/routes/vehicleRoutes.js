import { Router } from 'express';
const vehicleRouter = Router();
import { createVehicle, getAllVehicles, getVehicleById, updateVehicle, deleteVehicle, updateMileage, updateMileageByPlate, updateMileageByPlateBatch, getPlates, getVehiclesByPlate } from '../controllers/vehicleController.js';

vehicleRouter.route('/vehicle')
    .get(getAllVehicles)
    .post(createVehicle);

vehicleRouter.route('/vehicle/:id')
    .get(getVehicleById)
    .put(updateVehicle)
    .delete(deleteVehicle);

vehicleRouter.route('/mileage/:id')
    .put(updateMileage);

vehicleRouter.route('/mileage-by-plate')
    .put(updateMileageByPlate);

vehicleRouter.route('/mileage-batch')
    .put(updateMileageByPlateBatch);

vehicleRouter.route('/plates')
    .get(getPlates);

vehicleRouter.route('/vehicles-by-plate/:plate')
    .get(getVehiclesByPlate);

export default vehicleRouter;