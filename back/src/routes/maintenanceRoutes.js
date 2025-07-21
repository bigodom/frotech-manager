import { Router } from 'express';
import { createMaintenance, deleteMaintenance, getAllIssuers, getAllMaintenancesWithReviews, getMaintenanceById, getMaintenances, getMaintenancesByInvoiceId, getMaintenancesByPlate, getMaintenanceWithReview, getOrphanedMaintenances, updateMaintenance } from '../controllers/maintenanceController.js';
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

maintenanceRouter.route('/maintenance/invoice/:invoiceId')
    .get(getMaintenancesByInvoiceId); 

maintenanceRouter.route('/maintenancewithreview/:id')
    .get(getMaintenanceWithReview)

maintenanceRouter.route('/issuers')
    .get(getAllIssuers)

maintenanceRouter.route('/orphaned/maintenance')
    .get(getOrphanedMaintenances)

export default maintenanceRouter;