import prisma from '../services/databaseClient.js';

const createVehicle = async (req, res) => {
  /* #swagger.tags = ['Vehicle']
  #swagger.description = 'Create a new vehicle' */
  try {
    const {
      plate,
      model,
      type,
      manufacturingYear,
      modelYear,
      observation,
      color,
      fuelType,
      mileage,
      utility,
      classification,
      registration,
      chassi,
      renavam
    } = req.body;

    const vehicle = await prisma.vehicle.create({
      data: {
        plate,
        model,
        type,
        manufacturingYear,
        modelYear,
        observation,
        color,
        fuelType,
        mileage,
        utility,
        classification,
        registration,
        chassi,
        renavam
      }
    });

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllVehicles = async (req, res) => {
  /* #swagger.tags = ['Vehicle']
  #swagger.description = 'Get all vehicles' */
  try {
    const vehicles = await prisma.vehicle.findMany();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVehicleById = async (req, res) => {
  /* #swagger.tags = ['Vehicle']
  #swagger.description = 'Get vehicle by ID' */
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(id) }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVehicle = async (req, res) => {
  /* #swagger.tags = ['Vehicle']
  #swagger.description = 'Update vehicle' */
  try {
    const { id } = req.params;
    const {
      plate,
      model,
      type,
      manufacturingYear,
      modelYear,
      observation,
      color,
      fuelType,
      mileage,
      utility,
      classification,
      registration,
      chassi,
      renavam
    } = req.body;

    const vehicle = await prisma.vehicle.update({
      where: { id: parseInt(id) },
      data: {
        plate,
        model,
        type,
        manufacturingYear,
        modelYear,
        observation,
        color,
        fuelType,
        mileage,
        utility,
        classification,
        registration,
        chassi,
        renavam
      }
    });

    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  /* #swagger.tags = ['Vehicle']
  #swagger.description = 'Delete vehicle' */
  try {
    const { id } = req.params;
    await prisma.vehicle.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export{
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
}; 