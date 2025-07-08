import { Router } from 'express';
import { createVehicleTire, getAllVehicleTires, getVehicleTireById, updateVehicleTire, deleteVehicleTire } from '../controllers/vehicleTireController.js';

const vehicleTireRouter = Router();

vehicleTireRouter.route('/vehicletire')
    .get(getAllVehicleTires)
    .post(createVehicleTire);

vehicleTireRouter.route('/vehicletire/:id')
    .get(getVehicleTireById)
    .put(updateVehicleTire)
    .delete(deleteVehicleTire);

export default vehicleTireRouter;