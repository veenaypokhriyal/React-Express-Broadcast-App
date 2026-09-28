import express from 'express';
import cors from 'cors';
import itemRoutes from './routes/items.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/notifications', itemRoutes);

export default app;