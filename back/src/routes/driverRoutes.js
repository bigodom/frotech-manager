import { Router } from 'express';
const driverRouter = Router();
import { createDriver, getAllDrivers, getDriverById, updateDriver, deleteDriver } from '../controllers/driverController.js';

driverRouter.route('/driver')
    .get(getAllDrivers)
    .post(createDriver);

driverRouter.route('/driver/:id')
    .get(getDriverById)
    .put(updateDriver)
    .delete(deleteDriver);

export default driverRouter; 