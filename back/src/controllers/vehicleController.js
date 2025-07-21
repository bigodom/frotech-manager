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
      fleet,
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
        fleet,
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
      fleet,
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
        fleet,
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

const updateMileage = async (req, res) => {
  /* #swagger.tags = ['Vehicle']
  #swagger.description = 'Update vehicle mileage' */
  try {
    const { id } = req.params;
    const { mileage } = req.body;

    const vehicle = await prisma.vehicle.update({
      where: { id: parseInt(id) },
      data: { mileage }
    });

    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const updateMileageByPlate = async (req, res) => {
  /* #swagger.tags = ['Vehicle']
  #swagger.description = 'Update vehicle mileage by plate' */
  try {
    const { plate, mileage } = req.body

    const vehicle = await prisma.vehicle.update({
      where: { plate },
      data: { mileage: parseFloat(mileage) }
    })

    res.json(vehicle)
  } catch (error) {
    console.error("Erro ao atualizar quilometragem:", error)
    res.status(500).json({ error: "Erro ao atualizar quilometragem" })
  }
}

const updateMileageByPlateBatch = async (req, res) => {
  /* #swagger.tags = ['Vehicle']
  #swagger.description = 'Update vehicle mileage in batch by plate' */
  try {
    const { updates } = req.body

    const results = await Promise.all(
      updates.map(async ({ plate, mileage }) => {
        try {
          const vehicle = await prisma.vehicle.update({
            where: { plate },
            data: { mileage: parseFloat(mileage) }
          })
          return { plate, success: true, vehicle }
        } catch (error) {
          return { plate, success: false, error: error.message }
        }
      })
    )

    res.json(results)
  } catch (error) {
    console.error("Erro ao atualizar quilometragem em lote:", error)
    res.status(500).json({ error: "Erro ao atualizar quilometragem em lote" })
  }
}

const getPlates = async (req, res) => {
  /* #swagger.tags = ['Vehicle']
  #swagger.description = 'Get plates' */
  try {
    const plates = await prisma.vehicle.findMany({
      select: { plate: true }
    });
    res.json(plates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export{
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  updateMileage,
  updateMileageByPlate,
  updateMileageByPlateBatch,
  getPlates
}; 