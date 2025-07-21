import prisma from '../services/databaseClient.js';

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
      },
      include: {
        Review: true
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
      orderBy: { date: 'desc' }
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
      where: { id: parseInt(req.params.id) }
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

const getMaintenancesByInvoiceId = async (req, res) => {
  /* #swagger.tags = ['Maintenance']
  #swagger.description = 'Get maintenances by invoice ID' */
  try {
    const { invoiceId } = req.params
    const maintenances = await prisma.maintenance.findMany({
      where: { invoiceId: parseInt(invoiceId) },
      orderBy: { date: 'desc' }
    })
    if (maintenances.length === 0) {
      return res.status(404).json({
        error: 'Nenhuma manutenção encontrada para este ID de nota'
      })
    }
    res.json(maintenances)
  } catch (error) {
    console.error('Erro ao buscar manutenções por ID de nota:', error)
    res.status(500).json({ error: 'Erro ao buscar manutenções por ID de nota' })
  }
}

const updateMaintenance = async (req, res) => {
  /* #swagger.tags = ['Maintenance']
  #swagger.description = 'Update maintenance' */
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

    const maintenance = await prisma.maintenance.update({
      where: { id: parseInt(req.params.id) },
      data: {
        invoiceId,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
        issuer,
        date: date ? new Date(date) : null,
        plate,
        description,
        quantity: parseFloat(quantity),
        value: parseFloat(value),
        totalCost: parseFloat(totalCost)
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
      const maintenanceId = parseInt(req.params.id);

      // Exclui Review associada, se existir
      await prisma.review.deleteMany({
        where: { maintenanceId }
      });

      // Agora pode excluir a manutenção
      await prisma.maintenance.delete({
        where: { id: maintenanceId }
      });

      res.json({ message: 'Manutenção excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir manutenção:', error);
      res.status(500).json({ error: 'Erro ao excluir manutenção' });
    }
  };

  const getMaintenanceWithReview = async (req, res) => {
    /* #swagger.tags = ['Maintenance']
    #swagger.description = 'Get maintenances with reviews' */
    try {
      const maintenances = await prisma.maintenance.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          Review: true
        }
      })
      if (!maintenances) {
        return res.status(404).json({ error: 'Manutenção não encontrada' })
      }
      res.json(maintenances)
    } catch (error) {
      console.error('Erro ao buscar manutenção com revisão:', error)
      res.status(500).json({ error: 'Erro ao buscar manutenção com revisão' })
    }
  }

  const getAllMaintenancesWithReviews = async (req, res) => {
    /* #swagger.tags = ['Maintenance']
    #swagger.description = 'Get all maintenances with reviews' */
    try {
      const maintenances = await prisma.maintenance.findMany({
        include: {
          Review: true
        },
        orderBy: {
          date: 'desc'
        }
      })
      res.json(maintenances)
    } catch (error) {
      console.error('Erro ao buscar manutenções com revisões:', error)
      res.status(500).json({
        error: 'Erro ao buscar manutenções com revisões'
      })
    }
  }

  const getAllIssuers = async (req, res) => {
    /* #swagger.tags = ['Maintenance']
    #swagger.description = 'Get all issuers' */
    try {
      const issuers = await prisma.maintenance.findMany({
        select: {
          issuer: true
        },
        distinct: ['issuer'],
        orderBy: {
          issuer: 'asc'
        }
      });
      res.json(issuers);
    } catch (error) {
      console.error('Error fetching issuers:', error);
      res.status(500).json({ error: 'Error fetching issuers' });
    }
  }

  const getOrphanedMaintenances = async (req, res) => {
    /* #swagger.tags = ['Maintenance']
    #swagger.description = 'Get orphaned maintenances' */
    try {
      const vehicles = await prisma.vehicle.findMany({
        select: { plate: true }
      });
      const plates = vehicles.map(v => v.plate);
      const maintenances = await prisma.maintenance.findMany({
        where: { plate: { notIn: plates } },
        orderBy: { date: 'desc' }
      });
      res.json(maintenances)
    } catch (error) {
      console.error('Error fetching orphaned maintenances:', error);
      res.status(500).json({ error: 'Error fetching orphaned maintenances' });
    }
  }


  export {
    createMaintenance,
    getMaintenances,
    getMaintenanceById,
    updateMaintenance,
    deleteMaintenance,
    getMaintenancesByPlate,
    getMaintenancesByInvoiceId,
    getMaintenanceWithReview,
    getAllMaintenancesWithReviews,
    getAllIssuers,
    getOrphanedMaintenances
  } 