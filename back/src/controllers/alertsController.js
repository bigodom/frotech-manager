import prisma from '../services/databaseClient.js'

// Cria um novo alerta
const createAlert = async (req, res) => {
  /* #swagger.tags = ['Alerts']
  #swagger.description = 'Cria um novo alerta' */
  try {
    const { vehicleId, type, description, value, kmAlert } = req.body
    const alert = await prisma.alerts.create({
      data: {
        vehicleId,
        type,
        description,
        value,
        kmAlert,
        isCompleted: false
      }
    })
    res.status(201).json(alert)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Marca alerta como concluído e cria novo alerta de revisão, se aplicável
const completeAlert = async (req, res) => {
  /* #swagger.tags = ['Alerts']
  #swagger.description = 'Conclui um alerta e, se solicitado, cria o próximo' */
  try {
    const { id } = req.params
    const { value, doneDate, repeat, nextKmAlert } = req.body
    // Marca como concluído e atualiza valor e doneDate
    const alert = await prisma.alerts.update({
      where: { id: parseInt(id) },
      data: {
        isCompleted: true,
        doneDate: doneDate ? new Date(doneDate) : new Date(),
        value: value !== undefined ? Number(value) : undefined
      }
    })
    // Só cria novo alerta se repeat for true e nextKmAlert informado
    if (repeat && nextKmAlert) {
      await prisma.alerts.create({
        data: {
          vehicleId: alert.vehicleId,
          type: alert.type,
          description: alert.description,
          kmAlert: Number(nextKmAlert),
          isCompleted: false
        }
      })
    }
    res.json({ message: 'Alerta concluído', alert })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Lista todos os alertas
const getAllAlerts = async (req, res) => {
  /* #swagger.tags = ['Alerts']
  #swagger.description = 'Lista todos os alertas' */
  try {
    const alerts = await prisma.alerts.findMany({
      orderBy: { createdAt: 'desc' },
      include: { vehicle: true }
    })
    res.json(alerts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Busca alerta por ID
const getAlertById = async (req, res) => {
  /* #swagger.tags = ['Alerts']
  #swagger.description = 'Busca alerta por ID' */
  try {
    const { id } = req.params
    const alert = await prisma.alerts.findUnique({
      where: { id: parseInt(id) },
      include: { vehicle: true }
    })
    if (!alert) return res.status(404).json({ error: 'Alerta não encontrado' })
    res.json(alert)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Deleta alerta por ID
const deleteAlert = async (req, res) => {
  /* #swagger.tags = ['Alerts']
  #swagger.description = 'Deleta alerta por ID' */
  try {
    const { id } = req.params
    await prisma.alerts.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Alerta deletado com sucesso' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Atualiza alerta por ID
const updateAlert = async (req, res) => {
  /* #swagger.tags = ['Alerts']
  #swagger.description = 'Atualiza alerta por ID' */
  try {
    const { id } = req.params
    const data = req.body
    const alert = await prisma.alerts.update({
      where: { id: parseInt(id) },
      data
    })
    res.json(alert)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export { createAlert, completeAlert, getAllAlerts, getAlertById, deleteAlert, updateAlert } 