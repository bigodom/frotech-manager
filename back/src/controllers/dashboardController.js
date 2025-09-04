import prisma from '../services/databaseClient.js';

// Retorna o total de manutenção agrupado por mês
export const getMaintenanceMonthlyTotals = async (req, res) => {
  /* #swagger.tags = ['Dashboard']
     #swagger.description = 'Get maintenance total cost grouped by month' */
  try {
    const maintenances = await prisma.maintenance.findMany({
      select: {
        date: true,
        totalCost: true,
      },
    });
    // Agrupa por mês/ano
    const result = {};
    maintenances.forEach(m => {
      const d = new Date(m.date);
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      result[key] = (result[key] || 0) + (m.totalCost || 0);
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching maintenance monthly totals:', error);
    res.status(500).json({ error: 'Error fetching maintenance monthly totals' });
  }
};

// Retorna o total de combustível agrupado por mês
export const getFuelMonthlyTotals = async (req, res) => {
  /* #swagger.tags = ['Dashboard']
     #swagger.description = 'Get fuel total cost grouped by month' */
  try {
    const fuels = await prisma.fuel.findMany({
      select: {
        date: true,
        totalCost: true,
      },
    });
    // Agrupa por mês/ano
    const result = {};
    fuels.forEach(f => {
      const d = new Date(f.date);
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      result[key] = (result[key] || 0) + (f.totalCost || 0);
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching fuel monthly totals:', error);
    res.status(500).json({ error: 'Error fetching fuel monthly totals' });
  }
};
