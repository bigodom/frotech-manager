import prisma from '../services/databaseClient.js';

const createVehicleTire = async (req, res) => {
  /* #swagger.tags = ['VehicleTire']
  #swagger.description = 'Associate a tire with a vehicle' */
  try {
    const {
      vehicleId,
      tireId,
      axlePosition,
      mountKm,
      mountDate,
      unmountDate,
      unmountKm,
      observation
    } = req.body;

    const vehicleTire = await prisma.vehicleTire.create({
      data: {
        vehicleId,
        tireId,
        axlePosition,
        mountKm,
        mountDate: mountDate ? new Date(mountDate) : null,
        unmountDate: unmountDate ? new Date(unmountDate) : null,
        unmountKm,
        observation
      }
    });

    res.status(201).json(vehicleTire);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllVehicleTires = async (req, res) => {
  /* #swagger.tags = ['VehicleTire']
  #swagger.description = 'Get all vehicle-tire associations' */
  try {
    const vehicleTires = await prisma.vehicleTire.findMany({
      include: {
        Vehicle: true,
        Tire: true
      }
    });
    res.json(vehicleTires);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVehicleTireById = async (req, res) => {
    /* #swagger.tags = ['VehicleTire']
    #swagger.description = 'Get vehicle-tire association by ID' */
    try {
        const { id } = req.params;
        const vehicleTire = await prisma.vehicleTire.findUnique({
            where: { id: parseInt(id) },
            include: {
                Vehicle: true,
                Tire: true
            }
        });

        if (!vehicleTire) {
            return res.status(404).json({ error: 'VehicleTire association not found' });
        }

        res.json(vehicleTire);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateVehicleTire = async (req, res) => {
    /* #swagger.tags = ['VehicleTire']
    #swagger.description = 'Update vehicle-tire association' */
    try {
        const { id } = req.params;
        const {
            vehicleId,
            tireId,
            axlePosition,
            mountKm,
            mountDate,
            unmountDate,
            unmountKm,
            observation
        } = req.body;

        const vehicleTire = await prisma.vehicleTire.update({
            where: { id: parseInt(id) },
            data: {
                vehicleId,
                tireId,
                axlePosition,
                mountKm,
                mountDate: mountDate ? new Date(mountDate) : null,
                unmountDate: unmountDate ? new Date(unmountDate) : null,
                unmountKm,
                observation
            }
        });

        res.json(vehicleTire);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteVehicleTire = async (req, res) => {
    /* #swagger.tags = ['VehicleTire']
    #swagger.description = 'Delete vehicle-tire association' */
    try {
        const { id } = req.params;
        await prisma.vehicleTire.delete({
            where: { id: parseInt(id) }
        });

        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


export {
  createVehicleTire,
  getAllVehicleTires,
  getVehicleTireById,
  updateVehicleTire,
  deleteVehicleTire
};