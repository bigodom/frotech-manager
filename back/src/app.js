import express, { json } from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import driverRoutes from './routes/driverRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import swaggerUi from 'swagger-ui-express';
const swaggerFile = JSON.parse(readFileSync('./src/swagger.json', 'utf8'));
const app = express();

// Middleware
app.use(cors());
app.use(json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Routes
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('API is running');
});

export default app;
