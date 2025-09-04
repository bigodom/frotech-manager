import { Router } from 'express'
import { createAlert, completeAlert, getAllAlerts, getAlertById, deleteAlert, updateAlert } from '../controllers/alertsController.js'

const alertsRouter = Router()

alertsRouter.route('/alerts')
    .get(getAllAlerts)
    .post(createAlert)
alertsRouter.route('/alerts/:id')
    .get(getAlertById)
    .delete(deleteAlert)
alertsRouter.route('/alerts/:id/complete')
    .patch(completeAlert)
alertsRouter.route('/alerts/:id')
    .put(updateAlert)

export default alertsRouter