import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const createMaintenance = async (req, res) => {
  /* #swagger.tags = ['Maintenance']
  #swagger.description = 'Create maintenance' */
  try {
    const {
      invoiceId,
      invoiceDate,
      issuer,
      date,
      plate,
      description,
      quantity,
      value,
      totalCost
    } = req.body
    const maintenance = await prisma.maintenance.create({
      data: {
        invoiceId,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
        issuer,
        date: date ? new Date(date) : null,
        plate,
        description,
        quantity,
        value: parseFloat(value),
        totalCost: parseFloat(totalCost)
      }
    })
    res.status(201).json(maintenance)
  } catch (error) {
    console.error('Erro ao criar manutenção:', error)
    res.status(400).json({ error: 'Erro ao criar manutenção' })
  }
}

const getMaintenances = async (req, res) => {
  /* #swagger.tags = ['Maintenance']
  #swagger.description = 'Get all maintenances' */
  try {
    const maintenances = await prisma.maintenance.findMany({
      orderBy: {
        date: 'desc'
      }
    })
    res.json(maintenances)
  } catch (error) {
    console.error('Erro ao buscar manutenções:', error)
    res.status(500).json({ error: 'Erro ao buscar manutenções' })
  }
}

const getMaintenancesByPlate = async (req, res) => {
  /* #swagger.tags = ['Maintenance']
  #swagger.description = 'Get maintenances by vehicle plate' */
  try {
    const { plate } = req.params
    const maintenances = await prisma.maintenance.findMany({
      where: { plate },
      include: {
        vehicle: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    res.json(maintenances)
  } catch (error) {
    console.error('Erro ao buscar manutenções por placa:', error)
    res.status(500).json({ error: 'Erro ao buscar manutenções por placa' })
  }
}

const getMaintenanceById = async (req, res) => {
  /* #swagger.tags = ['Maintenance']
  #swagger.description = 'Get maintenance by ID' */
  try {
    const maintenance = await prisma.maintenance.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        vehicle: true
      }
    })
    if (!maintenance) {
      return res.status(404).json({ error: 'Manutenção não encontrada' })
    }
    res.json(maintenance)
  } catch (error) {
    console.error('Erro ao buscar manutenção:', error)
    res.status(500).json({ error: 'Erro ao buscar manutenção' })
  }
}

const updateMaintenance = async (req, res) => {
  /* #swagger.tags = ['Maintenance']
  #swagger.description = 'Update maintenance' */
  try {
    const maintenance = await prisma.maintenance.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        vehicle: true
      }
    })
    res.json(maintenance)
  } catch (error) {
    console.error('Erro ao atualizar manutenção:', error)
    res.status(500).json({ error: 'Erro ao atualizar manutenção' })
  }
}

const deleteMaintenance = async (req, res) => {
  /* #swagger.tags = ['Maintenance']
  #swagger.description = 'Delete maintenance' */
  try {
    await prisma.maintenance.delete({
      where: { id: parseInt(req.params.id) }
    })
    res.json({ message: 'Manutenção excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir manutenção:', error)
    res.status(500).json({ error: 'Erro ao excluir manutenção' })
  }
}

export {
  createMaintenance,
  getMaintenances,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance
} 