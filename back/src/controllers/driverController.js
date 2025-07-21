import prisma from '../services/databaseClient.js';

const createDriver = async (req, res) => {
  /* #swagger.tags = ['Driver']
  #swagger.description = 'Create a new driver' */
  try {
    const {
      name,
      cpf,
      cnh,
      cnhCategory,
      cnhExpiration,
      phone,
      address,
      position,
      toxicologicalDate
    } = req.body;

    const driver = await prisma.driver.create({
      data: {
        name,
        cpf,
        cnh,
        cnhCategory,
        cnhExpiration: cnhExpiration ? new Date(cnhExpiration) : null,
        phone,
        address,
        position,
        toxicologicalDate: toxicologicalDate ? new Date(toxicologicalDate) : null
      }
    });

    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllDrivers = async (req, res) => {
  /* #swagger.tags = ['Driver']
  #swagger.description = 'Get all drivers' */
  try {
    const drivers = await prisma.driver.findMany();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDriverById = async (req, res) => {
  /* #swagger.tags = ['Driver']
  #swagger.description = 'Get driver by ID' */
  try {
    const { id } = req.params;
    const driver = await prisma.driver.findUnique({
      where: { id: parseInt(id) }
    });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateDriver = async (req, res) => {
  /* #swagger.tags = ['Driver']
  #swagger.description = 'Update driver' */
  try {
    const { id } = req.params;
    const {
      name,
      cpf,
      cnh,
      cnhCategory,
      cnhExpiration,
      phone,
      address,
      position,
      toxicologicalDate
    } = req.body;

    const driver = await prisma.driver.update({
      where: { id: parseInt(id) },
      data: {
        name,
        cpf,
        cnh,
        cnhCategory,
        cnhExpiration: cnhExpiration ? new Date(cnhExpiration) : null,
        phone,
        address,
        position,
        toxicologicalDate: toxicologicalDate ? new Date(toxicologicalDate) : null
      }
    });

    res.json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
  
const deleteDriver = async (req, res) => {
  /* #swagger.tags = ['Driver']
  #swagger.description = 'Delete driver' */
  try {
    const { id } = req.params;
    await prisma.driver.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export{
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
}; 