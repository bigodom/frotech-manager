const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const createMaintenance = async (req, res) => {
  try {
    const maintenance = await prisma.maintenance.create({
      data: req.body,
      include: {
        vehicle: true
      }
    })
    res.json(maintenance)
  } catch (error) {
    console.error('Erro ao criar manutenção:', error)
    res.status(500).json({ error: 'Erro ao criar manutenção' })
  }
}

const getMaintenances = async (req, res) => {
  try {
    const maintenances = await prisma.maintenance.findMany({
      include: {
        vehicle: true
      },
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

const getMaintenanceById = async (req, res) => {
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

module.exports = {
  createMaintenance,
  getMaintenances,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance
} 