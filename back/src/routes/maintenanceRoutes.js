import { Router } from 'express';
import { createMaintenance, deleteMaintenance, getMaintenanceById, getMaintenances, getMaintenancesByPlate, updateMaintenance } from '../controllers/maintenanceController.js';
const maintenanceRouter = Router();

maintenanceRouter.route('/maintenance')
    .get(getMaintenances)
    .post(createMaintenance);

maintenanceRouter.route('/maintenance/:id')
    .get(getMaintenanceById)
    .put(updateMaintenance)
    .delete(deleteMaintenance);

maintenanceRouter.route('/maintenance/plate/:plate')
    .get(getMaintenancesByPlate);

export default maintenanceRouter;