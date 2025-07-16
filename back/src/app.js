import express, { json } from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import driverRoutes from './routes/driverRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import fuelRoutes from './routes/fuelRoutes.js';
import swaggerUi from 'swagger-ui-express';
import maintenanceRouter from './routes/maintenanceRoutes.js';
import tireRouter from './routes/tireRoutes.js';
import vehicleTireRouter from './routes/vehicleTireRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';

const swaggerFile = JSON.parse(readFileSync('./src/swagger.json', 'utf8'));
const app = express();

// Middleware
app.use(cors());
app.use(json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Routes
app.use(driverRoutes);
app.use(vehicleRoutes);
app.use(fuelRoutes);
app.use(maintenanceRouter);
app.use(tireRouter);
app.use(vehicleTireRouter);
app.use(reviewRouter);

app.get('/', (req, res) => {
  res.send('API is running');
});

export default app;
