import { Router } from 'express';
import { createMaintenance, deleteMaintenance, getMaintenanceById, getMaintenances, updateMaintenance } from '../controllers/maintenanceController.js';
const maintenanceRouter = Router();

maintenanceRouter.route('/maintenance')
    .get(getMaintenances)
    .post(createMaintenance);

maintenanceRouter.route('/maintenance/:id')
    .get(getMaintenanceById)
    .put(updateMaintenance)
    .delete(deleteMaintenance);

export default maintenanceRouter;