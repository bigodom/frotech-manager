import prisma from '../services/databaseClient.js';

const createFuel = async (req, res) => {
  /* #swagger.tags = ['Fuel']
  #swagger.description = 'Create a new fuel record' */
  try {
    const {
      invoiceId,
      issuer,
      invoiceDate,
      date,
      plate,
      kilometers,
      fuelType,
      quantity,
      unitCost,
      totalCost
    } = req.body;

    const fuel = await prisma.fuel.create({
      data: {
        invoiceId,
        issuer,
        invoiceDate: new Date(invoiceDate),
        date: new Date(date),
        plate,
        kilometers,
        fuelType,
        quantity,
        unitCost,
        totalCost
      }
    });

    res.status(201).json(fuel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllFuels = async (req, res) => {
  /* #swagger.tags = ['Fuel']
  #swagger.description = 'Get all fuel records' */
  try {
    const fuels = await prisma.fuel.findMany();
    res.json(fuels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFuelById = async (req, res) => {
  /* #swagger.tags = ['Fuel']
  #swagger.description = 'Get fuel record by ID' */
  try {
    const { id } = req.params;
    const fuel = await prisma.fuel.findUnique({
      where: { id: parseInt(id) }
    });

    if (!fuel) {
      return res.status(404).json({ error: 'Fuel record not found' });
    }

    res.json(fuel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateFuel = async (req, res) => {
  /* #swagger.tags = ['Fuel']
  #swagger.description = 'Update fuel record' */
  try {
    const { id } = req.params;
    const {
      invoiceId,
      issuer,
      invoiceDate,
      date,
      plate,
      kilometers,
      fuelType,
      quantity,
      unitCost,
      totalCost
    } = req.body;

    const fuel = await prisma.fuel.update({
      where: { id: parseInt(id) },
      data: {
        invoiceId,
        issuer,
        invoiceDate: new Date(invoiceDate),
        date: new Date(date),
        plate,
        kilometers,
        fuelType,
        quantity,
        unitCost,
        totalCost
      }
    });

    res.json(fuel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
  
const deleteFuel = async (req, res) => {
  /* #swagger.tags = ['Fuel']
  #swagger.description = 'Delete fuel record' */
  try {
    const { id } = req.params;
    await prisma.fuel.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getFuelByPlate = async (req, res) => {
  /* #swagger.tags = ['Fuel']
  #swagger.description = 'Get fuel records by vehicle plate' */
  try {
    const { plate } = req.params;
    const fuels = await prisma.fuel.findMany({
      where: { plate },
      orderBy: { date: 'desc' }
    });

    res.json(fuels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export {
  createFuel,
  getAllFuels,
  getFuelById,
  updateFuel,
  deleteFuel,
  getFuelByPlate
}; 