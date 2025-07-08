import prisma from '../services/databaseClient.js';

const createTire = async (req, res) => {
  /* #swagger.tags = ['Tire']
  #swagger.description = 'Create a new tire' */
  try {
    const {
      fireId,
      retreadNumber,
      grooveDepth,
      purchaseDate,
      brand,
      model,
      measure,
      value,
      currentKm,
      status,
      pressure
    } = req.body;

    const tire = await prisma.tire.create({
      data: {
        fireId,
        retreadNumber,
        grooveDepth,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        brand,
        model,
        measure,
        value,
        currentKm,
        status,
        pressure
      }
    });

    res.status(201).json(tire);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllTires = async (req, res) => {
  /* #swagger.tags = ['Tire']
  #swagger.description = 'Get all tires' */
  try {
    const tires = await prisma.tire.findMany();
    res.json(tires);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTireById = async (req, res) => {
  /* #swagger.tags = ['Tire']
  #swagger.description = 'Get tire by ID' */
  try {
    const { id } = req.params;
    const tire = await prisma.tire.findUnique({
      where: { id: parseInt(id) }
    });

    if (!tire) {
      return res.status(404).json({ error: 'Tire not found' });
    }

    res.json(tire);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTire = async (req, res) => {
  /* #swagger.tags = ['Tire']
  #swagger.description = 'Update tire' */
  try {
    const { id } = req.params;
    const {
        fireId,
        retreadNumber,
        grooveDepth,
        purchaseDate,
        brand,
        model,
        measure,
        value,
        currentKm,
        status,
        pressure
    } = req.body;

    const tire = await prisma.tire.update({
      where: { id: parseInt(id) },
      data: {
        fireId,
        retreadNumber,
        grooveDepth,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        brand,
        model,
        measure,
        value,
        currentKm,
        status,
        pressure
      }
    });

    res.json(tire);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteTire = async (req, res) => {
  /* #swagger.tags = ['Tire']
  #swagger.description = 'Delete tire' */
  try {
    const { id } = req.params;
    await prisma.tire.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export {
  createTire,
  getAllTires,
  getTireById,
  updateTire,
  deleteTire
};